/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_002.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType  (or subtype) that supports branching
        2	Call AddComment() and pass a unique comment.
        3	Invoke Acknowledge() method passing eventId as received and NULL comment (both locale and text)
        4	Evaluate acknowledged condition notification

    Test Requirements:
        If AddComment() is not supported then this whole test must be skipped.

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE, BranchId is not 0
        2   Success.
        3   Call is successful.  A second acknowledgeable condition notification is received 
        4   AckedState=TRUE.  Comment property contains text of comment argument previously passed (i.e., existing comment is unchanged).  Branch still exists.
*/

function Test_002 () {
    this.TestName = "Test_002";

    this.States = {
        Initial: "Initial",
        Commented: "Commented",
        Acknowledged: "Acknowledged",
        Failed: "Failed",
        Completed: "Completed",
    }

    /**
     * Multi-level map of test cases, first level is ConditionId, and the second level map is
     * for multiple Branches for the ConditionId
     */
    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, collector ) ){
            return;
        }

        var localTestCase = this.GetTestCase( eventFields, testCase, collector );

        if ( localTestCase ){
            var conditionId = collector.GetConditionId( eventFields );
            var ackedState = collector.GetSelectField( eventFields, "AckedState" );
            var acked = collector.GetSelectField( eventFields, "AckedState.Id" );
            var comment = collector.GetSelectField( eventFields, "Comment" );
            print( this.TestName + ":" + this.GetName( localTestCase ) + " State [" + localTestCase.State + 
                "] acked [" + ackedState.toString() + "] comment [" + comment.toString() + "]" );
            if ( localTestCase.State == this.States.Initial ){
                var status = collector.AddComment( eventFields, localTestCase.Comment, 
                    gServerCapabilities.DefaultLocaleId );
                if ( status.isGood() ){
                    localTestCase.State = this.States.Commented;
                }else{
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                        "Unable to comment for " + localTestCase.BranchIdString + " " + status.toString() );
                }
            }else if ( localTestCase.State == this.States.Commented ){
                var commentText = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();
                if ( comment.DataType == BuiltInType.LocalizedText && commentText.Text == localTestCase.Comment ){
                    var status = collector.AcknowledgeAlarm( eventFields, "", "" );
                    if ( status.isGood() ){
                        localTestCase.State = this.States.Acknowledged;
                    }else{
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                            "Unable to acknowledge for " + localTestCase.BranchIdString + " " + status.toString() );
                    }
                }else{
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                        "Unexpected comment after AddComment [" + comment.toString() + "] for branch " + localTestCase.BranchIdString );
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
                            "Branch " + localTestCase.BranchIdString + " not acknowledged" );
                    }
                }else{
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                        "Unexpected comment after Acknowledge [" + comment.toString() + "] for branch " + localTestCase.BranchIdString );
                }
            }
        }
    }

    this.CanRunTest = function ( eventFields, collector ) {   
        
        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) && collector.IsBranch( eventFields ) ){
            if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName )){
                canRunTest = true;
            }
        }

        return canRunTest;
    }

    this.GetTestCase = function( eventFields, testCase, collector ){

        var conditionIdString = collector.GetConditionId( eventFields ).toString(); 

        if ( !this.TestCaseMap.Contains( conditionIdString ) ){
            this.TestCaseMap.Set( conditionIdString, new KeyPairCollection() );
        }

        var localTestCase = null;
        var conditionMap = this.TestCaseMap.Get( conditionIdString );
        var branchId = collector.GetSelectField( eventFields, "BranchId" );
        if ( branchId.DataType == BuiltInType.NodeId ){
            var branchIdString = branchId.toString();
            if ( !conditionMap.Contains( branchIdString ) ){
                var acknowledged = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
                if ( !acknowledged ){
                    conditionMap.Set( branchIdString, {
                        ConditionIdString: conditionIdString,
                        BranchIdString: branchIdString,
                        TestCase: testCase,
                        State: this.States.Initial,
                        Comment: this.TestName + ":" + branchIdString + " Add Comment"
                    });
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, 
                        conditionIdString + ":" + branchIdString + " Does not require Acknowledgement" +
                        " ActiveState " + collector.GetSelectField( eventFields, "ActiveState" ) + 
                        " Acked " + collector.GetSelectField( eventFields, "AckedState" ) + 
                        " Message " + collector.GetSelectField( eventFields, "Message" )  ); 
                    testCase.TestsSkipped++;
                }
            }
            localTestCase = conditionMap.Get( branchIdString );
        }else{
            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + " BranchId is not available" );
            testCase.TestsFailed++;
            collector.TestCompleted( conditionIdString, this.TestName );
        }

        return localTestCase;
    }

    this.GetName = function( localTestCase ){
        return localTestCase.ConditionIdString + ":" + localTestCase.BranchIdString; 
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
        Test.Execute( { Procedure: Test_002 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_002 } );
    }
}



