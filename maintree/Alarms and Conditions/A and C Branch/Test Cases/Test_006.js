/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_006.js

    Description:    
        1	create event subscription and find condition in subscription with a non-0 branchId
        2	Invoke acknowledge method passing eventId as received and NULL comment (for non-0 branch)
        3	repeat for multiple events

    Test Requirements:

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE
        2   Orginal event is still unacked (branch 0)
        3   Orginal event is still unacked (branch 0)
*/

function Test_006 () {

    this.TestName = "Test_006";

    this.States = {
        Initial: "Initial",
        Acknowledged: "Acknowledged",
        Collecting: "Collecting",
        AcknowledgedMultiple: "AcknowledgedMultiple",
        Failed: "Failed",
        Completed: "Completed",
    }

    this.MultipleEventCount = 3;
    this.TimeToWaitToEnd = 5; // Seconds

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var isBranch = collector.IsBranch( eventFields );
        var ackedState = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( isBranch && !ackedState ) {
                this.TestCaseMap.Set( conditionIdString, {
                    TestCase: testCase,
                    State: this.States.Initial,
                    InitialBranch: eventFields,
                    InitialBranchId: null,
                    Branches: [],
                    BranchResults: new KeyPairCollection(),
                    LocalEndTestTime: null,
                    GotFinalEvent: false
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( localTestCase ) {

            var branchId = collector.GetSelectField( eventFields, "BranchId" ).toNodeId();

            collector.DebugPrint( this.TestName + ":" + conditionIdString + ":" + branchId.toString() + " state " + localTestCase.State + " branch count " + localTestCase.Branches.length );

            if ( localTestCase.State == this.States.Initial ) {
                if ( isBranch ){
                    var status = collector.AcknowledgeAlarm( eventFields,
                        this.TestName + "Acknowledge Initial Branch", gServerCapabilities.DefaultLocaleId );
                    if ( status.isGood() ) {
                        localTestCase.InitialBranchId = branchId;
                        localTestCase.State = this.States.Acknowledged;
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Unable to acknowledge initial branch " + branchId.toString() + " " + status.toString() );
                    }
                }
            } else if ( !isBranch && ackedState ) {
                // There is no condition where branch 0 should be acknowledged 
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                    "Test State " + localTestCase.State + " Branch 0 is Acknowledged" );
            } else if ( localTestCase.State == this.States.Acknowledged ) {
                if ( isBranch ) {
                    if ( branchId.equals( localTestCase.InitialBranchId ) ) {
                        if ( !ackedState ) {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Initial branch " + branchId.toString() + " not acknowledged correctly" );
                        } else {
                            localTestCase.State = this.States.Collecting;
                        }
                    } else {
                        localTestCase.Branches.push( eventFields );
                        if ( localTestCase.Branches.length > 1 ) {
                            // Should have received an ack event by now
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Did not receive acked state for Initial branch " + branchId.toString() );
                        }
                    }
                }
            } else if ( localTestCase.State == this.States.Collecting ) {
                if ( isBranch && !branchId.equals( localTestCase.InitialBranchId ) ) {
                    localTestCase.Branches.push( eventFields );
                }

                if ( localTestCase.Branches.length >= this.MultipleEventCount ) {
                    var methods = [];
                    for ( var index = 0; index < localTestCase.Branches.length; index++ ) {
                        var event = localTestCase.Branches[ index ];
                        var comment = UaLocalizedText.New( {
                            Text: this.TestName + " Acknowledging Branch " + collector.GetSelectField( event, "BranchId" ).toString(),
                            Locale: gServerCapabilities.DefaultLocaleId
                        } );

                        var commentVariant = new UaVariant();
                        commentVariant.setLocalizedText( comment );

                        methods.push( {
                            MethodId: new UaNodeId( Identifier.AcknowledgeableConditionType_Acknowledge ),
                            ObjectId: collector.GetConditionId( event ),
                            InputArguments: [ event[ collector.EventIdIndex ], commentVariant ]
                        } );
                    }

                    var result = collector.Call( {
                        MethodsToCall: methods,
                        SuppressMessaging: true
                    } );

                    if ( result.isGood() ) {

                        localTestCase.LocalEndTestTime = collector.GetAlarmTester().GetLocalTimeFromDeviceTime(
                            collector.GetCallResponseTime() );
                        localTestCase.LocalEndTestTime.addSeconds( this.TimeToWaitToEnd );

                        var response = collector.GetCallResponse();

                        var success = true;
                        for ( var index = 0; index < localTestCase.Branches.length; index++ ) {
                            if ( !response.Results[ index ].StatusCode.isGood() ) {
                                success = false;
                                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                    "Acknowlege Multiple Branches failed specific branchId [" +
                                    response.Results[ index ].StatusCode.toString() + "]" );
                            } else {
                                localTestCase.BranchResults.Set( branchId.toString(), false );
                            }
                        }

                        if ( success ) {
                            localTestCase.State = this.States.AcknowledgedMultiple;
                        }
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Acknowlege Multiple Branches failed [" + result.toString() + "]" );
                    }
                }
            } else if ( localTestCase.State == this.States.AcknowledgedMultiple ) {
                if ( branchId ) {
                    var branchIdString = branchId.toString();
                    if ( localTestCase.BranchResults.Contains( branchIdString ) ) {
                        if ( ackedState ) {
                            localTestCase.BranchResults.Set( branchIdString, true );
                            var complete = true;
                            localTestCase.BranchResults.Iterate( function ( branchIdString, ackResult ) {
                                if ( !ackResult ) {
                                    complete = false;
                                }
                            } );
                            if ( complete ) {
                                localTestCase.TestCase.TestsPassed++;
                                localTestCase.State = this.States.Completed;
                                collector.TestCompleted( conditionId, this.TestName );
                            }
                        } else {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Acknowlege Multiple Branches for branchId " + branchIdString + " did not result in acknowledged state" );
                        }
                    } else {
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity, conditionId.toString(),
                            "Received extra branchId event " + branchIdString );
                    }
                }

                if ( localTestCase.State == this.States.AcknowledgedMultiple ) {
                    if ( localTestCase.LocalEndTestTime.msecsTo( UaDateTime.utcNow() ) > 0 ) {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Acknowlege Multiple Branches failed to respond with events in reasonable time" );
                    }
                }
            }
        }
    }


    this.CanRunTest = function ( eventFields, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) ) {
            if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName ) ) {
                canRunTest = true;
            }
        }

        return canRunTest;
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
        Test.Execute( { Procedure: Test_006 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_006 } );
    }
}



