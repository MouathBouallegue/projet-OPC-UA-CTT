/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1   Check that an Alarm appear and returns to normal 
        2   Call acknowledge and/or confirm on multiple alarm (that has returned to normal)

    Expectation:
        1   Event received and alarm ActiveState is TRUE
        2   Event received, alarm ActiveState is FALSE, Retain bit is FALSE (and it is Acknowledge and/or Confirmed)
    
    How this test works:
        For every Event: Determine if it supports AlarmConditionType
        Track alarms that go active.
        Track same alarms that go non active
        Store up to five at a time, then Acknowledge and Confirm
*/

function Test_003 () {

    this.TestName = "Test_003";

    this.States = {
        Initial: "Initial",
        WaitingToAcknowledge: "WaitingToAcknowledge",
        SendAcknowledge: "SendAcknowledge",
        FailedToAcknowledge: "FailedToAcknowledge",
        AcknowledgeConfirmation: "AcknowledgeConfirmation",
        WaitingToConfirm: "WaitingToConfirm",
        SendConfirm: "SendConfirm",
        FailedToConfirm: "FailedToConfirm",
        ConfirmConfirmation: "ConfirmConfirmation",
        CompletedNoConfirm: "CompletedNoConfirm",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MethodMinimum = 2;
    this.AcknowledgeList = [];
    this.ConfirmList = [];
    this.ConfirmListOutstanding = [];

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Alarm.CanRunTest( this.TestName, eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                ConditionId: conditionId,
                State: this.States.Initial,
                SupportsConfirm: false,
                TestCase: testCase,
                EventId: null,
                AcknowledgementTime: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        var activeState = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();

        collector.DebugPrint( conditionIdString + " Current State " + localTestCase.State + " activeState " + activeState );

        if ( localTestCase.State == this.States.Initial ) {
            if ( activeState ) {
                print( conditionIdString + " Current State " + localTestCase.State + " should move to WaitingToAcknowledge " );
                var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" );
                if ( confirmedState.DataType == BuiltInType.Boolean ) {
                    localTestCase.SupportsConfirm = true;
                }
                localTestCase.State = this.States.WaitingToAcknowledge;
            }
        } else if ( localTestCase.State == this.States.WaitingToAcknowledge ) {
            if ( !activeState ) {
                print( conditionIdString + " Current State " + localTestCase.State + " not active, adding to AcknowledgeList" );
                this.AcknowledgeList.push( conditionIdString );
                localTestCase.State = this.States.SendAcknowledge;
                localTestCase.EventId = eventFields[ collector.EventIdIndex ];
            }
        } else if ( localTestCase.State == this.States.AcknowledgeConfirmation ) {
            if ( activeState ) {
                // reset
                print( conditionIdString + " Current State " + localTestCase.State + " active, Reverting to WaitingToAcknowledge" );
                localTestCase.State = this.States.WaitingToAcknowledge;
                return;
            }

            var ackedState = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
            print( conditionIdString + " acknowledged " + ackedState );

            if ( ackedState ) {
                var validRetain = CUVariables.Alarm.ValidateRetain( conditionIdString, eventFields, testCase, collector );

                if ( localTestCase.SupportsConfirm ) {
                    this.ConfirmList.push( conditionIdString );
                    localTestCase.State = this.States.SendConfirm;
                    localTestCase.EventId = eventFields[ collector.EventIdIndex ];
                }else{
                    if ( validRetain ) {
                        testCase.TestsPassed++;
                    }
                    localTestCase.State = this.States.CompletedNoConfirm;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                localTestCase.State = this.States.FailedToAcknowledge;
                collector.AddMessage( testCase, collector.Categories.Error, localTestCase.ConditionId.toString() +
                    " AckedState is false" );
                testCase.TestsFailed++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        } else if ( localTestCase.State == this.States.ConfirmConfirmation ) {
            if ( activeState ) {
                // reset
                localTestCase.State = this.States.WaitingToAcknowledge;
                return;
            }

            var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" ).toBoolean();
            print( conditionIdString + " confirmed " + confirmedState );
            if ( confirmedState ) {
                var validRetain = CUVariables.Alarm.ValidateRetain( conditionIdString, eventFields, testCase, collector );
                if ( validRetain ) {
                    testCase.TestsPassed++;
                }
                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            } else {
                localTestCase.State = this.States.FailedToConfirm;
                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                    " ConfirmedState is false" );
                testCase.TestsFailed++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }

        if ( this.AcknowledgeList.length >= this.MethodMinimum ){
            this.SendMultiple( Identifier.AcknowledgeableConditionType_Acknowledge, 
                "Acknowledge", this.AcknowledgeList, this.States.SendAcknowledge, 
                this.States.AcknowledgeConfirmation, this.States.FailedToAcknowledge, 
                collector );
            this.AcknowledgeList = [];
        }

        print("Confirm List Length " + this.ConfirmList.length + " looking for " + this.MethodMinimum );
        if ( this.ConfirmList.length >= this.MethodMinimum ){
            this.SendMultiple( Identifier.AcknowledgeableConditionType_Confirm, 
                "Confirm", this.ConfirmList, this.States.SendConfirm, 
                this.States.ConfirmConfirmation, this.States.FailedToConfirm, collector );

            this.ConfirmList = [];
        }
    }

    this.SendMultiple = function( methodIdentifier, name, list, desiredState, 
        passedState, failedState, collector ){

        var methodNodeId = new UaNodeId( methodIdentifier );
        var comment = new UaVariant();
        comment.setLocalizedText( UaLocalizedText.New( { 
            Text: name + " Multiple", 
            Locale: gServerCapabilities.DefaultLocaleId } ) );

        var activeList = [];
        var methods = [];
        for ( var index = 0; index < list.length; index++ ){
            var key = list[ index ];
            var testCase = this.TestCaseMap.Get( key );
            print(testCase.ConditionId.toString() + " " + name  + " state " + testCase.State );
            if ( testCase.State == desiredState ){
                activeList.push( testCase );
                methods.push({
                    MethodId: methodNodeId,
                    ObjectId: testCase.ConditionId,
                    InputArguments: [ testCase.EventId, comment ]
                });
            }
        }

        if ( methods.length > 0 ){
            collector.AddMessage( testCase, collector.Categories.Activity, 
                testCase.ConditionId.toString() +
                " " + name + " call for " + methods.length + " events" );

            var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;                
            callHelper.Execute({ MethodsToCall: methods });

            var results = callHelper.Response.Results;
            for( var index = 0; index < results.length; index++ ){
                var status = new UaStatusCode( results[ index ] );
                var testCase = activeList[ index ];
                if ( !status.isGood() ){
                    collector.AddMessage( testCase, collector.Categories.Error,  
                        testCase.ConditionId.toString() + " " + " call failed " + status.toString() );
                    testCase.TestCase.TestsFailed++;
                    testCase.State = failedState;
                    collector.TestCompleted( testCase.ConditionId, this.TestName );
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity,  
                        testCase.ConditionId.toString() + ": " + name + " call passed " + status.toString() );

                    testCase.State = passedState;
                } 
            }
        }
    }

    this.Shutdown = function( collector ){
        collector.DebugFinalState( this.TestName, this.TestCaseMap );
    }
    
    this.CheckResults = function () {

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
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}
