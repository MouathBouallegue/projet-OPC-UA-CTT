/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1. ) For each enabled condition, invoke the Disable method (using the well known MethodId from the type definition). 
            Confirm the EnabledState, TransitionTime, and Retain properties..
        2. ) For each disabled condition , invoke the Enable method (using the well known MethodId from the type definition). 
            Read the EnabledState, TransitionTime, and Retain properties.
        Check any derived types, ensure that generates Alarm/Conditions comply 
        with the expected structure of the parent type.

    Requirements:
        Ensure that the condition is returned to enable when test is complete.  
        This test can be limited to the a subset of all alarms that can be generated, 
        but it should be tried against all supported Condition subtypes. 
        If an instance exist , use both the methodid from the type and from the instance, 
        ensure both are supported.

    Expectation:
        1. ) Each call is successful. The EnabledState is FALSE. The Retain property is FALSE. 
            The TransitionTime is within the expected time-frame for when the call was made. 
            [An AuditConditionEnableEventType should be received (if auditing is supported).]"
        2. ) "Each call is successful. The EnabledState is TRUE. The Retain property change to 
            TRUE for any conditions that are in an interesting state. The TransitionTime is 
            within the expected time-frame for when the call was made. 
            [An AuditConditionEnableEventType should be received (if auditing is supported).]"

    How this test works:
        The AlarmCollector will collect all current events from the CTT, and call this function's TestEvent
        An Event is disabled, with the intent of enabling it again in the time defined by TimeToDisable.
        Since TestEvent is only called on events, NonEventCheck is called on a regular basis.  When time permits,
        the event is enabled, and all events are checked to ensure that no events for the specified ConditionId
        were received. 
*/

function Test_002 () {

    this.TestName = "Test_002";

    this.TestStates = {
        Initial: "Initial",
        ConditionDisabled: "ConditionDisabled",
        ConditionEnabled: "ConditionEnabled",
        InstanceDisabled: "InstanceDisabled",
        InstanceEnabled: "InstanceEnabled",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        var enabled = collector.GetSelectField( eventFields, "EnabledState" ).toString();
        var enabledId = collector.GetSelectField( eventFields, "EnabledState.Id" ).toBoolean();
        var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
        var eventTime = new UaDateTime( time );
        // Its quite feasible that the event time is set before the enable/Disable Call
        eventTime.addMilliSeconds( 100 );


        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                ConditionIdVariant: conditionId,
                TestCase: testCase,
                State: this.TestStates.Initial,
                InstanceEnableMethod: null,
                InstanceDisableMethod: null,
                ConditionDisableTime: null,
                ConditionEnableTime: null,
                InstanceDisableTime: null,
                InstanceEnableTime: null,
                RequiresEnable: false
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        collector.DebugPrint( this.TestName + " - " + conditionId + " enabled " + enabled + " State " + localTestCase.State );

        if ( localTestCase.State == this.TestStates.Initial ) {
            this.GetInstanceMethods( conditionIdString, localTestCase, eventFields, collector );
            var result = collector.DisableAlarm( conditionId );
            localTestCase.ConditionDisableTime = collector.GetCallResponseTime();

            if ( result.isGood() ) {
                localTestCase.State = this.TestStates.ConditionDisabled;
                localTestCase.RequiresEnable = true;
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed, "Condition Disable Result = " + result.toString() );
            }
        } else if ( localTestCase.State == this.TestStates.ConditionDisabled ) {
            if ( eventTime < localTestCase.ConditionDisableTime ) {
                collector.DebugPrint( this.TestName + ":" + conditionIdString + " ConditionDisabled Skip " + localTestCase.ConditionDisableTime.toString() + " Event time " + time.toString() + " Enabled - [" + enabled + "]" );
                return;
            }

            var expectedEnabledState = false;
            if ( !this.ValidateVariables( expectedEnabledState, localTestCase, eventFields, collector ) ) {
                return;
            }

            var result = collector.EnableAlarm( conditionId );
            localTestCase.ConditionEnableTime = collector.GetCallResponseTime();
            if ( result.isGood() ) {
                localTestCase.ConditionEnabled = true;
                localTestCase.State = this.TestStates.ConditionEnabled;
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed, "Condition Enable Result = " + result.toString() );
            }
        } else if ( localTestCase.State == this.TestStates.ConditionEnabled ) {
            if ( eventTime < localTestCase.ConditionEnableTime ) {
                collector.DebugPrint( this.TestName + ":" + conditionIdString + " ConditionEnabled Skip " + localTestCase.ConditionEnableTime.toString() + " Event time " + time.toString() + " Enabled - [" + enabled + "]" );
                return;
            }

            var expectedEnabledState = true;
            if ( !this.ValidateVariables( expectedEnabledState, localTestCase, eventFields, collector ) ) {
                return;
            }

            if ( localTestCase.InstanceDisableMethod == null ) {
                collector.DebugPrint( "Unable to find disable method for " + conditionIdString );
                localTestCase.State = this.TestStates.Completed;
                localTestCase.TestCase.TestsPassed++;
                collector.TestCompleted( conditionId, this.TestName );
            } else {
                var result = collector.Call( {
                    MethodsToCall: [ {
                        MethodId: localTestCase.InstanceDisableMethod,
                        ObjectId: localTestCase.ConditionIdVariant
                    } ],
                    SuppressMessaging: true
                } );

                collector.DebugPrint( this.TestName + ":" + conditionIdString + " Calling " +
                    localTestCase.InstanceDisableMethod.toString() + " for " +
                    localTestCase.ConditionIdVariant.toString() + " result [" +
                    result.toString() + "]" );


                localTestCase.InstanceDisableTime = collector.GetCallResponseTime();

                if ( result.isGood() ) {
                    localTestCase.State = this.TestStates.InstanceDisabled;
                    localTestCase.RequiresEnable = true;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed, "Instance Disable Result = " + result.toString() );
                }
            }
        } else if ( localTestCase.State == this.TestStates.InstanceDisabled ) {
            if ( eventTime < localTestCase.InstanceDisableTime ) {
                collector.DebugPrint( this.TestName + ":" + conditionIdString + " InstanceDisabled Skip " + localTestCase.InstanceDisableTime.toString() + " Event time " + time.toString() + " Enabled - [" + enabled + "]" );
                return;
            }


            var expectedEnabledState = false;
            if ( !this.ValidateVariables( expectedEnabledState, localTestCase, eventFields, collector ) ) {
                return;
            }

            if ( localTestCase.InstanceEnableMethod == null ) {
                // Disable method exists, but enable does not
                collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed,
                    "No Instance Disable method when enable exists" );
            } else {
                var result = collector.Call( {
                    MethodsToCall: [ {
                        MethodId: localTestCase.InstanceEnableMethod,
                        ObjectId: localTestCase.ConditionIdVariant
                    } ],
                    SuppressMessaging: true
                } );

                collector.DebugPrint( this.TestName + ":" + conditionIdString + " Calling " +
                    localTestCase.InstanceEnableMethod.toString() + " for " +
                    localTestCase.ConditionIdVariant.toString() + " result [" +
                    result.toString() + "]" );

                localTestCase.InstanceEnableTime = collector.GetCallResponseTime();

                if ( result.isGood() ) {
                    localTestCase.State = this.TestStates.InstanceEnabled;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed, "Instance Enable Result = " + result.toString() );
                }
            }
        } else if ( localTestCase.State == this.TestStates.InstanceEnabled ) {
            if ( eventTime < localTestCase.InstanceEnableTime ) {
                print( this.TestName + ":" + conditionIdString + " InstanceEnabled Skip " + localTestCase.InstanceEnableTime.toString() + " Event time " + time.toString() + " Enabled - [" + enabled + "]" );
                //collector.Skip( this.TestName, conditionId, localTestCase, this.TestStates.Completed );
                return;
            }

            var expectedEnabledState = true;
            if ( !this.ValidateVariables( expectedEnabledState, localTestCase, eventFields, collector ) ) {
                return;
            }

            localTestCase.RequiresEnable = false;
            localTestCase.State = this.TestStates.Completed;
            localTestCase.TestCase.TestsPassed++;
            collector.TestCompleted( conditionId, this.TestName );
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( this.TestCaseMap.Length() > 0 ) {
            if ( !CUVariables.Test002Complete ) {
                var complete = true;
                this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                    var testComplete = false;
                    if ( localTestCase.State == args.ThisTest.TestStates.Completed ||
                        localTestCase.State == args.ThisTest.TestStates.Failed ) {
                        testComplete = true;
                    }

                    if ( !testComplete ) {
                        complete = false;
                    }
                }, { ThisTest: this } );

                if ( complete ) {
                    this.EndTest( collector );
                    CUVariables.Test002Complete = true;
                }
            }
        }
    }

    this.EndTest = function ( collector ) {
        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase ) {
            print( "Test_002 End Test " + conditionIdString + " requires Enable - " + localTestCase.RequiresEnable );
            if ( localTestCase.RequiresEnable ) {
                if ( collector.EnableAlarm( localTestCase.ConditionIdVariant ) ) {
                    localTestCase.RequiresEnable = false;
                }
            }
        } );
    }

    this.ValidateVariables = function ( expectedEnabledState, localTestCase, eventFields, collector ) {
        var success = true;
        var conditionId = collector.GetConditionId( eventFields );
        var retain = collector.GetBooleanValue( eventFields, "Retain" );
        var enabledId = collector.GetBooleanValue( eventFields, "EnabledState.Id" );

        if ( enabledId != expectedEnabledState ) {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error, conditionId.toString(),
                "Unexpected enabled state, expecting " + expectedEnabledState + " for test state " + localTestCase.State );
            success = false;
        } else if ( !expectedEnabledState ) {
            if ( retain ) {
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error, conditionId.toString(),
                    "Unexpected retain value for non enabled condition" );
                success = false;
            }
        } else {
            var activeState = collector.GetBooleanValue( eventFields, "ActiveState.Id" );
            if ( activeState && !retain ){
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error, conditionId.toString(),
                    "Unexpected retain value for active condition" );
                success = false;
            }
        }

        var compareTime = null;
        if ( isDefined( localTestCase.InstanceEnableTime ) ){
            compareTime = localTestCase.InstanceEnableTime;
        }else if ( isDefined( localTestCase.InstanceDisableTime ) ){
            compareTime = localTestCase.InstanceDisableTime;
        }else if ( isDefined( localTestCase.ConditionEnableTime ) ){
            compareTime = localTestCase.ConditionEnableTime;
        }else if ( isDefined( localTestCase.ConditionDisableTime ) ){
            compareTime = localTestCase.ConditionDisableTime;
        }

        if ( !isDefined( compareTime ) ){
            throw( "Unexpected Programming Error" );
        }

        var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
        var difference = compareTime.msecsTo( time );
        var absoluteDifference = Math.abs( difference );
        if ( absoluteDifference > 100 ){
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error, conditionId.toString(),
            "Unexpected event time, differs by " + somethingElse + " with the expected time" );
            success = false;
        }

        var enabledStateTransitionTime = collector.GetSelectField( eventFields, "EnabledState.TransitionTime" ).toDateTime();
        if ( isDefined( enabledStateTransitionTime ) ) {
            difference = enabledStateTransitionTime.msecsTo( compareTime );
            absoluteDifference = Math.abs( difference );
            if ( absoluteDifference > 100 ){
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error, conditionId.toString(),
                    "Unexpected enabled state transition time, differs by " + absoluteDifference + " with the expected time" );
                success = false;
            }
        }

        if ( !success ){
            collector.Error( this.TestName, conditionId, localTestCase, this.TestStates.Failed, 
                "Error validating variables for state " + localTestCase.State );
        }

        return success;
    }

    this.GetInstanceMethods = function ( conditionIdString, localTestCase, eventFields, collector ) {
        var eventType = collector.GetSelectField( eventFields, "EventType" ).toString();
        var alarmTester = collector.GetAlarmTester();
        var alarmTypes = alarmTester.GetSupportedAlarmTypes();
        var alarmType = alarmTypes.Get( eventType );
        if ( isDefined( alarmType && isDefined( alarmType.Instances ) ) ) {
            var alarmInstance = alarmType.Instances.Get( conditionIdString );
            if ( isDefined( alarmInstance ) && isDefined( alarmInstance.ReferenceDescriptions ) ) {
                var alarmUtilities = alarmTester.GetAlarmUtilities();
                var modelMapHelper = alarmUtilities.GetModelMapHelper();
                var searchDefinitions = this.GetMethodSearchDefinitions();
                modelMapHelper.FindReferences( alarmInstance.ReferenceDescriptions, searchDefinitions );

                localTestCase.InstanceEnableMethod = this.FindUniqueMethod( alarmInstance, searchDefinitions[ 0 ] );
                localTestCase.InstanceDisableMethod = this.FindUniqueMethod( alarmInstance, searchDefinitions[ 1 ] );

                if ( !isDefined( localTestCase.InstanceEnableMethod ) ) {
                    collector.Error( this.TestName, conditionIdString, localTestCase, this.TestStates.Failed,
                        "Unable to retrieve instance enable method" );
                }

                if ( !isDefined( localTestCase.InstanceDisableMethod ) ) {
                    collector.Error( this.TestName, conditionIdString, localTestCase, this.TestStates.Failed,
                        "Unable to retrieve instance disable method" );
                }
            }
        }
    }

    this.GetMethodSearchDefinitions = function () {
        return [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Enable" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Disable" } )
            }
        ];
    };

    this.FindUniqueMethod = function ( instance, searchDefinition ) {
        var methodNodeId = null;
        if ( isDefined( searchDefinition.ReferenceIndex ) ) {
            var index = searchDefinition.ReferenceIndex;
            var instanceMethodNodeId = instance.ReferenceDescriptions[ index ].NodeId.NodeId;
            methodNodeId = instanceMethodNodeId;
        }
        return methodNodeId;
    }

    this.CheckResults = function () {
        // For Debugging
        // CUVariables.AlarmCollector.GetAlarmTester().CheckEnabledStates();
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
        Test.Execute( { Procedure: Test_002 } );
    } else if ( CUVariables.CheckResults ) {
        print( "Test_003 Trying to run check results for test" );
        Test.Execute( { Procedure: Test_002 } );
    }
}
