/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Level/Test Cases/Test_002.js
        Test is shared by Exclusive/NonExclusive Limit/Level Conformance Units

    Description:    
        1	watch for the desired alarm type alarm, verify that it occurred on an apprpriate thresh hold 
        2	Check that the next defined level also triggers an event.
        3	Check that when the value drops below the high limit and above the low limit that the alarm returns to normal.
        4	Ensure that all alarm limits defined for the given level alarm for the variable have been exercised during the cycle

    Expectation:
        1   Each event type is received as expected, when the value exceeds the corresponding limit
        2   The event is received as expected, when the value exceeds the corresponding limit and only the new event is active.
        3   The event is received as expected, i.e. the alarm is no longer active
        4   all event were received as expected

*/

include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );
include( "./library/Information/UNECE_to_OPCUA.js" );

function Test_002 () {

    /**
     * @typedef {Object} Limit
     * @property {bool} Supported
     * @property {string} Type
     * @property {bool} Tested
     * @property {integer} DataType
     * @property {UaVariant} Limit
     * @property {UaNodeId} ExclusiveNodeId
     */

    /**
     * @typedef {Object} LimitTestData
     * @property {string} State
     * @property {Object} TestCase
     * @property {Limit} Inactive
     * @property {Limit} HighHighLimit
     * @property {Limit} HighLimit
     * @property {Limit} LowLimit
     * @property {Limit} LowLowLimit
     */


    this.TestName = "Test_002";
    this.TestTimer = null;
    this.LimitHelper = null;
    this.SupportedAlarmTypes = null;
    this.Tolerance = null;
    this.Initialized = false;
    this.WaitForStart = true;
    this.MaxSuccessFullTestCount = 5;
    this.TestComplete = false;
    this.RunningStoredEvents = true;
    this.EUInformationHelper = null;

    this.States = {
        Initial: "Initial",
        InProgress: "InProgress",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestCaseMap = null;

    this.Initialize = function ( collector ) {

        this.TestTimer = new PerformanceTimer();
        this.TestCaseMap = new KeyPairCollection();
        this.EUInformationHelper = new UNECE_to_OPCUA();

        this.LimitHelper = CUVariables.LimitHelper;
        this.SupportedAlarmTypes = this.LimitHelper.GetAlarmTypeAndDerivedTypes();
        collector.AddIgnoreSkips( this.SupportedAlarmTypes, this.TestName );
        var inputNodes = collector.AlarmTester.GetAlarmUtilities().GetAlarmInputNodes( this.LimitHelper.AlarmType );
        print( inputNodes.length + " Input Nodes found for " + this.LimitHelper.AlarmType.toString() );

        var preTestEventCounter = 0;

        if ( this.LimitHelper.IsDeviation() ) {
            var setPointNodes = CUVariables.GetSetpointNodes();
            if ( setPointNodes.length <= 0 ) {
                return;
            }
        }

        this.LimitHelper.Set_Test_002_Initialized();
        this.Initialized = true;

        CUVariables.AlarmCollector.StoreData();

        var alarmTypes = collector.AlarmTester.GetSupportedAlarmTypes();

        for ( var typeIndex = 0; typeIndex < this.SupportedAlarmTypes.length; typeIndex++ ) {
            var supportedAlarmType = this.SupportedAlarmTypes[ typeIndex ];
            var type = alarmTypes.Get( supportedAlarmType );

            if ( type && isDefined( type.ConditionIds ) ) {
                print( this.TestName + " Supported Type [" + typeIndex + "] " + supportedAlarmType.toString() );

                var conditionIdKeys = type.ConditionIds.Keys();
                for ( var conditionIndex = 0; conditionIndex < conditionIdKeys.length; conditionIndex++ ) {
                    var conditionIdKey = conditionIdKeys[ conditionIndex ];
                    var condition = type.ConditionIds.Get( conditionIdKey );
                    var branchKeys = condition.Keys();
                    for ( var branchIndex = 0; branchIndex < branchKeys.length; branchIndex++ ) {
                        var branchKey = branchKeys[ branchIndex ];
                        var branch = condition.Get( branchKey );
                        var eventKeys = branch.Keys();
                        for ( var eventIndex = 0; eventIndex < eventKeys.length; eventIndex++ ) {
                            var eventKey = eventKeys[ eventIndex ];
                            var eventFields = branch.Get( eventKey );
                            var eventType = eventFields[ collector.EventTypeIndex ].toString();
                            var testCase = collector.RetrieveTestCase( eventType, this.TestName );
                            if ( isDefined( testCase ) ) {
                                print( this.TestName + "::Initialize::" + conditionIdKey + "::" + branchKey + "::EventTime " + eventKey + " Now " + UaDateTime.utcNow().toString() );
                                this.TestEvent( eventFields, testCase, collector );
                                preTestEventCounter++;
                            } else {
                                print( "Unable to retrieve test case for event type " + eventType );
                            }
                        }
                    }
                }
            }
        }

        this.RunningStoredEvents = false;

        print( this.TestName + "::Initialize Checking for test completion" );

        this.CheckForTestCompletion();

        print( this.TestName + "::Initialize time " + this.TestTimer.TakeReading() + " Pre Test Event Count " + preTestEventCounter );
    }

    this.CanRunTest = function ( eventFields, collector ) {

        var canRun = false;
        if ( this.Initialized ) {
            var pastStartDelay = true;
            if ( this.WaitForStart ) {
                pastStartDelay = false;
                var time = collector.GetMandatorySelectField( eventFields, "Time", BuiltInType.DateTime ).toDateTime();
                if ( isDefined( time ) ) {
                    var localTime = collector.GetAlarmTester().GetLocalTimeFromDeviceTime(time);
                    print( "Initialize Start Time " + this.LimitHelper.TestLocalStartTime.toString() + 
                    " Alarm time " + time.toString() +
                    " Calculated Local Time " + localTime.toString() + 
                    " " + collector.GetConditionId( eventFields ).toString() );
                    if ( this.LimitHelper.TestLocalStartTime.msecsTo( localTime ) > 2000 ) {
                        this.WaitForStart = false;
                        pastStartDelay = true;
                    }
                }
            }
            if ( pastStartDelay ) {
                canRun = this.LimitHelper.ShouldTestEvent( eventFields, collector );
            }
        }

        return canRun;
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !this.CanRunTest( eventFields, collector ) ) {
            testCase.TestSkipped++;
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            var testData = this.InitializeTestData( conditionIdString, testCase, eventFields, collector );
            if ( isDefined( testData ) ) {
                this.TestCaseMap.Set( conditionIdString, testData );
            } else {
                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + "does not support any limits" );
                if ( isDefined( testCase ) && isDefined( testCase.TestsFailed ) ) {
                    testCase.TestsFailed++;
                }
                return;
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( !isDefined( localTestCase ) ) {
            return;
        }

        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + " Test Event State = " + localTestCase.State );

        if ( localTestCase.State != this.States.Completed && localTestCase.State != this.States.Failed ) {
            if ( collector.IsNonNullNodeId( eventFields, "InputNode" ) ) {

                localTestCase.State = this.States.InProgress;
                var inputNode = collector.GetSelectField( eventFields, "InputNode" ).toNodeId();
                var dataItems = this.GetDataItems( inputNode, collector );
                var index = -1;

                if ( isDefined( dataItems ) ) {
                    index = this.GetDataValueIndex( eventFields, collector, dataItems.Values );
                }

                if ( index < 0 ) {
                    var eventTime = collector.GetSelectField(eventFields, "Time" ).toDateTime();
                    if ( eventTime < dataItems.DeviceAddTime ){
                        collector.AddMessage( testCase,
                            collector.Categories.Activity, conditionIdString + " No Data Values as " + 
                        inputNode.toString() + " added at " + dataItems.DeviceAddTime.toString() + " after event received at " +
                        eventTime.toString() );
                    }else{
                        collector.AddMessage( testCase,
                            collector.Categories.Error, conditionIdString + " No Data Values available for " +
                            inputNode.toString() + " to compare with event " +
                            eventFields[ collector.EventIdIndex ].toString() + " at " + eventTime.toString() );
                        localTestCase.State = this.States.Failed;
                        testCase.TestsFailed++;
                    }
                } else {
                    var result = this.RunSpecificTest( eventFields, testCase, collector, localTestCase, dataItems.Values, index );
                    var completed = this.CheckForComplete( localTestCase );
                    if ( result && completed ) {
                        // Don't set TestsPassed, store it with the localTestCase, and update TestsPassed on Shutdown
                        localTestCase.TestPassed = true;
                    }
                }
                this.CheckForTestCompletion();
            } else {
                if ( !isDefined(testCase.NotImplemented ) ){
                    testCase.NotImplemented = [];
                }
                testCase.NotImplemented.push( "Unable to run " + this.TestName + " for conditionId " + conditionIdString + " due to null InputNode.  Requires ManualTest" );
                localTestCase.State = this.States.Failed;
                return;
            }
        }
    }

    this.Shutdown = function ( collector ) {
        this.CheckForTestCompletion();
    }

    this.InitializeTestData = function ( conditionIdString, testCase, eventFields ) {
        var testData = null;

        var limitTestData = {
            ConditionId: conditionIdString,
            State: this.States.Initial,
            TestCase: testCase,
            TestPassed: null,
            Inactive: this.CreateLimitObject( conditionIdString, eventFields, "Inactive" ),
            HighHighLimit: this.CreateLimitObject( conditionIdString, eventFields, "HighHighLimit" ),
            HighLimit: this.CreateLimitObject( conditionIdString, eventFields, "HighLimit" ),
            LowLimit: this.CreateLimitObject( conditionIdString, eventFields, "LowLimit" ),
            LowLowLimit: this.CreateLimitObject( conditionIdString, eventFields, "LowLowLimit" ),
            Values: []
        }

        if ( limitTestData.HighHighLimit.Supported ||
            limitTestData.HighLimit.Supported ||
            limitTestData.HighHighLimit.Supported ||
            limitTestData.LowLowLimit.Supported ) {
            testData = limitTestData;
        }

        return testData;
    }

    this.CreateLimitObject = function ( conditionIdString, eventFields, name ) {
        var limit = {
            Type: name,
            Supported: false,
            Tested: false,
            DataType: null,
            Limit: null,
            ExclusiveNodeId: new UaNodeId()
        };

        if ( name == "Inactive" ) {
            limit.Supported = true;
        } else {
            limit.Supported = this.LimitHelper.ConditionSupportsLimit( conditionIdString, eventFields, name );
            limit.DataType = this.LimitHelper.GetConditionLimitDataType( conditionIdString, eventFields, name );
            limit.Limit = this.LimitHelper.GetConditionLimit( conditionIdString, eventFields, name );
            limit.ExclusiveNodeId = this.GetExclusiveNodeId( name );
        }

        return limit;
    }

    this.GetExclusiveNodeId = function ( limitName ) {

        var nodeId = null;

        if ( limitName.indexOf( "HighHigh" ) >= 0 ) {
            nodeId = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_HighHigh );
        } else if ( limitName.indexOf( "High" ) >= 0 ) {
            nodeId = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_High );
        } else if ( limitName.indexOf( "LowLow" ) >= 0 ) {
            nodeId = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_LowLow );
        } else if ( limitName.indexOf( "Low" ) >= 0 ) {
            nodeId = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_Low );
        }

        return nodeId;
    }

    this.GetLimitObject = function ( localTestCase, name ) {
        return localTestCase[ name ];
    }

    this.GetDataItems = function ( inputNode, collector ) {
        var inputData = [];
        var itemDataMap = collector.GetAlarmTester().GetDataItems();
        if ( isDefined( itemDataMap ) ) {
            inputData = itemDataMap.Get( inputNode );
        }
        return inputData;
    }

    this.GetDataValueIndex = function ( eventFields, collector, dataValues ) {

        var desiredIndex = -1;
        var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
        var startTime = collector.GetPreviousToleranceTime( time );

        for ( var index = 0; index < dataValues.length; index++ ) {

            var dataValue = dataValues[ index ];
            if ( dataValue.SourceTimestamp >= startTime ) {
                if ( dataValue.SourceTimestamp <= time ) {
                    desiredIndex = index;
                } else {
                    break;
                }
            }
        }

        return desiredIndex;
    }

    this.RunSpecificTest = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var success = false;

        if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.ExclusiveLimitAlarmType ) ) {
            success = this.RunExclusiveLimit( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.ExclusiveLevelAlarmType ) ) {
            success = this.RunExclusiveLevel( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.ExclusiveDeviationAlarmType ) ) {
            success = this.RunExclusiveDeviation( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.ExclusiveRateOfChangeAlarmType ) ) {
            success = this.RunExclusiveRateOfChange( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.NonExclusiveLimitAlarmType ) ) {
            success = this.RunNonExclusiveLimit( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.NonExclusiveLevelAlarmType ) ) {
            success = this.RunNonExclusiveLevel( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.NonExclusiveDeviationAlarmType ) ) {
            success = this.RunNonExclusiveDeviation( eventFields, testCase, collector, localTestCase, dataItems, index );
        } else if ( this.LimitHelper.AlarmType.equals( this.LimitHelper.NonExclusiveRateOfChangeAlarmType ) ) {
            success = this.RunNonExclusiveRateOfChange( eventFields, testCase, collector, localTestCase, dataItems, index );
        }

        return success;
    }

    /** 
     * Function does comparison test for all Exclusive alarm types
    */
    this.RunExclusiveTest = function ( eventFields, testCase, collector, localTestCase, value ) {

        var highHighActive = this.IsExclusiveLimitActive( localTestCase, "HighHighLimit", value, this.GreaterThanEqual );
        var highActive = this.IsExclusiveLimitActive( localTestCase, "HighLimit", value, this.GreaterThanEqual );
        var lowLowActive = this.IsExclusiveLimitActive( localTestCase, "LowLowLimit", value, this.LessThanEqual );
        var lowActive = this.IsExclusiveLimitActive( localTestCase, "LowLimit", value, this.LessThanEqual );

        var statesActive = highHighActive || highActive || lowLowActive || lowActive;
        var active = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();

        print( "RunExclusiveTest value = " + value + " High and low alarms active HighHigh [" + highHighActive + "] High [" + highActive + "] Low [" + lowActive + "] LowLow [" + lowLowActive + "]" );

        if ( active != statesActive ) {
            collector.AddMessage( testCase, collector.Categories.Error,
                collector.GetConditionId( eventFields ).toString() + " Unexpected Active State ActiveState.Id " + active +
                " LimitState.CurrentState " + collector.GetSelectField( eventFields, "LimitState.CurrentState" ).toString() +
                " LimitState.CurrentState.Id " + collector.GetSelectField( eventFields, "LimitState.CurrentState.Id" ).toString() );
            localTestCase.State = this.States.Failed;
            testCase.TestsFailed++;
            return false;
        }

        var passed = true;
        if ( active ) {
            if ( highHighActive ) {
                passed = this.TestExclusiveResult( eventFields, testCase, collector, localTestCase, localTestCase.HighHighLimit );
            } else if ( highActive ) {
                passed = this.TestExclusiveResult( eventFields, testCase, collector, localTestCase, localTestCase.HighLimit );
            } else if ( lowLowActive ) {
                passed = this.TestExclusiveResult( eventFields, testCase, collector, localTestCase, localTestCase.LowLowLimit );
            } else if ( lowActive ) {
                passed = this.TestExclusiveResult( eventFields, testCase, collector, localTestCase, localTestCase.LowLimit );
            }
        } else {
            localTestCase.Inactive.Tested = true;
        }

        return passed;
    }

    this.IsExclusiveLimitActive = function ( localTestCase, name, value, comparison ) {

        var conditionMet = false;

        var limit = localTestCase[ name ];
        if ( limit.Supported ) {
            if ( comparison( value, limit.Limit ) ) {
                conditionMet = true;
            }
        }

        return conditionMet;
    }

    this.RunExclusiveLimit = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var dataValue = this.GetDataValue( dataItems, index );

        return this.RunExclusiveTest( eventFields, testCase, collector, localTestCase, dataValue.Value );
    }

    this.TestExclusiveResult = function ( eventFields, testCase, collector, localTestCase, limitTestData ) {

        var success = false;

        var state = collector.GetSelectField( eventFields, "LimitState.CurrentState.Id" ).toNodeId();
        if ( state.equals( limitTestData.ExclusiveNodeId ) ) {
            limitTestData.Tested = true;
            success = true;
        } else {
            collector.AddMessage( testCase, collector.Categories.Error,
                collector.GetConditionId( eventFields ).toString() +
                " Exclusive test Unexpected State Expected " + limitTestData.ExclusiveNodeId.toString() +
                " LimitState.CurrentState " + collector.GetSelectField( eventFields, "LimitState.CurrentState" ).toString() +
                " LimitState.CurrentState.Id " + collector.GetSelectField( eventFields, "LimitState.CurrentState.Id" ).toString() );
            localTestCase.State = this.States.Failed;
            testCase.TestsFailed++;
        }
        return success;
    }

    this.RunExclusiveLevel = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {
        return this.RunExclusiveLimit( eventFields, testCase, collector, localTestCase, dataItems, index );
    }

    this.RunExclusiveDeviation = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {
        var success = false;

        var deviation = this.GetDeviation( eventFields, testCase, collector, localTestCase, dataItems, index );
        if ( deviation.DataType != 0 ) {
            success = this.RunExclusiveTest( eventFields, testCase, collector, localTestCase, deviation );
        }

        return success;
    }

    this.RunExclusiveRateOfChange = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var success = false;
        var rateOfChange = this.GetRateOfChange( eventFields, testCase, collector, localTestCase, dataItems, index );

        if ( rateOfChange.DataType > 0 ) {
            success = this.RunExclusiveTest( eventFields, testCase, collector, localTestCase, rateOfChange );
        }

        return success;
    }

    /**
     * Function does comparison tests for all NonExclusive Level types
     */
    this.RunNonExclusiveTest = function ( eventFields, testCase, collector, localTestCase, value ) {
        var highHighActive = this.TestNonExclusiveComparison( eventFields, testCase, collector, localTestCase, "HighHighLimit", value, this.GreaterThanEqual );
        var highActive = this.TestNonExclusiveComparison( eventFields, testCase, collector, localTestCase, "HighLimit", value, this.GreaterThanEqual );
        var lowLowActive = this.TestNonExclusiveComparison( eventFields, testCase, collector, localTestCase, "LowLowLimit", value, this.LessThanEqual );
        var lowActive = this.TestNonExclusiveComparison( eventFields, testCase, collector, localTestCase, "LowLimit", value, this.LessThanEqual );
        var statesActive = highHighActive || highActive || lowLowActive || lowActive;

        var active = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();

        print( this.TestName + " RunNonExclusiveLimit " + collector.GetConditionId( eventFields ).toString() +
            " Value " + value.toString() +
            " StatesActive " + statesActive +
            " Active " + active +
            " HighHighLimit " + highHighActive +
            " HighLimit " + highActive +
            " LowLimit " + lowActive +
            " LowLowLimit " + lowLowActive );

        if ( active != statesActive ) {
            collector.AddMessage( testCase, collector.Categories.Error,
                collector.GetConditionId( eventFields ).toString() + " Unexpected Active State ActiveState.Id " + active +
                " HighHighLimit " + highHighActive +
                " HighLimit " + highActive +
                " LowLimit " + lowActive +
                " LowLowLimit " + lowLowActive );
            localTestCase.State = this.States.Failed;
            testCase.TestsFailed++;
            return false;
        }

        if ( !active ) {
            localTestCase.Inactive.Tested = true;
        }

        return true;
    }

    this.TestNonExclusiveComparison = function ( eventFields, testCase, collector, localTestCase, name, value, comparison ) {
        var stateActive = false;
        var stateName = name.replace( "Limit", "State.Id" );
        var state = collector.GetSelectField( eventFields, stateName );

        var limit = localTestCase[ name ];
        if ( limit.Supported ) {
            var conditionIdString = collector.GetConditionId( eventFields ).toString();
            print( conditionIdString + " TestNonExclusiveComparison value " + value.toString() +
                " Limit " + limit.Limit.toString() + " stateName " + stateName.toString() +
                " state " + state.toString() );

            // GreaterEqual, LessThan
            if ( comparison( value, limit.Limit ) ) {
                print( "TestNonExclusiveComparison comparison returned true... " );
                if ( state ) {
                    print( "TestNonExclusiveComparison comparison returned true... State is True" );
                    limit.Tested = true;
                    stateActive = true;
                } else {
                    print( "TestNonExclusiveComparison comparison returned true... State is not True" );
                    collector.AddMessage( testCase, collector.Categories.Error,
                        collector.GetConditionId( eventFields ).toString() + " DataValue " + value.toString() +
                        " should have triggered a " + stateName + " event" );
                    localTestCase.State = this.States.Failed;
                    testCase.TestsFailed++;
                }
            } else {
                print( "TestNonExclusiveComparison comparison returned false... State is False" );
            }
        }
        return stateActive;
    }

    this.RunNonExclusiveLimit = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var dataValue = this.GetDataValue( dataItems, index );

        return this.RunNonExclusiveTest( eventFields, testCase, collector, localTestCase, dataValue.Value );
    }

    this.RunNonExclusiveLevel = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {
        return this.RunNonExclusiveLimit( eventFields, testCase, collector, localTestCase, dataItems, index );
    }

    this.RunNonExclusiveDeviation = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var success = false;

        var deviation = this.GetDeviation( eventFields, testCase, collector, localTestCase, dataItems, index );

        if ( deviation.DataType != 0 ) {
            success = this.RunNonExclusiveTest( eventFields, testCase, collector, localTestCase, deviation );
        }

        return success;
    }

    this.RunNonExclusiveRateOfChange = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {
        var success = false;
        var rateOfChange = this.GetRateOfChange( eventFields, testCase, collector, localTestCase, dataItems, index );

        if ( rateOfChange.DataType > 0 ) {
            success = this.RunNonExclusiveTest( eventFields, testCase, collector, localTestCase, rateOfChange );
        }
        return success;
    }

    this.GetDeviation = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var deviation = new UaVariant();

        var setpointValue = this.GetSetpointValue( eventFields, testCase, collector, localTestCase );

        if ( isDefined( setpointValue ) ) {
            var setpoint = UaVariant.FromUaType( { Value: setpointValue.Value } );
            var dataValue = this.GetDataValue( dataItems, index );
            var value = null;
            if ( isDefined( dataValue ) && isDefined( dataValue.Value ) ) {
                value = UaVariant.FromUaType( { Value: dataValue.Value } );
            }

            if ( isDefined( value ) && isDefined( setpoint ) ) {
                var deviate = value - setpoint;

                print( "GetDeviation value " + value.toString() + " setpoint " + setpoint.toString() + " deviation " + deviate );

                deviation.setDouble( value - setpoint );
            } else {
                collector.AddMessage( testCase, collector.Categories.Error,
                    collector.GetConditionId( eventFields ).toString() + " Unable to get Values Setpoint [" + setpoint + "] Value [" + value + "]" );
                localTestCase.State = this.States.Failed;
                testCase.TestsFailed++;
            }
        }

        return deviation;
    }

    this.GetSetpointValue = function ( eventFields, testCase, collector, localTestCase ) {
        var dataValue = null;

        var setpointNodeVariant = collector.GetSelectField( eventFields, "SetpointNode" );
        // Mantis 8315 - Setpoint Node could be null
        if ( setpointNodeVariant.DataType > 0 ) {
            if ( collector.ValidateDataType( setpointNodeVariant, BuiltInType.NodeId ) ){
                var setpointNodeId = setpointNodeVariant.toNodeId();
                var setpointNodeString = setpointNodeId.toString();
                var setpointItems = this.GetDataItems( setpointNodeString, collector );
                var setpointIndex = -1;

                if ( isDefined( setpointItems ) ) {
                    setpointIndex = this.GetDataValueIndex( eventFields, collector, setpointItems.Values );
                }

                if ( setpointIndex >= 0 ){
                    dataValue = this.GetDataValue( setpointItems.Values, setpointIndex );
                }else{
                    print( "No recent value for setpoint value" + setpointNodeString + " Executing Read" );
                    var items = MonitoredItem.fromNodeIds( setpointNodeId );
                    if ( ReadHelper.Execute( { NodesToRead: items } ) ){
                        if ( isDefined( items[ 0 ].Value ) ){
                            dataValue = items[ 0 ].Value;
                        }
                    }
                }

                if ( dataValue == null ){
                    collector.AddMessage( testCase, collector.Categories.Error,
                        collector.GetConditionId( eventFields ).toString() + " Unable to get Setpoint Value" );
                    localTestCase.State = this.States.Failed;
                    testCase.TestsFailed++;
                }
            }else{
                collector.AddMessage( testCase, collector.Categories.Error,
                    collector.GetConditionId( eventFields ).toString() + " Unable to get SetpointNode from the event" );
                localTestCase.State = this.States.Failed;
                testCase.TestsFailed++;
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Activity,
                collector.GetConditionId( eventFields ).toString() + " SetpointNode is null, Unable to test event" );
            localTestCase.State = this.States.Completed;
            testCase.TestsSkipped++;
        }

        return dataValue;
    }

    this.GetRateOfChange = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var rateOfChange = new UaVariant();
        var conditionIdString = collector.GetConditionId( eventFields ).toString();
        var sourceNode = collector.GetSelectField( eventFields, "SourceNode" ).toString();

        if ( index > 0 ) {
            // Get the values
            var currentDataValue = dataItems[ index ];
            var previousDataValue = dataItems[ index - 1 ];

            var currentValue = UaVariant.FromUaType( { Value: currentDataValue.Value } );
            var previousValue = UaVariant.FromUaType( { Value: previousDataValue.Value } );

            if ( isDefined( currentValue ) && isDefined( previousValue ) ) {
                var valueChange = currentValue - previousValue;
                var timeDifference = previousDataValue.SourceTimestamp.msecsTo( currentDataValue.SourceTimestamp );
                var measurementInRange = this.GetMeasurmentTimeRangeInMilliSeconds( eventFields, collector );
                var timeRatio = timeDifference / measurementInRange;
                var slope = valueChange / timeRatio;

                print( "Rate Of Change Calculation valueChange = " + valueChange + " timeDifference " + timeDifference.toString() + " rate of change " + slope );

                rateOfChange.setDouble( slope );
            } else {

                collector.AddMessage( testCase, collector.Categories.Error,
                    conditionIdString + ":" + sourceNode + " returned data without a value" );
                testCase.TestsFailed++;
                localTestCase.State = this.States.Failed;
            }
        } else {
            print( sourceNode + " No Previous Value, Unable to do rate of change calculation" );
        }

        return rateOfChange;
    }

    this.GetMeasurmentTimeRangeInMilliSeconds = function ( eventFields, collector ) {
        var measurementRangeInSeconds = 1;
        var engineeringUnits = collector.GetSelectField( eventFields, "EngineeringUnits" );
        if ( collector.ValidateDataType( engineeringUnits, BuiltInType.ExtensionObject ) ) {
            var extension = engineeringUnits.toExtensionObject();
            if ( isDefined( extension ) ) {
                var euInformation = extension.toEUInformation();
                if ( isDefined( euInformation ) ) {
                    var retrieved = this.EUInformationHelper.GetRateOfChange( euInformation.UnitId );

                    if ( retrieved > 0 ) {
                        print( "GetMeasurmentTimeRangeInMilliSeconds Got Value " + retrieved + " from EUInformation " + euInformation.UnitId + " Description " + euInformation.Description );
                        measurementRangeInSeconds = retrieved;
                    }
                }
            }
        }

        var measurementRangeInMilliSeconds = measurementRangeInSeconds * 1000;

        return measurementRangeInMilliSeconds;
    }

    this.GetDataValue = function ( dataItems, index ) {
        var dataValue = null;

        if ( index >= 0 && index < dataItems.length ) {
            var dataValue = dataItems[ index ];
        }

        return dataValue;
    }

    this.GreaterThanEqual = function ( dataValue, limit ) {
        var greaterThanEqual = false

        var comparison = compareVariantDouble( dataValue, limit );

        if ( isDefined( comparison ) ) {
            if ( comparison >= 0 ) {
                greaterThanEqual = true;
            }
        }

        return greaterThanEqual;
    }

    this.LessThanEqual = function ( dataValue, limit ) {
        var lessThanEqual = false

        var comparison = compareVariantDouble( dataValue, limit );

        if ( isDefined( comparison ) ) {
            if ( comparison <= 0 ) {
                lessThanEqual = true;
            }
        }

        return lessThanEqual;
    }

    this.PrintAlarm = function ( eventFields, collector, selectMap ) {
        var conditionIdString = collector.GetConditionId( eventFields ).toString();

        var eventId = collector.GetSelectFieldFromMap( eventFields, "EventId", selectMap ).toString();
        var eventType = collector.GetSelectFieldFromMap( eventFields, "EventType", selectMap ).toString();
        var activeState = collector.GetSelectFieldFromMap( eventFields, "ActiveState", selectMap ).toString();
        var message = collector.GetSelectFieldFromMap( eventFields, "Message", selectMap ).toString();
        var time = collector.GetSelectFieldFromMap( eventFields, "Time", selectMap ).toString();
        print( conditionIdString + ":" + eventId + " " + eventType + " " + activeState );
        print( "\t" + time + " " + message );
        if ( this.LimitHelper.IsExclusive() ) {
            var limitState = collector.GetSelectFieldFromMap( eventFields, "LimitState.CurrentState", selectMap ).toString();
            print( "\tExclusive limit state " + limitState );
        } else {
            var highHighState = collector.GetSelectFieldFromMap( eventFields, "HighHighState", selectMap ).toString();
            var highState = collector.GetSelectFieldFromMap( eventFields, "HighState", selectMap ).toString();
            var lowState = collector.GetSelectFieldFromMap( eventFields, "LowState", selectMap ).toString();
            var lowLowState = collector.GetSelectFieldFromMap( eventFields, "LowLowState", selectMap ).toString();
            print( "\tNonExclusive limit HighHigh [" + highHighState + "] High [" + highState + "] Low [" + lowState + "] LowLow [" + lowLowState + "]" );
        }
    }

    /**
     * Checks to see if a test case has been successfully completed
     * @param {Object} localTestCase 
     */
    this.CheckForComplete = function ( localTestCase ) {
        var complete = false;
        if ( this.CheckLimitForComplete( localTestCase.Inactive ) &&
            this.CheckLimitForComplete( localTestCase.HighHighLimit ) &&
            this.CheckLimitForComplete( localTestCase.HighLimit ) &&
            this.CheckLimitForComplete( localTestCase.LowLimit ) &&
            this.CheckLimitForComplete( localTestCase.LowLowLimit ) ) {
            localTestCase.State = this.States.Completed;
            complete = true;
        };
        return complete;
    }


    this.CheckLimitForComplete = function ( limit ) {
        var completed = true;
        if ( limit.Supported ) {
            if ( !limit.Tested ) {
                completed = false;
            }
        }
        return completed;
    }

    this.CheckForTestCompletion = function ( force ) {
        var forceCompletion = false;
        var testComplete = false;

        if ( isDefined( force ) && force == true ) {
            forceCompletion = true;
            testComplete = true;
            print( this.TestName + "::CheckForTestCompletion Shutdown" );
        }

        if ( !forceCompletion ) {
            var minimumCompletions = 1;
            var maximumCompletions = this.MaxSuccessFullTestCount;
            var completedCount = 0;
            var inProgressCount = 0;

            this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                if ( localTestCase.State == args.States.InProgress ) {
                    inProgressCount++;
                } else if ( localTestCase.State == args.States.Completed ) {
                    completedCount++;
                }
            }, { States: this.States } );

            if ( completedCount > maximumCompletions ) {
                testComplete = true;
            } else if ( inProgressCount == 0 && completedCount >= minimumCompletions ) {
                testComplete = true;
            }

            print( this.TestName + "::CheckForTestCompletion completed " + completedCount + " in Progess " + inProgressCount + " test Complete " + testComplete );
        }

        if ( testComplete ) {
            if ( !this.TestComplete ) {
                this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
                    if ( localTestCase.State == args.States.Completed ) {
                        if ( isDefined( localTestCase.TestCase ) ) {
                            print( "CheckForTestCompletion TestCase for " + conditionIdString + " Passed State" + localTestCase.State );
                            localTestCase.TestCase.TestsPassed++;
                        } else {
                            print( "CheckForTestCompletion TestCase for " + conditionIdString + " Not Found State " + localTestCase.State );
                        }
                    }
                }, { States: this.States } );
                print( this.TestName + "::CheckForTestCompletion time " + this.TestTimer.TakeReading() );
                this.TestComplete = true;
            }
        }

        return testComplete;
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