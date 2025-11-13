/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Specify multiple methods in one "Call" where method, for example: (1)=Enable; (2)=Disable; (3)=Disable; (4)=Enable.
    
    Requirements:
        Read the state of each condition first (enabled/disabled etc.) 
        and then adjust the call accordingly (e.g. disable an enabled condition etc.)
    
    Expectation:
        All condition instances are modified.

    How this test works:
        For all events received,
        Do a multiple Call and check the results.


        Ideally, there are three calls done.
        Gather a set of events.
        Disable some events
        Wait for some time, and gather more events
        This one should enable the previous events, and disable any others that come in
        Last call enables the remainder.
*/

function Test_008 () {

    this.TestName = "Test_008";
    this.EnableNodeId = new UaNodeId( Identifier.ConditionType_Enable );
    this.DisableNodeId = new UaNodeId( Identifier.ConditionType_Disable );

    this.TimeBetweenCalls = null;
    this.TargetFirstCallLocalTime = null;
    this.TargetSecondCallLocalTime = null;
    this.TargetLastCallLocalTime = null;

    this.waitTime = null;
    this.triggerTime = null;

    this.initialList = new KeyPairCollection();
    this.secondaryList = new KeyPairCollection();
    this.TestCaseMap = new KeyPairCollection();

    this.States = {
        WaitingForFirstCall: "WaitingForFirstCall",
        Initial: "Initial",
        FailedFirstCall: "FailedFirstCall",
        Second: "Second",
        WaitingForSecondCall: "WaitingForSecondCall",
        FailedSecondCall: "FailedSecondCall",
        WaitingForLastCall: "WaitingForLastCall",
        Completed: "Completed",
        Failed: "Failed"
    };

    this.State = null;

    this.Initialize = function ( collector ) {
        var cycleTime = collector.GetAlarmTester().GetCycleTimeMilliSeconds();
        this.TimeBetweenCalls = cycleTime / 10;

        this.State = this.States.Initial;
    }

    this.CallType = {
        FirstCall: "First Method Call",
        SecondCall: "Second Method Call",
        FinalCall: "Final Method Call"
    }

    this.PostLoopAction = function ( collector ) {

        var now = UaDateTime.utcNow();

        if ( this.State == this.States.WaitingForFirstCall ) {
            if ( now > this.TargetFirstCallLocalTime ) {
                this.MethodCall( collector, this.CallType.FirstCall, this.States.WaitingForSecondCall );
            }

        } else if ( this.State == this.States.WaitingForSecondCall ) {
            if ( now > this.TargetSecondCallLocalTime ) {
                this.MethodCall( collector, this.CallType.SecondCall, this.States.WaitingForLastCall );
            }
        } else if ( this.State == this.States.WaitingForLastCall ) {
            if ( now > this.TargetLastCallLocalTime ) {
                this.MethodCall( collector, this.CallType.SecondCall, this.States.Completed );
            }
        }

        if ( !CUVariables.Test008Complete ) {
            if ( this.State == this.States.Failed ||
                this.State == this.States.Completed ) {
                var isComplete = true;
                this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                    var testCaseComplete = false;
                    if ( localTestCase.Failed || localTestCase.Finished ) {
                        testCaseComplete = true;
                    }
                    if ( !testCaseComplete ) {
                        isComplete = false;
                    }
                }, { ThisTest: this } );

                if ( isComplete ) {
                    CUVariables.Test008Complete = true;
                }
            }
        }
    }

    this.MethodCall = function ( collector, callType, nextState ) {

        var runEnableAll = false;

        var testMethods = [];
        this.TestCaseMap.Iterate( function ( conditionIdString, testCase, args ) {

            if ( !testCase.Completed ) {
                var methodId = args.ThisTest.EnableNodeId;
                if ( !testCase.SetToDisabled ) {

                    print( conditionIdString + " setting to disabled for the " + callType );
                    methodId = args.ThisTest.DisableNodeId;
                } else {
                    print( conditionIdString + " setting to enabled for the " + callType );
                }

                if ( !isDefined( testCase.ConditionIdVariant ) ) {
                    print( "UNEXPECTED = " + conditionIdString );
                    debugger;
                }

                testMethods.push( {
                    MethodId: methodId,
                    ObjectId: testCase.ConditionIdVariant
                } );
            }

        }, { ThisTest: this } );

        if ( testMethods.length > 0 ) {
            var result = collector.Call( { MethodsToCall: testMethods, SuppressMessaging: true } );

            if ( result.isGood() ) {

                this.State = nextState;

                var response = collector.GetCallResponse();
                if ( testMethods.length == response.Results.length ) {
                    for ( var index = 0; index < testMethods.length; index++ ) {
                        var testMethod = testMethods[ index ];
                        var testResult = response.Results[ index ];
                        var conditionIdString = testMethod.ObjectId.toString();
                        var isDisableCall = true;
                        if ( testMethod.MethodId == this.EnableNodeId ) {
                            isDisableCall = false;
                        }

                        var testCase = this.TestCaseMap.Get( conditionIdString );
                        if ( isDefined( testCase ) ) {
                            if ( testResult.StatusCode.isGood() ) {
                                if ( isDisableCall ) {
                                    testCase.SetToDisabled = true;
                                } else {
                                    testCase.SetToEnabled = true;
                                }
                            } else {
                                var command = "disable";
                                if ( !isDisableCall ) {
                                    command = "enable"
                                }
                                collector.Error( this.TestName,
                                    conditionIdString, localTestCase, this.State.Failed,
                                    "Unable to " + command + " specific condition on " + callType + " attempt [" +
                                    testResult.statusCode.toString() + "]" );
                            }
                        } else {
                            var unexpected = true;
                            debugger;
                        }
                    }
                } else {
                    var unexpected = true;
                    debugger;
                }
            } else {
                this.State = this.States.Failed;
                this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                    args.Collector.Error( args.ThisObject.TestName,
                        conditionIdString, localTestCase, args.ThisObject.Failed,
                        callType + " failed [" + result + "]" );
                }, { ThisObject: this, Collector: collector } );
                runEnableAll = true;
            }
        }

        if ( runEnableAll ) {
            this.EndTest( collector );
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !CUVariables.IsTestComplete( collector, "Test_003" ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var enabled = collector.GetSelectField( eventFields, "EnabledState" );
        var enabledId = collector.GetSelectField( eventFields, "EnabledState.Id" );

        print( this.TestName + " TestEvent " + conditionIdString + " Enabled " + enabled.toString() );

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set(
                conditionIdString,
                {
                    ConditionIdVariant: conditionId,
                    TestCase: testCase,
                    SetToDisabled: false,
                    ConfirmDisabled: false,
                    SetToEnabled: false,
                    ConfirmEnabled: false,
                    Completed: false,
                    Failed: false
                }
            );
        }

        if ( this.State == this.States.Initial ) {
            this.TargetFirstCallLocalTime = new UaDateTime.utcNow();
            this.TargetFirstCallLocalTime.addMilliSeconds( this.TimeBetweenCalls );
            this.TargetSecondCallLocalTime = new UaDateTime( this.TargetFirstCallLocalTime );
            this.TargetSecondCallLocalTime.addMilliSeconds( this.TimeBetweenCalls );
            this.TargetLastCallLocalTime = new UaDateTime( this.TargetSecondCallLocalTime );
            this.TargetLastCallLocalTime.addMilliSeconds( this.TimeBetweenCalls );
            this.State = this.States.WaitingForFirstCall;
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        var expectedEnabledState = false;
        if ( localTestCase.SetToEnabled ) {
            expectedEnabledState = true;
        }

        if ( this.State == this.States.WaitingForSecondCall ||
            this.State == this.States.WaitingForLastCall ) {

            var expectedEnabledState = false;
            var errorMessage = "Enabled";

            if ( localTestCase.SetToEnabled ) {
                expectedEnabledState = true;
                errorMessage = "Disabled";
            }

            if ( localTestCase.SetToDisabled ) {
                if ( enabledId == expectedEnabledState ) {
                    if ( expectedEnabledState ) {
                        localTestCase.ConfirmEnabled = true;
                        localTestCase.Completed = true;
                        localTestCase.TestCase.TestsPassed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    } else {
                        localTestCase.ConfirmDisabled = true;
                    }

                } else {
                    collector.Error( this.TestName,
                        conditionIdString, localTestCase, this.States.Failed,
                        "Received unexpected event " + errorMessage );
                    localTestCase.Failed = true;
                }
            }
        } else if ( this.State == this.States.Completed ) {
            if ( !localTestCase.Completed ) {
                if ( enabledId ) {
                    localTestCase.ConfirmEnabled = true;
                    localTestCase.Completed = true;
                    localTestCase.TestCase.TestsPassed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                collector.Error( this.TestName,
                    conditionIdString, localTestCase, this.States.Failed,
                    "Received unexpected event - expecting enabled" );
                localTestCase.Failed = true;
            }
        }
    }

    this.EndTest = function ( collector ) {
        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
            if ( !localTestCase.SetToEnabled ) {
                args.Collector.EnableAlarm( localTestCase.ConditionId );
            }
        }, { Collector: collector } );
    }

    this.CheckResults = function () {

        print( this.TestName + " Final State = " + this.State );

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
        Test.Execute( { Procedure: Test_008 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_008 } );
    }
}
