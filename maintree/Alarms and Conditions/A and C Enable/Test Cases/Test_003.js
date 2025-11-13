/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        1. ) For an active event, first Disable the condition instance. Then call Refresh.
        2. ) Verify that an Enabled condition instance can be raised.
    
    Requirements:
        This test requires a subtype that has more states then enabled/disabled. 
        For an alarm that was active ensure that the alarm is no longer in the 
        active list (refresh) and ensure that when enabled it returns to the list. 
        [Alarm is assummed to be in the active state throughout the test]

    Expectation:
        1. ) The event is disabled, therefore an event is received to notify the event 
            is disabled and retain bit is false. The Refresh will yield nothing. 
            [An AuditConditionEnableEventType should be received (if auditing is supported).]"
        2. ) The condition is invoked.

    How this test works:
    Gather Active Events
    Disable
    After a certain amount of time, call refresh
    Watch all events
    Ensure that refresh catches only events that have not been disabled, or the disable event itself
    Reenable all alarms, and verify

*/

function Test_003 () {

    this.TestName = "Test_003";
    this.TimeUntilRefresh = null;
    // TargetRefreshTime is LocalTime
    this.TargetRefreshLocalTime = null;
    this.ActualRefreshDeviceTime = null;

    // For each ConditionId, store when it was disabled, and when it should be enabled again
    this.TestCaseMap = new KeyPairCollection();

    this.States = {
        Initial: "Initial",
        WaitingForDisabledEvent: "WaitingForDisabledEvent",
        WaitingForRefresh: "WaitingForRefresh",
        WaitingForEnabledEvent: "WaitingForEnabledEvent",
        Finished: "Finished",
        Failed: "Failed"
    };

    this.RefreshStates = {
        Unknown: "Unknown",
        Refreshed: "Refreshed",
        StartEvent: "StartEvent",
        EndEvent: "EndEvent",
        Failed: "Failed"
    }

    this.RefreshState = this.RefreshStates.Unknown;

    this.ConditionTypeName = new UaNodeId( Identifier.ConditionType ).toString();
    this.AcknowledgeableConditionTypeName = new UaNodeId( Identifier.AcknowledgeableConditionType ).toString();

    this.Initialize = function ( collector ) {

        var cycleTime = collector.GetAlarmTester().GetCycleTimeMilliSeconds();
        this.TimeUntilRefresh = cycleTime / 10;

        collector.AddIgnoreSkipsForSpecificTypes(
            [ this.ConditionTypeName, this.AcknowledgeableConditionTypeName ], this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !CUVariables.IsTestComplete( collector, "Test_002" ) ) {
            return;
        }
        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var eventType = eventFields[ collector.EventTypeIndex ];
        var alarmEventType = CUVariables.AlarmTypes.Get( eventType.toString() );

        if ( collector.CanRunTest( conditionId, this.TestName ) ) {
            if ( isDefined( alarmEventType ) ) {
                // Allow these conditions to move to the next test
                if ( alarmEventType.SpecAlarmTypeId == this.ConditionTypeName ||
                    alarmEventType.SpecAlarmTypeId == this.AcknowledgeableConditionTypeName ) {
                    collector.TestCompleted( conditionId, this.TestName );
                    return;
                }
            }
        } else {
            return;
        }

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            var activeState = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();
            if ( activeState && this.RefreshState == this.RefreshStates.Unknown ) {
                collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + ": Creation of Test Case" );
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionId: conditionId,
                    State: this.States.Initial,
                    TestCase: testCase,
                    TestCaseCompleted: false,
                    DisableTime: null,
                    TargetEnable: null, // Local
                    ActualEnableTime: null, // Device
                    RequiresEnable: null,
                    DisableEventId: null
                } );
            } else {
                return;
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( this.RefreshState == this.RefreshStates.Failed ) {
            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Refresh failed, all conditions failed" );
            return;
        }

        print( conditionIdString + " state " + localTestCase.State + " refresh state " + this.RefreshState );

        if ( localTestCase.State == this.States.Initial && this.RefreshState == this.RefreshStates.Unknown ) {
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + ": Disabling Condition" );

            var result = collector.DisableAlarm( conditionId );

            localTestCase.DisableTime = collector.GetCallResponseTime();
            localTestCase.TargetEnable = new UaDateTime( localTestCase.DisableTime );
            localTestCase.TargetEnable.addMilliSeconds( this.TimeToDisable );

            if ( result.isGood() ) {
                collector.DebugPrint( conditionIdString + " Disabled" );
                localTestCase.State = this.States.WaitingForDisabledEvent;
                localTestCase.RequiresEnable = true;
                if ( this.TargetRefreshLocalTime == null ) {
                    this.TargetRefreshLocalTime = collector.GetAlarmTester().GetLocalTimeFromDeviceTime( localTestCase.DisableTime );
                    this.TargetRefreshLocalTime.addMilliSeconds( this.TimeUntilRefresh );
                    print( "Refresh time set for " + this.TargetRefreshLocalTime.toString() + " Current time " + UaDateTime.utcNow().toString() );
                }
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Disable Result = " + result.toString() );
            }
        } else if ( localTestCase.State == this.States.WaitingForDisabledEvent ) {
            // The only reason for this is to show disabled
            var enabledState = collector.GetSelectField( eventFields, "EnabledState.Id" ).toBoolean();
            if ( enabledState ) {
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Disabled Event has true EnabledState" );
            } else {
                localTestCase.DisableEventId = eventFields[ collector.EventIdIndex ].toByteString();
                localTestCase.State = this.States.WaitingForEnabledEvent;
            }
        } else if ( localTestCase.State == this.States.WaitingForEnabledEvent ) {

            if ( this.RefreshState == this.RefreshStates.StartEvent ) {

                var current = eventFields[ collector.EventIdIndex ].toByteString().toString();
                var expected = localTestCase.DisableEventId.toString();

                if ( current == expected ) {
                    print( conditionIdString + " EXPECTED! " + localTestCase.DisableEventId.toString() )
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Bad condition waiting for refresh state " + this.RefreshState + " Expected event id " + expected + " current " + current );
                }
            } else if ( this.RefreshState == this.RefreshStates.EndEvent ) {
                var enabledState = collector.GetSelectField( eventFields, "EnabledState.Id" ).toBoolean();
                if ( enabledState ) {
                    localTestCase.State = this.States.Finished;
                    localTestCase.TestCase.TestsPassed++;
                    collector.TestCompleted( conditionId, this.TestName );
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Disabled Event has true EnabledState" );
                }
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                    "Event encountered before expected - RefreshState [" + this.RefreshState + "]" );
            }
        }
    }

    this.PreLoopAction = function ( collector ) {

        if ( !CUVariables.Test003Complete ) {
            if ( this.RefreshState == this.RefreshStates.Failed ||
                this.RefreshState == this.RefreshStates.EndEvent ) {
                var isComplete = true;
                this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                    var testCaseComplete = false;
                    if ( localTestCase.State == args.ThisTest.States.Finished ||
                        localTestCase.State == args.ThisTest.States.Failed ) {
                        testCaseComplete = true;
                    }
                    if ( !testCaseComplete ) {
                        isComplete = false;
                    }
                }, { ThisTest: this } );

                if ( isComplete ) {
                    CUVariables.Test003Complete = true;
                }
            }
        }
    }

    this.PostLoopAction = function ( collector ) {

        if ( this.TargetRefreshLocalTime != null && UaDateTime.utcNow() > this.TargetRefreshLocalTime ) {
            // Has refresh already been called
            if ( this.RefreshState == this.RefreshStates.Unknown ) {


                // Ready to refresh
                var result = collector.ConditionRefresh();
                this.ActualRefreshDeviceTime = collector.GetCallResponseTime();

                print( "Refresh Result [" + result.toString() + "] at Current time " + UaDateTime.utcNow().toString() );

                if ( result.isGood() ) {
                    this.RefreshState = this.RefreshStates.Refreshed;
                } else {
                    this.RefreshState = this.RefreshStates.Failed;
                }
            }
        }
    }

    this.NonAlarmEvent = function ( collector, eventFields ) {
        var eventType = eventFields[ collector.EventTypeIndex ];

        var eventDefinition = collector.AlarmTester.GetAlarmUtilities().GetNodeSet().Get( eventType.toString() );
        if ( isDefined( eventDefinition ) ) {
            print( "Received non alarm event " + eventDefinition._BrowseName );
        } else {
            print( "Received non alarm event " + eventType.toString() );
        }

        var eventIdentifier = eventType.toNodeId().getIdentifierNumeric();
        if ( eventIdentifier == Identifier.RefreshStartEventType ) {
            this.RefreshState = this.RefreshStates.StartEvent;
        } else if ( eventIdentifier == Identifier.RefreshEndEventType ) {
            this.RefreshState = this.RefreshStates.EndEvent;
            this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                var result = args.Collector.EnableAlarm( localTestCase.ConditionId );
                print( "Enable Result [" + result.toString() + "] at Current time " + UaDateTime.utcNow().toString() );
                if ( !result.isGood() ) {
                    args.Collector.Error( args.ThisTest.TestName, conditionIdString, localTestCase, args.ThisTest.States.Failed,
                        "Unable enable condition [" + result.toString() + "]" );
                }
            }, { Collector: collector, ThisTest: this } );
        }

    }

    this.EndTest = function ( collector ) {
        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
            args.Collector.EnableAlarm( localTestCase.ConditionId );
        }, { Collector: collector, ThisObject: this } );
    }

    this.CheckResults = function () {
        print( "CheckResults " + this.TestName );

        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase ) {
            print( conditionIdString + " Final State " + localTestCase.State );
        } );

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
        print( "Test_003 Trying to run Procedure for test" );
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        print( "Test_003 Trying to run check results for test" );
        Test.Execute( { Procedure: Test_003 } );
    }
}


