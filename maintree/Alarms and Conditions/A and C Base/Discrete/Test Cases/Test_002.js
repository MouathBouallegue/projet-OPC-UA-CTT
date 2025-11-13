/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Discrete/Test Cases/Test_002.js
        Test is shared by Discrete/OffNormal/SystemOffNormal Conformance Units

    Description:    
        Watch for a OffNormalAlarmType alarm, verify that it occurred on an apprpriate state change

    Test Requirements:
        If the input is not available, then this test shall be run manually

    Expectation:
        Each event type is received as expected, when the value make the appropriate transition.

*/

include ( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

function Test_002 () {

    /**
     * @typedef {Object} DiscreteTestData
     * @property {string} ConditionId
     * @property {string} State
     * @property {Object} TestCase
     * @property {Boolean} TestPassed
     * @property {Boolean} Inactive
     * @property {Boolean} Active
     * @property {Object[]} Values
     */

    this.TestName = "Test_002";
    this.TestTimer = null;
    this.SupportedAlarmTypes = null;
    this.Tolerance = null;
    this.Initialized = false;
    this.WaitForStart = true;
    this.MaxSuccessFullTestCount = 5;
    this.TestComplete = false;
    this.RunningStoredEvents = true;

    this.AlarmTypeString = null;
    this.MandatoryMap = null;
    this.OptionalMap = null;
    this.AlarmTester = null;
    this.AlarmUtilities = null;
    this.DiscreteAlarmTypeString = new UaNodeId( Identifier.DiscreteAlarmType );

    this.States = {
        Initial: "Initial",
        InProgress: "InProgress",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestCaseMap = null;

    this.Initialize = function ( collector ) {

        if ( !isDefined( CUVariables.AlarmTypeString ) ) {
            throw ( "Invalid Test Setup" );
        }

        this.TestTimer = new PerformanceTimer();
        this.TestCaseMap = new KeyPairCollection();

        this.AlarmTypeString = CUVariables.AlarmTypeString;

        var alarmUtilities = this.GetAlarmUtilities( collector );

        this.SupportedAlarmTypes = alarmUtilities.GetAlarmTypeAndDerivedTypes( this.AlarmTypeString );
        collector.AddIgnoreSkips( this.SupportedAlarmTypes, this.TestName );
        var inputNodes = alarmUtilities.GetAlarmInputNodes( this.AlarmTypeString );
        print( inputNodes.length + " Input Nodes found for " + this.AlarmTypeString );

        var preTestEventCounter = 0;

        CUVariables.DiscreteHelper.Set_Test_002_Initialized();
        this.Initialized = true;

        collector.StoreData();

        var alarmTester = this.GetAlarmTester( collector );
        var alarmTypes = alarmTester.GetSupportedAlarmTypes();

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
                            if ( isDefined( testCase ) ){
                                print( this.TestName + "::Initialize::" + conditionIdKey + "::" + branchKey + "::EventTime " + eventKey + " Now " + UaDateTime.utcNow().toString() );
                                this.TestEvent( eventFields, testCase, collector );
                                preTestEventCounter++;
                            }else{
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

            var eventType = eventFields[ collector.EventTypeIndex ].toString();

            for ( var index = 0; index < this.SupportedAlarmTypes.length; index++ ){
                var supportedNodeIdString = this.SupportedAlarmTypes[ index ];
                if ( eventType == supportedNodeIdString ){
                    canRun = true;
                    break;
                }
            };

            if ( canRun ){
                if ( collector.IsNonNullNodeId( eventFields, "BranchId" ) ) {
                    canRun = false;
                    print( "CanRunTest ignoring due to BranchId" );
                }
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
                    var result = this.RunDiscreteTest( eventFields, testCase, collector, localTestCase, dataItems.Values, index );
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

    this.GetAlarmUtilities = function ( collector ) {
        if ( !isDefined( this.AlarmUtilities ) ) {
            this.AlarmUtilities = this.GetAlarmTester( collector ).GetAlarmUtilities();
        }

        return this.AlarmUtilities;
    }

    this.GetAlarmTester = function ( collector ) {
        if ( !isDefined( this.AlarmTester ) ) {
            this.AlarmTester = collector.GetAlarmTester();
        }

        return this.AlarmTester;
    }


    this.InitializeTestData = function ( conditionIdString, testCase ) {
        var testData = null;

        var testData = {
            ConditionId: conditionIdString,
            State: this.States.Initial,
            TestCase: testCase,
            TestPassed: null,
            Inactive: false,
            Active: false,
            Values: []
        }

        return testData;
    }

    this.GetDataItems = function ( sourceNode, collector ) {
        var sourceData = [];
        var itemDataMap = collector.GetAlarmTester().GetDataItems();
        if ( isDefined( itemDataMap ) ) {
            sourceData = itemDataMap.Get( sourceNode );
        }
        return sourceData;
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

    this.RunDiscreteTest = function ( eventFields, testCase, collector, localTestCase, dataItems, index ) {

        var success = true;

        var active = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();
        var dataValue = this.GetDataValue( dataItems, index );
        var value = UaVariant.FromUaType( { Value: dataValue.Value } );

        if ( !isDefined( value ) ){
            collector.AddMessage( testCase, collector.Categories.Error,
                collector.GetConditionId( eventFields ).toString() + 
                " Unexpected data value: " + dataValue.Value.toString() );
            localTestCase.State = this.States.Failed;
            testCase.TestsFailed++;
            return false;
        }

        var normalStateVariant = collector.GetNormalStateVariant( eventFields );
        var valuesAreEqual = normalStateVariant.equals( dataValue.Value );

        // if valuesAreEqual, active should be false.

        print( "Discrete Test Active: " + active.toString() + 
            " value: " + dataValue.Value.toString() + 
            " Normal State: " + normalStateVariant.toString() + 
            " values are equal " + valuesAreEqual );

        if ( active == valuesAreEqual ) {
            collector.AddMessage( testCase, collector.Categories.Error,
                collector.GetConditionId( eventFields ).toString() + 
                " Unexpected Active State ActiveState.Id " + active + 
                " value: " + dataValue.Value.toString() + 
                " Normal State: " + normalStateVariant.toString() );
                
            localTestCase.State = this.States.Failed;
            testCase.TestsFailed++;
            return false;
        }

        if ( active ){
            localTestCase.Active = true;
        }else{
            localTestCase.Inactive = true;
        }

        return success;
    }

    this.GetDataValue = function ( dataItems, index ) {
        var dataValue = null;

        if ( index >= 0 && index < dataItems.length ) {
            var dataValue = dataItems[ index ];
        }

        return dataValue;
    }

    /**
     * Checks to see if a test case has been successfully completed
     * @param {Object} localTestCase 
     */
    this.CheckForComplete = function ( localTestCase ) {
        var complete = false;

        if ( localTestCase.Active && localTestCase.Inactive ){
            localTestCase.State = this.States.Completed;
            complete = true;
        };

        return complete;
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
                        if ( isDefined( localTestCase.TestCase ) ){
                            print( "CheckForTestCompletion TestCase for " + conditionIdString + " Passed State" + localTestCase.State );
                            localTestCase.TestCase.TestsPassed++;
                        }else{
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