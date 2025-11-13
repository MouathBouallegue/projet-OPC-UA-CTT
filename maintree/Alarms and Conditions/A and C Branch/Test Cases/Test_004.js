/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_004.js

    Description:    
        1	Create two subscriptions (in two sessions). Run event collection.
        2	Individually acknowledge events in one session (Only Branch 0)
        3	Ack event (already acked in first subscription) in second subscription 

    Test Requirements:

    Expectation:
        1   Same event received in both subscription, each having the same EventId.
        2   all events can be acknowledged.  Second subscription also receives Acks.  Event still present with unacked branch
        3   Should return with already Acked
*/

function Test_004 () {

    this.TestName = "Test_004";

    this.States = {
        Initial: "Initial",
        WaitingForEvent: "WaitingForEvent",
        Acknowledged: "Acknowledged",
        Failed: "Failed",
        Completed: "Completed",
    }

    this.TestCaseMap = new KeyPairCollection();
    this.IdsToRemove = null;
    // Since the Preloopaction happens after the SingleLoop, 
    // the PreLoopAction may bring in more events than the SingleLoop
    this.PreviousBuffer = new KeyPairCollection();
    this.BufferMap = null;

    this.Initialize = function( collector ){
        CUVariables.Branch.CreateSubscription( this.TestName, collector );
    }

    this.PreLoopAction = function( collector ){
        var buffer = CUVariables.Branch.GetEvents( this.TestName, collector );

        this.IdsToRemove = [];
        if ( isDefined( this.BufferMap ) ){
            this.PreviousBuffer = this.BufferMap;
        }
        this.BufferMap = new KeyPairCollection();

        for ( var index = 0; index < buffer.length; index++ ) {
            this.IdsToRemove.push( buffer[ index ].EventHandle );
            var event = buffer[ index ].EventFieldList.EventFields;
            if ( !collector.IsBranch( event ) ){
                var eventId = event[ collector.EventIdIndex ];
                this.BufferMap.Set( eventId.toString(), event );
            }
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, collector ) ){
            return;
        }

        var localTestCase = this.GetTestCase( eventFields, testCase, collector );

        if ( localTestCase ){
            var conditionId = collector.GetConditionId( eventFields );
            var ackedState = collector.GetSelectField( eventFields, "AckedState" );
            var acked = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
            var comment = collector.GetSelectField( eventFields, "Comment" );
            var branch = collector.GetSelectField( eventFields, "BranchId" );
            print( this.TestName + ":" + conditionId.toString() + ":" + branch.toString() + " State " + localTestCase.State + 
                " acked " + ackedState.toString() + " comment " + comment.toString() );
            if ( localTestCase.State == this.States.Initial ){
                if ( !acked ){
                    var status = collector.AcknowledgeAlarm( eventFields, 
                        localTestCase.Comment, gServerCapabilities.DefaultLocaleId );
                    if ( status.isGood() ){
                        localTestCase.State = this.States.Acknowledged;
                    }else{
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                            "Unable to acknowledge for " + branch.toString() + " " + status.toString() );
                    }
                }
            }else if ( localTestCase.State == this.States.Acknowledged ){
                var commentText = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();
                if ( comment.DataType == BuiltInType.LocalizedText && commentText.Text == localTestCase.Comment ){
                    if ( acked ){
                        localTestCase.State = this.States.Completed;
                        localTestCase.TestCase.TestsPassed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }else{
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                            "Branch " + branch.toString() + " not acknowledged" );
                    }
                }else{
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                        "Unexpected comment after Acknowledge [" + comment.toString() + "] for branch " + localTestCase.BranchIdString );
                }
            }
        }
    }

    this.PostLoopAction = function( collector ){
        
        CUVariables.Branch.ClearEvents( this.IdsToRemove, this.TestName, collector );
    }

    this.CanRunTest = function ( eventFields, collector ) {   
        
        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) && !collector.IsBranch( eventFields ) ){
            if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName )){
                canRunTest = true;
            }
        }

        return canRunTest;
    }

    this.GetTestCase = function( eventFields, testCase, collector ){

        var conditionIdString = collector.GetConditionId( eventFields ).toString(); 

        if ( !this.TestCaseMap.Contains( conditionIdString ) ){
            this.TestCaseMap.Set( conditionIdString, {
                TestCase: testCase,
                State: this.States.Initial,
                Comment: this.TestName + ": Acknowledge"
            });
        }

        return this.TestCaseMap.Get( conditionIdString );
    }

    this.GetName = function( localTestCase ){
        return localTestCase.ConditionIdString + ":" + localTestCase.BranchIdString; 
    }

    this.CheckResults = function () {

        CUVariables.AlarmCollector.PrintDataStore();

        return CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );
    }

    if ( isDefined( CUVariables.AutoRun ) ) {
        if ( !CUVariables.AutoRun ) {
            CUVariables.AlarmCollector.RunSingleTest( CUVariables, this.TestName, this );
            return this.CheckResults();
        } else if ( CUVariables.CheckResults ) {
            return this.CheckResults();
        }
    }
}

if ( isDefined( CUVariables.AutoRun ) ) {
    if ( !CUVariables.AutoRun ) {
        Test.Execute( { Procedure: Test_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_004 } );
    }
}



