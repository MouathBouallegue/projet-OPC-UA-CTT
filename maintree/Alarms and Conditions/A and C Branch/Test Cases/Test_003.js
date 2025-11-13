/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_003.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2	Invoke acknowledge method passing eventId of the branch (not 0)
        3	Evaluate acknowledged condition notification

    Test Requirements:

    Expectation:
        1    Acknowledgeable condition notification is received where AckedState=FALSE BranchId is not null
        2   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=false for branch)
        3   AckedState=TRUE.  Comment property contains empty text. The branchid is removed
*/

function Test_003 () {

    this.TestName = "Test_003";

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
            
            var validate = false;
            var errorMessage = "";
            var conditionId = collector.GetConditionId( eventFields );
            var ackedState = collector.GetSelectField( eventFields, "AckedState" );
            var acked = collector.GetSelectField( eventFields, "AckedState.Id" );
            var comment = collector.GetSelectField( eventFields, "Comment" );

            print( this.TestName + ":" + this.GetName( localTestCase ) + " State " + localTestCase.State +
                " acked " + ackedState.toString() + " comment " + comment.toString() );
            if ( localTestCase.State == this.States.Initial ) {
                var status = collector.AcknowledgeAlarm( eventFields,
                    localTestCase.Comment, gServerCapabilities.DefaultLocaleId );
                if ( status.isGood() ) {
                    localTestCase.State = this.States.Acknowledged;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unable to acknowledge for " + localTestCase.BranchIdString + " " + status.toString() );
                }
            } else if ( localTestCase.State == this.States.Acknowledged ) {
                var commentText = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();
                if ( comment.DataType == BuiltInType.LocalizedText && commentText.Text == localTestCase.Comment ) {
                    if ( acked ) {
                        if ( localTestCase.RequiresConfirm ) {
                            // Confirm.  Then continue checking validations
                            var status = collector.ConfirmAlarm( eventFields,
                                localTestCase.ConfirmComment, gServerCapabilities.DefaultLocaleId );
                            if ( status.isGood() ) {
                                localTestCase.State = this.States.Confirmed;
                            } else {
                                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                    "Unable to confirm for " + localTestCase.BranchIdString + " " + status.toString() );
                            }
                        } else {
                            validate = true;
                            errorMessage = "acknowledge"
                        }
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Branch " + localTestCase.BranchIdString + " not acknowledged" );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unexpected comment after Acknowledge [" + comment.toString() + "] for branch " + localTestCase.BranchIdString );
                }
            } else if ( localTestCase.State == this.States.Confirmed ) {
                var commentText = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();
                if ( comment.DataType == BuiltInType.LocalizedText && commentText.Text == localTestCase.ConfirmComment ) {
                    var confirmed = collector.GetBooleanValue( eventFields, "ConfirmedState.Id" );
                    if ( confirmed ) {
                        validate = true;
                        errorMessage = "acknowledge and confirm";
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Branch " + localTestCase.BranchIdString + " not confirmed" );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unexpected comment after Confirm [" + comment.toString() + "] for branch " + localTestCase.BranchIdString );
                }
            }

            if ( validate ) {
                var retain = collector.GetSelectField( eventFields, "Retain" ).toBoolean();
                if ( !retain ) {
                    localTestCase.State = this.States.Completed;
                    localTestCase.TestCase.TestsPassed++;
                    collector.TestCompleted( conditionId, this.TestName );
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Branch " + localTestCase.BranchIdString + " Retain still set after " + errorMessage );
                }
            }
        }
    }

    this.CanRunTest = function ( eventFields, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) && collector.IsBranch( eventFields ) ) {
            if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName ) ) {
                canRunTest = true;
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
        if ( branchId.DataType == BuiltInType.NodeId ) {
            var branchIdString = branchId.toString();
            if ( !conditionMap.Contains( branchIdString ) ) {
                var acknowledged = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
                if ( !acknowledged ) {
                    var requiresConfirm = false;
                    var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState" );
                    if ( confirmedState.DataType > 0 ) {
                        requiresConfirm = true;
                    }

                    conditionMap.Set( branchIdString, {
                        ConditionIdString: conditionIdString,
                        BranchIdString: branchIdString,
                        TestCase: testCase,
                        State: this.States.Initial,
                        Comment: this.TestName + ":" + branchIdString + " Acknowledge",
                        RequiresConfirm: requiresConfirm,
                        ConfirmComment: this.TestName + ":" + branchIdString + " Confirm"
                    } );
                } else {
                    collector.AddMessage( testCase, collector.Categories.Activity,
                        conditionIdString + ":" + branchIdString + " Does not require Acknowledgement" +
                        " ActiveState " + collector.GetSelectField( eventFields, "ActiveState" ) +
                        " Acked " + collector.GetSelectField( eventFields, "AckedState" ) +
                        " Message " + collector.GetSelectField( eventFields, "Message" ) );
                    testCase.TestsSkipped++;
                }
            }
            localTestCase = conditionMap.Get( branchIdString );
        } else {
            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + " BranchId is not available" );
            testCase.TestsFailed++;
            collector.TestCompleted( conditionIdString, this.TestName );
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
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}



