/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_007.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2	Invoke acknowledge method passing eventId of the branch (not 0)
        3	Invoke Confirm method passing eventId of the branch (same as above)
        4	Evaluate acknowledged condition notification

    Test Requirements:
        This test requires confirmation, if confirmation is not available this test shall be skipped

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE BranchId is not null
        2   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=true for branch)
        3   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=false for branch)
        4   AckedState=TRUE.  Comment property contains empty text. The branchid is removed
*/

function Test_007 () {

    this.TestName = "Test_007";

    this.States = {
        Initial: "Initial",
        Acknowledged: "Acknowledged",
        Confirmed: "Confirmed",
        Failed: "Failed",
        Completed: "Completed",
    }

    /**
     * Multi-level map of test cases, first level is ConditionId, and the second level map is
     * for multiple Branches for the ConditionId
     */
    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }

        var localTestCase = this.GetTestCase( eventFields, testCase, collector );

        if ( localTestCase ) {
            var conditionId = collector.GetConditionId( eventFields );
            var ackedState = collector.GetSelectField( eventFields, "AckedState" );
            var acked = collector.GetSelectField( eventFields, "AckedState.Id" );
            var retain = collector.GetSelectField( eventFields, "Retain" ).toBoolean();
            var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" ).toBoolean();
            var comment = collector.GetSelectField( eventFields, "Comment" );
            print( this.TestName + ":" + this.GetName( localTestCase ) + " State " + localTestCase.State +
                " acked " + ackedState.toString() + " comment " + comment.toString() );
            if ( localTestCase.State == this.States.Initial ) {
                var status = collector.AcknowledgeAlarm( eventFields,
                    localTestCase.AckComment, gServerCapabilities.DefaultLocaleId );
                if ( status.isGood() ) {
                    localTestCase.State = this.States.Acknowledged;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unable to acknowledge for " + localTestCase.BranchIdString + " " + status.toString() );
                }
            } else if ( localTestCase.State == this.States.Acknowledged ) {
                if ( acked && retain && !confirmedState ) {
                    var status = collector.ConfirmAlarm( eventFields,
                        localTestCase.ConfirmComment, gServerCapabilities.DefaultLocaleId );
                    if ( status.isGood() ) {
                        localTestCase.State = this.States.Confirmed;
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Unable to confirm for " + localTestCase.BranchIdString + " " + status.toString() );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Branch Unexpected state after Acknowledge AckedState:" + acked + " ConfirmedState:" + confirmedState + " Retain:" + retain );
                }
            } else if ( localTestCase.State == this.States.Confirmed ) {
                if ( acked && !retain && confirmedState ) {
                    localTestCase.TestCase.TestsPassed++;
                    localTestCase.State = this.States.Completed;
                    collector.TestCompleted( conditionId, this.TestName );
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Branch Unexpected state after Confirm AckedState:" + acked + " ConfirmedState:" + confirmedState + " Retain:" + retain );
                }
            }
        }
    }

    this.CanRunTest = function ( eventFields, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) && collector.IsBranch( eventFields ) ) {
            // Ensure there is confirm for this test
            var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState" );
            if ( confirmedState.DataType != 0 ) {
                if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName ) ) {
                    canRunTest = true;
                }
            }
        }

        return canRunTest;
    }

    this.GetTestCase = function ( eventFields, testCase, collector ) {

        var conditionIdString = collector.GetConditionId( eventFields ).toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, new KeyPairCollection() );
        }

        var localTestCase = null;
        var conditionMap = this.TestCaseMap.Get( conditionIdString );
        var branchId = collector.GetSelectField( eventFields, "BranchId" );
        if ( collector.IsBranch( eventFields ) ) {
            if ( branchId.DataType == BuiltInType.NodeId ) {
                var branchIdString = branchId.toString();
                if ( !conditionMap.Contains( branchIdString ) ) {
                    var acknowledged = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
                    if ( !acknowledged ) {
                        conditionMap.Set( branchIdString, {
                            ConditionIdString: conditionIdString,
                            BranchIdString: branchIdString,
                            TestCase: testCase,
                            State: this.States.Initial,
                            AckComment: this.TestName + ":" + branchIdString + " Acknowledge",
                            BranchComment: this.TestName + ":" + branchIdString + " Confirm"
                        } );
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Activity,
                            conditionIdString + ":" + branchIdString + " Does not require Acknowledgement" +
                            " ActiveState " + collector.GetSelectField( eventFields, "ActiveState" ) +
                            " Acked " + collector.GetSelectField( eventFields, "AckedState" ) +
                            " Message " + collector.GetSelectField( eventFields, "Message" ) );
                    }
                }
                localTestCase = conditionMap.Get( branchIdString );
            } else {
                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + " BranchId is not available" );
                testCase.TestsFailed++;
                collector.TestCompleted( conditionIdString, this.TestName );
            }
        }

        return localTestCase;
    }

    this.GetName = function ( localTestCase ) {
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
        Test.Execute( { Procedure: Test_007 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_007 } );
    }
}



