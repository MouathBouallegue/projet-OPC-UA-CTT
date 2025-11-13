/**
 * The main loop of the basic test.
 * The idea is to collect as many alarms as possible from the server, and then validate each section
 * The tests are organized by 
 * AlarmType
 *     AlarmInstance
 *         Each Specific Test result
 * In an ideal scenario, every test passes for every instance for every type.
 * In practice, once there is an instance that runs every test for every alarm type, the test will be considered complete.
 * There needs to be a final timeout for the test to run, say five or ten minutes.
 * This test is done in Test initialization, and once complete, each specific test case will look at the results and pass or fail.
 */

include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

function AlarmCollector ( cuVariables, customInitialize ) {

    this.AlarmTester = null;
    this.AlarmThreadHolder = null;

    this.EventIdIndex = -1;
    this.EventTypeIndex = -1;
    this.IntervalTime = null;
    this.MaximumTestTime = null;
    this.StartTime = null;
    this.LastTime = null;
    this.EndTime = null;
    this.MinimumTime = null;
    this.NextUpdateInterval = 10000;
    this.NextUpdate = null;

    this.Branch = false;

    this.ConditionTypeNodeId = new UaNodeId( Identifier.ConditionType );
    this.ConditionTypeNodeIdString = this.ConditionTypeNodeId.toString();
    this.AcknowledgeableConditionTypeNodeId = new UaNodeId( Identifier.AcknowledgeableConditionType );
    this.AcknowledgeableConditionTypeNodeIdString = this.AcknowledgeableConditionTypeNodeId.toString();

    /**
     * Represents a map of the actual tests, created by the Initialize for the Conformance Unit
     * Each test contains a set of functions, the most obvious being TestEvent, which the AlarmCollector
     * Single Loop will call for every event received by the Dedicated Alarm Thread
     */
    this.TestCases = null;

    /**
     * Represents a map of test case for each Alarm Type found:
     * Create a map of Results for each test case.
     * This can be customized by creating it previously in the Initialize in the Conformance Unit
     */
    this.TestTypeResults = null;

    /**
     * Represents a placeholder that builds Waiting/Running/Completed for each test case.
     * The enumerations also have a numerical value to ensure tests run in correct order.
     * Used By CanRunTest and TestCompleted
    */
    this.TestStateEnum = null;

    /**
     * Represents a map uses the TestStateEnum as a state table to show the current state for every conditionId
     * received in the test operations.
     * Currently every condition id would have to go through every test.
     */
    this.TestIdStateMap = null;

    /**
     * Represents a predefined set of potential messages that can be stored for each test case
     */
    this.Categories = {
        Activity: "Activity",
        Error: "Error",
        Warning: "Warning",
        Skipped: "Skipped",
        NonEssentialActivity: "NonEssentialActivity",
        Unexpected: "Unexpected"
    };


    /**
     * Default Initialize call
     */
    this.Initialize = function ( variables ) {
        return this.InitializeCustom( { CUVariables: variables } );
    }


    /**
     * Custom Initialize call that allows for flexibility in object creation
     */
    this.InitializeCustom = function ( args ) {

        var timer = new PerformanceTimer();
        var cuVariables = args.CUVariables;
        this.AlarmTester = this.GetAlarmTester();
        cuVariables.AlarmTester = this.AlarmTester;
        cuVariables.AlarmTypes = cuVariables.AlarmTester.GetSupportedAlarmTypes();
        this.AlarmThreadHolder = cuVariables.AlarmTester.GetAlarmThreadHolder( args );

        print( "SelectFields" );
        this.AlarmThreadHolder.SelectFields.Iterate( function ( key, field ) {
            print( "\t" + key + "\t" + field.Index );
        } );

        cuVariables.AlarmThreadHolder = this.AlarmThreadHolder;
        if ( isDefined( cuVariables.TestTypeResults ) ) {
            this.TestTypeResults = cuVariables.TestTypeResults;
        } else {
            this.TestTypeResults = this.CreateTestTypePlaceholder();
            cuVariables.TestTypeResults = this.TestTypeResults;
        }

        this.TestIdStateMap = new KeyPairCollection();
        cuVariables.TestIdStateMap = this.TestIdStateMap;

        this.EventIdIndex = this.AlarmThreadHolder.SelectFields.Get( "EventId" ).Index;
        this.EventTypeIndex = this.AlarmThreadHolder.SelectFields.Get( "EventType" ).Index;
        this.TestCases = this.GetTests( cuVariables );

        if ( isDefined( args.Branch ) && args.Branch ) {
            this.Branch = true;
        }

        this.StartTime = UaDateTime.utcNow();
        print( "AlarmCollector Initialize complete at " + this.StartTime.toString() + " took " + timer.TakeReading() + " ms" );
        if ( cuVariables.AutoRun ) {
            this.StartTest( cuVariables );
        }
    }

    /**
     * Get an existing AlarmTester, or create one
     * @returns {AlarmTester}
     */
    this.GetAlarmTester = function () {
        if ( !isDefined( Test.Alarm ) || !isDefined( Test.Alarm.AlarmTester ) ) {
            print( "AlarmCollector Creating AlarmTester" );
            var alarmTester = new AlarmTester();
            // alarm tester creates Test.Alarm
            Test.Alarm.AlarmTester = alarmTester;
        }
        return Test.Alarm.AlarmTester;
    }

    /** 
     * For each alarm type described by the model, create an object 
     * that can hold test results for each configured test.
     * For example, AlarmConditionType would cause the creation of a type placeholder
     * that would itself hold a map of all the autorun tests that have been configured.
     * Each Conformance unit has the ability to create the placeholder in case it does not
     * make sense to have a set of results for each type. (Refresh/Refresh2)
     */
    this.CreateTestTypePlaceholder = function () {
        var map = new KeyPairCollection();

        var types = cuVariables.AlarmTester.GetSupportedAlarmTypes();
        types.Iterate( function ( key, type, args ) {
            var testPlaceHolder = new Object();
            testPlaceHolder.Name = type.Name;
            testPlaceHolder.TypePassed = false;
            args.Map.Set( key, testPlaceHolder );

        }, { Map: map } );

        return map;
    }

    /**
     * Represents a mechanism to run a single test case
     * @param {Object} cuVariables - The CUVariables object created by each conformance unit.
     * @param {string} testName - Test Name
     * @param {Object} testObject - The test script object
     */
    this.RunSingleTest = function ( cuVariables, testName, testObject ) {

        if ( this.TestCases.Length() > 0 ) {
            addError( "Invalid initialization of single test" );
            stopCurrentUnit();
        }
        this.TestCases.Set( testName, testObject );
        this.StartTest( cuVariables );
    }

    /**
     * Represents a mechanism to run tests, from preparation, initialization to shutdown
     * @param {Object} cuVariables - The CUVariables object created by each conformance unit.
     */
    this.StartTest = function ( cuVariables ) {
        this.PrepareTests( cuVariables, this.TestCases );
        this.CreateTestStateEnum();
        this.ForEachTest( "Initialize" );
        this.EndTime = UaDateTime.utcNow();
        this.EndTime.addMilliSeconds( this.GetMaximumTestTime() );
        this.MinimumTime = UaDateTime.utcNow();
        this.MinimumTime.addMilliSeconds( this.GetAlarmTester().GetCycleTimeMilliSeconds() );
        print( "Test starting " + UaDateTime.utcNow().toString() +
            " Minimum end time " + this.MinimumTime.toString() +
            " Maximum end time " + this.EndTime.toString() );
        this.Loop();
        this.ForEachTest( "Shutdown" );
        cuVariables.CheckResults = true;
    }

    /** 
     * Creates a test result object for each test configured in the autorun.
     * Typically each alarm type in the model will have a collection of test result objects.
     * Used in conjunction with this.CreateTestTypePlaceholder
     * @param {Object} cuVariables - The CUVariables object created by each conformance unit.
     * @param {KeyPairCollection} testCases - Typically a map of placeholders for each Alarm type - this.TestTypeResults
     */
    this.PrepareTests = function ( cuVariables, testCases ) {

        var testCasesKeys = testCases.Keys();
        // may not be actual types
        var typeKeys = cuVariables.TestTypeResults.Keys();
        for ( var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++ ) {
            var typeKey = typeKeys[ typeIndex ];
            var testResults = cuVariables.TestTypeResults.Get( typeKey );

            testCases.Iterate( function ( key, testCase, args ) {
                if ( !isDefined( testResults.TestCases ) ) {
                    testResults.TestCases = new KeyPairCollection();
                }
                var testCaseResults = new Object();
                testCaseResults.TestsPassed = 0;
                testCaseResults.TestsFailed = 0;
                testCaseResults.TestsSkipped = 0;
                testResults.TestCases.Set( key, testCaseResults )
            }, { TestResults: testResults, This: this } );
        }
    }

    /**
     * Creates this.TestStateEnum, a bidirectional map that functions as a global state machine for running tests
     */
    this.CreateTestStateEnum = function () {
        // Need a two way map

        if ( !isDefined( this.TestStateEnum ) ) {
            var lookupIndex = new KeyPairCollection();
            var lookupState = new KeyPairCollection();
            var keys = this.TestCases.Keys();
            var index = 0;
            keys.forEach( function ( key ) {
                lookupIndex.Set( index, key + "_Waiting" );
                lookupState.Set( key + "_Waiting", index++ );
                lookupIndex.Set( index, key + "_Running" );
                lookupState.Set( key + "_Running", index++ );
                lookupIndex.Set( index, key + "_Completed" );
                lookupState.Set( key + "_Completed", index++ );
            } );

            this.TestStateEnum = { LookupIndex: lookupIndex, LookupState: lookupState };
            // Debug
            this.PrintTestStateEnum();
        }

        return this.TestStateEnum;
    }

    this.PrintTestStateEnum = function () {

        this.TestStateEnum.LookupIndex.Iterate( function ( index, state, args ) {
            print( "TestStateEnum Index " + index + " State " + state );
        }, {} );
    }

    /**
     * Determines if a received event can be processed for the specified test
     * This is the state machine controller for each Event Condition Id
     * @param {UaNodeId} conditionId - Condition Id of the event received
     * @param {string} testName - Test Name
     */
    this.CanRunTest = function ( conditionId, testName ) {
        var canRunTest = false;

        var key = conditionId.toString();
        if ( !this.TestIdStateMap.Contains( key ) ) {
            var stateHolder = new Object()
            stateHolder.State = this.TestStateEnum.LookupIndex.Get( 0 );
            this.TestIdStateMap.Set( key, stateHolder );
        }

        var stateHolder = this.TestIdStateMap.Get( key );

        // stateHolder.State contains the current name 

        var foundTestCase = stateHolder.State.indexOf( testName );
        if ( foundTestCase >= 0 ) {
            if ( stateHolder.State.indexOf( "_Waiting" ) >= 0 ||
                stateHolder.State.indexOf( "_Running" ) >= 0 ) {
                stateHolder.State = testName + "_Running";
                canRunTest = true;
            }
        }

        //this.DebugPrint( key + " CanRunTest " + testName + " = " + canRunTest + " Current State " + stateHolder.State );

        return canRunTest;
    }

    /**
     * Moves the state machine for a received Condition Id to the next test
     * @param {UaNodeId} conditionId - Condition Id of the event received
     * @param {string} testName - Test Name
     */
    this.TestCompleted = function ( conditionId, testName ) {
        var key = conditionId.toString();
        var stateHolder = this.TestIdStateMap.Get( key );
        var currentStateIndex = this.TestStateEnum.LookupState.Get( stateHolder.State );
        var completedState = testName + "_Completed";
        var completedStateIndex = this.TestStateEnum.LookupState.Get( completedState );

        if ( currentStateIndex < completedStateIndex ) {

            // Set to Completed
            stateHolder.State = completedState;

            print( conditionId + " TestCompleted found stateHolder " + key + " state = " + stateHolder.State );

            var stateIndex = this.TestStateEnum.LookupState.Get( stateHolder.State );
            var nextState = this.TestStateEnum.LookupIndex.Get( stateIndex + 1 );
            if ( isDefined( nextState ) ) {
                stateHolder.State = nextState;
            }
        }
    }

    /**
     * Helper function to make skipping a test case easier
     * @param {string} testName - Test Case Name
     * @param {UaNodeId} conditionId - Node Id containing ConditionId
     * @param {Object} localTestCase - Test Case Object, must contain a TestCase and State
     * @param {string} state - Desired state
     */
    this.Skip = function ( testName, conditionId, localTestCase, state ) {
        if ( isDefined( localTestCase.TestCase ) &&
            isDefined( localTestCase.State ) ) {
            localTestCase.TestCase.TestsSkipped++;
            localTestCase.State = state;
            this.TestCompleted( conditionId, testName );
        }
    }

    /**
     * Helper function to make failing a test case easier
     * @param {string} testName - Test Case Name
     * @param {UaNodeId} conditionId - Node Id containing ConditionId
     * @param {Object} localTestCase - Test Case Object, must contain a TestCase and State
     * @param {string} state - Desired state
     * @param {string} message - Error message to log
     */
    this.Error = function ( testName, conditionId, localTestCase, state, message ) {
        if ( isDefined( localTestCase.TestCase ) &&
            isDefined( localTestCase.State ) ) {
            localTestCase.TestCase.TestsFailed++;
            localTestCase.State = state;
            this.AddMessage( localTestCase.TestCase, this.Categories.Error, conditionId.toString() + " " + message );
            this.TestCompleted( conditionId, testName );
        }
    }

    /**
     * Retrieves the user configured tests for autorun tests.  This calls into the CTT to
     * determine which autorun tests are selected
     * @param {Object} cuVariables - The CUVariables object created by each conformance unit.
     */
    this.GetTests = function ( cuVariables ) {
        cuVariables.CheckResults = false;

        cuVariables.AutoRun = true;
        if ( scriptRunState == "Current" || scriptRunState == "CurrentDebug" ) {
            cuVariables.AutoRun = false;
        }

        print( "Initialization: AutoRun = " + cuVariables.AutoRun );

        var testMap = new KeyPairCollection();

        if ( cuVariables.AutoRun ) {

            var activeScripts = getSelectedScripts();

            for ( var index = 0; index < activeScripts.length; index++ ) {
                var includePath = activeScripts[ index ];
                var paths = includePath.split( "/" );
                var fileName = paths[ paths.length - 1 ];
                var testName = fileName.replace( ".js", "" );

                if ( isDefined( cuVariables.AutoTestMap ) ) {
                    var testCase = cuVariables.AutoTestMap.Get( testName );
                    if ( isDefined( testCase ) ) {
                        print( "Adding Test " + testName );
                        testMap.Set( testName, testCase );
                    }
                }
            }
        }

        return testMap;
    }

    /**
     * Retrieves the amount of time the Alarm tester should attempt to retrieve 
     * published events
     * @returns {number} Time to wait for events
     */
    this.GetIntervalTime = function () {
        if ( !isDefined( this.IntervalTime ) ) {
            // Default to ten seconds
            var millisecondsPerSecond = 1000;
            var interval = millisecondsPerSecond * 10;

            if ( isDefined( this.TestCases.GetIntervalTime ) ) {
                interval = this.TestCases.GetIntervalTime();
            }

            this.IntervalTime = interval;
        }
        return this.IntervalTime;
    }

    /**
     * Retrieves the maximum amount of time a test or conformance unit should run
     * This value is configured in the settings, or a conformance unit could overwrite the value
     * @returns {number} - Maximum test time
     */
    this.GetMaximumTestTime = function () {
        if ( !isDefined( this.MaximumTestTime ) ) {

            // I'd like a scenario where the total time for the AlarmCollector is a multiplier of the number of scripts to run
            var cycleTime = this.AlarmTester.GetCycleTime();
            var maxTestTime = this.AlarmTester.GetTotalCycleTimeMilliseconds();

            if ( isDefined( this.TestCases.GetMaximumTestTime ) ) {
                maxTestTime = this.TestCases.GetMaximumTestTime();
            }

            this.MaximumTestTime = maxTestTime;
            print( "MaximumTest time " + maxTestTime );
        }
        return this.MaximumTestTime;
    }

    /**
     * Main test loop that checks to see if the test is completed, and runs a single loop
     * Also informs each test that it is ending.
     */
    this.Loop = function () {

        var keepTesting = true;

        while ( keepTesting ) {
            if ( this.IsTestComplete() ) {
                keepTesting = false;
            } else {
                this.NonEventCheck();
                this.SingleLoop();
            }
        }
        this.EndTest();
    }

    /**
     * Determines if all the tests are completed, or if maximum test time has
     * been exceeded.
     * Checks all test cases for all types to see if there are any possible results,
     * which could be TestsPassed, TestsFailed, or TestsSkipped
     * @returns {boolean} - Is test complete.
     */
    this.IsTestComplete = function () {
        var testComplete = false;


        if ( UaDateTime.utcNow() > this.MinimumTime ) {
            // Past the minimum time
            if ( UaDateTime.utcNow() > this.EndTime ) {
                testComplete = true;
            } else {
                var typeKeys = this.TestTypeResults.Keys();
                var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
                var needToRunTest = false;
                for ( var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++ ) {
                    var typeKey = typeKeys[ typeIndex ];
                    var alarmType = alarmTypes.Get( typeKey );
                    if ( isDefined( alarmType ) ) {
                        var test = this.TestTypeResults.Get( typeKey );
                        if ( isDefined( test ) && isDefined( test.TestCases ) ) {
                            var testKeys = test.TestCases.Keys();
                            if ( isDefined( testKeys ) ) {
                                for ( var testIndex = 0; testIndex < testKeys.length; testIndex++ ) {
                                    var testKey = testKeys[ testIndex ];
                                    var testCase = test.TestCases.Get( testKey );
                                    if ( testCase.TestsPassed == 0 &&
                                        testCase.TestsFailed == 0 &&
                                        testCase.TestsSkipped == 0 ) {
                                        if ( !isDefined( testCase.IgnoreSkip ) || testCase.IgnoreSkip == false ) {
                                            if ( this.Branch ){
                                                if ( isDefined( alarmType.EncounteredAlarmBranch ) && 
                                                    alarmType.EncounteredAlarmBranch == true ) {
                                                    needToRunTest = true;
                                                }
                                            }else if ( isDefined( alarmType.EncounteredAlarm ) && 
                                                alarmType.EncounteredAlarm == true ) {
                                                needToRunTest = true;
                                            }

                                        }
                                        break;
                                    }
                                }
                            }
                            if ( needToRunTest ) {
                                break;
                            }
                        }
                    }
                }
                if ( !needToRunTest ) {
                    testComplete = true;
                }
            }
        }

        return testComplete;
    }

    /**
     * Provides an opportunity for each test to do any operation not dependant on events
     * Typically this is for operations that need to happen after a certain amount of time
     */
    this.NonEventCheck = function () {
        this.ForEachTest( "NonEventCheck" );
    }

    /**
     * Provides an opportunity for each test to do any cleanup at the end of a test
     * This has been superceeded by Shutdown
     */
    this.EndTest = function () {
        this.ForEachTest( "EndTest" );
    }

    /**
     * Tells each test to do some function.  For example it will tell each test that supports 
     * an Initialize method to initialize.
     * @param {string} functionCall - String representation of which function to call
     * @param {Object} args - Object specific to a function call
     */
    this.ForEachTest = function ( functionCall, args ) {
        var testKeys = this.TestCases.Keys();
        for ( var index = 0; index < testKeys.length; index++ ) {
            var testCaseKey = testKeys[ index ];
            var test = this.TestCases.Get( testCaseKey );
            if ( isDefined( test[ functionCall ] ) ) {
                if ( isDefined( args ) ) {
                    test[ functionCall ]( this, args );
                } else {
                    test[ functionCall ]( this );
                }
            }
        }
    }

    /**
     * Sends a message to the console regularly to inform the user how long the test will continue
     */
    this.SingleLoopSendUpdate = function () {
        if ( !isDefined( this.NextUpdate ) ) {
            this.SetNextUpdate();
        } else {
            var now = UaDateTime.Now();
            if ( this.NextUpdate < now ) {
                var timeRemaining = now.secsTo( this.EndTime );
                print( "Test will continue for a maximum of " + timeRemaining + " seconds" );
                this.SetNextUpdate();
            }
        }
    }

    /**
     * Sets the next time the test continue message will be sent
     */
    this.SetNextUpdate = function () {
        this.NextUpdate = UaDateTime.Now();
        this.NextUpdate.addMilliSeconds( this.NextUpdateInterval );
    }

    /**
     * Main Test - Waits for events then runs each event through every test
     * Can call PreLoopAction, NonAlarmEvent for potential audit events, and 
     * PostLoopAction
     */
    this.SingleLoop = function () {
        this.SingleLoopSendUpdate();
        var events = this.AlarmTester.WaitForEvents( this.GetIntervalTime() );
        if ( isDefined( events ) ) {
            this.StoreData();
            this.ForEachTest( "PreLoopAction", events );
            for ( var eventIndex = 0; eventIndex < events.length; eventIndex++ ) {
                var eventFields = events[ eventIndex ].EventFieldList.EventFields;

                var eventType = eventFields[ this.EventTypeIndex ].toNodeId();

                if ( !isDefined( eventType ) ) {
                    addError( "Single Loop encountered event with no event type " + eventFields.toString() );
                } else if ( gServerCapabilities.Debug ) {
                    print( "Single Loop Event Type " + eventType.toString() + " message " + this.GetSelectField( eventFields, "Message" ).toString() );
                }

                var testTypeObject = this.TestTypeResults.Get( eventType );

                if ( !isDefined( testTypeObject ) ) {
                    this.ForEachTest( "NonAlarmEvent", eventFields );
                } else {
                    this.Store( eventFields );
                    if ( this.AllowBranch( eventFields ) ) {
                        // Iterate through the test cases.  It is possible that there are no test cases
                        // if autorun, and no autorun tests were actually selected.
                        if ( isDefined( testTypeObject.TestCases ) ) {
                            var tests = testTypeObject.TestCases.Keys();
                            for ( var testIndex = 0; testIndex < tests.length; testIndex++ ) {
                                var testCaseKey = tests[ testIndex ];
                                var testCase = testTypeObject.TestCases.Get( testCaseKey );
                                var testObject = this.TestCases.Get( testCaseKey );
                                if ( isDefined( testObject.TestEvent ) ) {
                                    testObject.TestEvent( eventFields, testCase, this );
                                }
                            }
                        }
                    }
                }
            }
            this.ForEachTest( "PostLoopAction" );
            this.AlarmTester.RemoveEntry( events );
        }
    }

    /**
     * Determines if this event should be tested.
     * For the branch conformance unit, all events are tested
     * For all other conformance units, only branch 0 event are tested.
     * @param {object[]} eventFields - the alarm/event to be checked
     * @returns true if event should be tested
     */
    this.AllowBranch = function ( eventFields ) {
        var allowBranch = true;
        if ( this.IsBranch( eventFields ) ) {
            if ( !this.Branch ) {
                allowBranch = false;
            }
        }
        return allowBranch;
    }

    /**
     * Determines if this event is a branch.
     * @param {object[]} eventFields - the alarm/event to be checked
     * @returns true if event is a branch
     */
    this.IsBranch = function ( eventFields ) {
        return this.IsNonNullNodeId( eventFields, "BranchId" );
    }


    /**
     * Internal function to retrieve the test case for a specific test and eventType
     * @param {string} eventType Event/Alarm type node id as a string
     * @param {string} testCase Test Case Name, eg Test_001
     * @returns testcase containing counts of tests passed etc.
     */
    this.RetrieveTestCase = function ( eventType, testCase ) {

        var testCase = null;

        var typeResults = this.TestTypeResults.Get( eventType );
        if ( isDefined( typeResults ) && isDefined( typeResults.TestCases ) ) {
            var results = typeResults.TestCases.Get( testCase );
            if ( isDefined( results ) ) {
                testCase = results;
            }
        }

        return testCase;
    }

    /**
     * Store the event in the internal storage so there is a buffer of events for the most recent period of time
     * @param {object[]} eventFields - all eventfields for a specific event
     */
    this.Store = function ( eventFields ) {
        var conditionId = this.GetConditionId( eventFields ).toString();
        var eventType = eventFields[ this.EventTypeIndex ].toString();
        this.GetAlarmTester().AddEvent( {
            ConditionIdString: conditionId,
            EventTypeString: eventType,
            EventFields: eventFields,
            Collector: this
        } );

        var branchIdVariant = this.GetSelectField( eventFields, "BranchId" );
        // Mantis 8315 - BranchId Variant can be null
        var branchId = null;
        if ( isDefined( branchIdVariant ) && branchIdVariant.DataType > 0 ){
            branchId = branchIdVariant.toString();
        }else{
            branchId = new UaNodeId().toString();
        }

        var time = this.GetSelectField( eventFields, "Time" ).toString();

        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        var type = alarmTypes.Get( eventType.toString() );

        if ( isDefined( type ) ) {

            if ( !isDefined( type.ConditionIds ) ) {
                type.ConditionIds = new KeyPairCollection();
            }

            var conditionMap = this.GetStoreMap( conditionId, type.ConditionIds );

            type.ConditionIds.Set( conditionId, conditionMap );

            var branches = this.GetStoreMap( branchId, conditionMap );

            conditionMap.Set( branchId, branches );

            branches.Set( time, eventFields );
        }
    }

    /**
     * Debug, Print out all alarms stored internally.
     */
    this.PrintStore = function () {
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        alarmTypes.Iterate( function ( typeName, type, args ) {
            args.This.PrintStoreEventType( typeName, type, "\t" );
        }, { This: this } );

        print( "End", UaDateTime.utcNow().toString() );
    }

    /**
     * Debug, Print out all alarms stored internally for a specific alarm/event type
     * @param {string} name - alarm type friendly name
     * @param {string} type - node id of the type in string
     * @param {string} prefix - string to prefix the output, for formatting
     */
    this.PrintStoreEventType = function ( name, type, prefix ) {
        if ( isDefined( type.ConditionIds ) ) {
            print( "Store Type " + name );
            type.ConditionIds.Iterate( function ( id, map, args ) {
                args.This.PrintStoreCondition( id, map, prefix + "\t" );
            }, { This: this } );
        }
    }

    /**
     * Debug, Print out all alarms stored internally for a specific ConditionId type
     * @param {string} name - condition id name
     * @param {KeyPairCollection} condition - a map of all conditions for the condition id
     * @param {string} prefix - string to prefix the output, for formatting
     */
    this.PrintStoreCondition = function ( name, condition, prefix ) {
        print( prefix + "ConditionId " + name );
        condition.Iterate( function ( id, map, args ) {
            args.This.PrintStoreBranches( id, map, prefix + "\t" );
        }, { This: this } );
    }

    /**
     * Debug, Print out all alarms stored internally for a specific ConditionId type
     * @param {string} name - branch id name
     * @param {KeyPairCollection} branches - a map of all branches for the branch id
     * @param {string} prefix - string to prefix the output, for formatting
     */
    this.PrintStoreBranches = function ( name, branches, prefix ) {
        print( prefix + "BranchId " + name );
        branches.Iterate( function ( id, map, args ) {
            args.This.PrintStoreEvent( map, prefix + "\t" );
        }, { This: this } );
    }

    /**
     * Debug, Print out desired fields for a specific event
     * @param {object[]} event - all eventfields for a specific event
     * @param {string} prefix - string to prefix the output, for formatting
     */
    this.PrintStoreEvent = function ( event, prefix ) {
        this.PrintStoreField( "Time", event, prefix + "\t" );
        this.PrintStoreField( "EventId", event, prefix + "\t" );
        this.PrintStoreField( "Comment", event, prefix + "\t" );
        this.PrintStoreField( "Message", event, prefix + "\t" );
    }

    /**
     * Debug, Print out a desired field for a specific event
     * @param {string} name - name of the field to print
     * @param {object[]} eventFields - all eventfields for a specific event
     * @param {string} prefix - string to prefix the output, for formatting
     */
    this.PrintStoreField = function ( name, eventFields, prefix ) {
        // Mantis 8315 - Protect against null variants
        var fieldVariant = this.GetSelectField( eventFields, name );
        if ( fieldVariant.DataType > 0 ){
            print( prefix, name, this.GetSelectField( eventFields, name ).toString() );
        }
    }

    /**
     * Retrieve all alarms stored for a specified alarm/event type
     * @param {string} alarmType - desired alarm/event type
     * @returns map
     */
    this.GetAlarmTypeStoreMap = function ( alarmType ) {

        var retrievedMap = null;
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        var type = alarmTypes.Get( alarmType );

        if ( isDefined( type ) && isDefined( type.ConditionIds ) ) {
            retrievedMap = type.ConditionIds;
        }

        return retrievedMap;
    }

    /**
     * Retrieve an embedded map for a specified key
     * Alarm store is a series of embedded maps
     * Alarm/Event Type, ConditionId, BranchId, Alarms/Events
     * @param {string} id - key to find the desired embedded map from the alarm store 
     * @param {*} map - map to search for the id
     * @returns an embedded map
     */
    this.GetStoreMap = function ( id, map ) {
        var map = map.Get( id );
        if ( !isDefined( map ) ) {
            map = new KeyPairCollection();
        }

        return map;
    }

    /**
     * Print all Alarm conditions found during alarm testing 
     * Cumulative with Conformance Units
     */
    this.PrintFoundConditions = function () {

        print( "All Alarm Conditions encountered during alarm testing" );
        this.GetAlarmTester().FoundConditions.Iterate( function ( conditionIdString, conditionIdObject ) {
            print( conditionIdString );
            Object.keys( conditionIdObject ).forEach( function ( property ) {
                print( "\t" + property + ": " + conditionIdObject[ property ] )
            } );
        } );
    }

    /**
     * Store all data for monitored items defined as alarm sources
     */
    this.StoreData = function () {
        var itemDataMap = this.AlarmTester.GetDataItems();

        var clearData = true;
        itemDataMap.Iterate( function ( nodeIdString, itemObject, args ) {
            print( "AlarmCollector::Store Data " + nodeIdString + " SubscriptionId " + args.AlarmThread.Subscription.SubscriptionId + " item id " + itemObject.Item.ClientHandle );
            var bufferResults = args.AlarmThread.GetDataValues(
                args.AlarmThread.Subscription.SubscriptionId,
                itemObject.Item.ClientHandle,
                clearData
            );

            if ( bufferResults.status ) {
                if ( isDefined( bufferResults.values ) ) {
                    print( "AlarmCollector::Store Data " + nodeIdString + " number of updates " + bufferResults.values.length );
                    for ( var index = 0; index < bufferResults.values.length; index++ ) {
                        var dataValue = bufferResults.values[ index ];
                        itemObject.Values.push( dataValue )
                    }
                }
            }
        }, { AlarmThread: this.AlarmThreadHolder.AlarmThread } );

        this.DeleteOldData();
    }

    /**
     * Debug, print out all data stored for monitored items defined as alarm sources
     */
    this.PrintDataStore = function () {
        var itemDataMap = this.AlarmTester.GetDataItems();

        itemDataMap.Iterate( function ( nodeIdString, itemObject ) {
            print( "DataStore for " + nodeIdString );
            itemObject.Values.forEach( function ( dataValue ) {
                print( "\t" + nodeIdString + " " + dataValue.toString() );
            } );
        } );
    }



    /**
     * Delete all alarms/events and data that occurred more than the desired cycle time (three cycles ago)
     */
    this.DeleteOldData = function () {
        var oldDataTime = this.AlarmTester.GetOldDataTime();

        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        var collector = this;

        alarmTypes.Iterate( function ( nodeIdString, alarmType ) {
            if ( isDefined( alarmType.ConditionIds ) ) {
                alarmType.ConditionIds.Iterate( function ( conditionId, branchMap ) {
                    branchMap.Iterate( function ( branchId, eventMap ) {
                        eventMap.Iterate( function ( key, eventFields ) {
                            var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
                            if ( time.msecsTo( oldDataTime ) >= 0 ) {
                                print( "\tDelete Event " + conditionId + ":" + branchId +
                                    " Message " + collector.GetSelectField( eventFields, "Message" ).toString() );
                                eventMap.Remove( key );
                            }
                        } );
                    } );
                } );
            }
        } );

        var itemDataMap = this.AlarmTester.GetDataItems();
        itemDataMap.Iterate( function ( nodeIdString, itemObject ) {

            var deleteCounter = 0;
            itemObject.Values.forEach( function ( dataValue ) {
                var diff = dataValue.SourceTimestamp.msecsTo( oldDataTime );
                if ( dataValue.SourceTimestamp.msecsTo( oldDataTime ) >= 0 ) {
                    print( "\tDelete " + nodeIdString + " SourceTimestamp " + dataValue.SourceTimestamp.toString() + " oldDataTime " + oldDataTime.toString() );
                    deleteCounter++;
                }
            } );

            for ( var index = 0; index < deleteCounter; index++ ) {
                itemObject.Values.shift();
            }
        } );
    }

    /**
     * Validate a variant against it's expected datatype
     * @param {UaVariant} eventField - variant, could be null
     * @param {integer} expectedDataType - expected variant datatype
     * @returns 
     */
    this.ValidateDataType = function ( eventField, expectedDataType ) {
        var success = false;
        if ( isDefined( eventField ) ) {
            if ( eventField.DataType == expectedDataType ) {
                success = true;
            }
        }
        return success;
    }

    /**
     * Validate a comment against its expected value
     * @param {object[]} eventFields - alarm/event
     * @param {string} expectedComment - expected comment 
     * @param {object} testCase - testcase containing information about tests passed etc
     * @returns success or failure
     */
    this.ValidateComment = function ( eventFields, expectedComment, testCase ) {
        var commentValid = false;
        var actualComment = null;

        var comment = this.GetSelectField( eventFields, "Comment" ).toLocalizedText();

        if ( isDefined( comment ) && isDefined( comment.Text ) ) {
            actualComment = comment.Text;
            if ( actualComment == expectedComment ) {
                commentValid = true;
            }
        }

        if ( !commentValid ) {
            this.AddMessage( testCase, this.Categories.Error,
                this.GetConditionId( eventFields ).toString() +
                " Unexpected Comment Expected: " + expectedComment + " Actual: " + actualComment );
            testCase.TestsFailed++;
        }

        return commentValid;
    }

    /**
     * Validates the state of retain flag based off mandatory event fields.
     * @param {UaVariant[]} eventFields - Event Fields
     * @returns {boolean} - Retain state matches other event fields
     */
    this.ValidateRetain = function ( eventFields ) {

        var retain = this.GetBooleanValue( eventFields, "Retain" );
        var activeState = this.GetBooleanValue( eventFields, "ActiveState.Id" );
        var ackedState = this.GetBooleanValue( eventFields, "AckedState.Id" );

        // Confirmed State is not mandatory.  
        var confirmedStateSupported = false;
        var confirmedState = false;
        var confirmedString = "";
        var confirmedStateVariant = this.GetSelectField( eventFields, "ConfirmedState" );
        if ( confirmedStateVariant.DataType != 0 ) {
            confirmedStateSupported = true
            confirmedState = this.GetBooleanValue( eventFields, "ConfirmedState.Id" );
            confirmedString = " ConfirmedState = " + confirmedStateVariant.toString();
        }

        var branchId = this.GetSelectField( eventFields, "BranchId" ).toNodeId();

        var validated = true;

        var somethingSet = false;

        if ( activeState ) {
            somethingSet = true;
        } else if ( !ackedState ) {
            somethingSet = true;
        } else if ( confirmedStateSupported && !confirmedState ) {
            somethingSet = true;
        } else {
            // Need to check if there are branches for this conditionIdString.  This could be painful
            // For a conditionIdString, find out if there are any branches.  Then check the last event for the branches, and see whether it is still valid - retain = true
        }

        if ( somethingSet != retain ) {
            validated = false;
            print( "AlarmCollector::ValidateRetain failed " + " retain = " + retain +
                " Active State = " + activeState +
                " AckedState = " + ackedState +
                confirmedString );
        }

        return true;
    }

    /**
     * Validates whether SuppressedOrShelved value is valid
     * @param {object[]} eventFields - alarm/event
     * @returns success or failure
     */
    this.ValidateSuppressedOrShelvedFull = function ( eventFields ) {

        var shelved = false;
        var currentStateId = this.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" );
        if ( currentStateId.DataType != 0 ) {
            var currentStateNodeId = currentStateId.toNodeId();
            if ( !currentStateNodeId.equals( new UaNodeId( Identifier.ShelvedStateMachineType_Unshelved ) ) ) {
                shelved = true;
            }
        }

        var suppressed = this.GetBooleanValue( eventFields, "SuppressedState.Id" );
        var outOfService = this.GetBooleanValue( eventFields, "OutOfServiceState.Id" );
        var suppressedOrShelved = this.GetBooleanValue( eventFields, "SuppressedOrShelved" );

        var shouldBeSuppressedOrShelved = shelved || suppressed || outOfService;

        return shouldBeSuppressedOrShelved == suppressedOrShelved;
    }

    /**
     * Verifies the presence of LatchedState.Id
     * @param {UaVariant[]} eventFields - Event Fields
     */
    this.HasLatchedState = function ( eventFields ) {
        // This doesn't return the value of latched state, just verifies the presence
        var hasLatchedState = false;
        var latchedState = this.GetSelectField( eventFields, "LatchedState.Id" );
        if ( this.ValidateDataType( latchedState, BuiltInType.Boolean ) ) {
            hasLatchedState = true;
        }

        return hasLatchedState;
    }

    /**
     * Retrieve a specific boolean value from an alarm/event
     * @param {object[]} eventFields - alarm/event
     * @param {string} eventField - name of the desired eventField
     * @returns boolean value
     */
    this.GetBooleanValue = function ( eventFields, eventField ) {
        var isTrue = false;

        var fieldValue = this.GetSelectField( eventFields, eventField );
        if ( this.ValidateDataType( fieldValue, BuiltInType.Boolean ) ) {
            isTrue = fieldValue.toBoolean();
        }

        return isTrue;
    }

    /**
     * Gets localized text if it exists
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @returns {UaLocalizedText}
     */
    this.GetLocalizedText = function ( eventFields, eventField ) {
        var localizedText = null;

        var fieldValue = this.GetSelectField( eventFields, eventField );
        if ( this.ValidateDataType( fieldValue, BuiltInType.LocalizedText ) ) {
            localizedText = fieldValue.toLocalizedText();
        }

        return localizedText;
    }

    /**
     * Gets the boolean value from a two State variable type
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @returns {boolean}
     */
    this.GetTwoState = function ( eventFields, eventField ) {
        var booleanField = eventField + ".Id";
        var booleanValue = this.GetBooleanValue( eventFields, booleanField );
        var text = this.GetLocalizedText( eventFields, eventField );
        var recommendedText = this.AlarmTester.GetAlarmUtilities().
            GetAlarmNameHelper().GetTwoStateName( eventField, text, booleanValue );
        return booleanValue;
    }

    /**
     * Validate a TwoState value, including the Localized text
     * @param {object[]} eventFields - alarm/event
     * @param {string} eventField - name of the desired eventField
     * @param {*} expectedValue - expected boolean value
     * @returns success or failure
     */
    this.ValidateTwoState = function ( eventFields, eventField, expectedValue ) {

        var valid = false;

        var booleanField = eventField + ".Id";
        var booleanValue = this.GetBooleanValue( eventFields, booleanField );

        if ( booleanValue == expectedValue ) {
            valid = true;

            var text = this.GetLocalizedText( eventFields, eventField );
            if ( isDefined( text ) ) {
                // Now look up in recommended names.
                var recommendedText = this.AlarmTester.GetAlarmUtilities().
                    GetAlarmNameHelper().GetTwoStateName( eventField, text, booleanValue );
            }
        }

        return valid;
    }

    /**
     * Validate a SuppressedOrShelved against a specific value
     * @param {object[]} eventFields - alarm/event
     * @param {string} expectedValue - expected value of SuppressedOrShelved
     * @returns success or failure
     */
    this.ValidateSuppressedOrShelved = function ( eventFields, expectedValue ) {
        var success = false;
        var shelvedOrSuppressed = this.GetSelectField( eventFields, "SuppressedOrShelved" );
        if ( shelvedOrSuppressed.DataType >= 0 ) {
            if ( shelvedOrSuppressed.toBoolean() == expectedValue ) {
                success = true;
            }
        }

        return success;
    }

    /**
     * Determines is a specific nodeId field is null
     * @param {object[]} eventFields - alarm/event
     * @param {string} eventField - name of the desired eventField
     * @returns success or failure
     */
    this.IsNonNullNodeId = function ( eventFields, eventField ) {
        var isNonNull = false;

        var fieldValue = this.GetSelectField( eventFields, eventField );
        if ( this.ValidateDataType( fieldValue, BuiltInType.NodeId ) ) {
            var nodeId = fieldValue.toNodeId();
            if ( !UaNodeId.IsEmpty( nodeId ) ) {
                isNonNull = true;
            }
        }

        return isNonNull;
    }

    /**
     * Retrieve the ConditionId
     * @param {object[]} eventFields - alarm/event
     * @returns NodeId, or Null
     */
    this.GetConditionId = function ( eventFields ) {
        var conditionId = null;

        var lastIndex = eventFields.length - 1;
        var conditionIdVariant = eventFields[ lastIndex ];
        if ( this.ValidateDataType( conditionIdVariant, BuiltInType.NodeId ) ) {
            conditionId = conditionIdVariant.toNodeId();
        } else {
            var eventId = this.GetSelectField( eventFields, "EventId" ).toString();
            var eventType = this.GetSelectField( eventFields, "EventType" ).toString();
            var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
            print( "GetConditionId UnknownIssue: EventId " + eventId.toString() + " EventType " + eventType.toString() );
            if ( alarmTypes.Contains( eventType ) ) {
                addError( "Unable to get ConditionId from event Fields" );
                stopCurrentUnit();
            }
        }
        return conditionId;
    }

    /**
     * Determines if an alarm/event is active
     * @param {object[]} eventFields - alarm/event
     * @returns Is Active
     */
    this.IsActive = function ( eventFields ) {
        var isActive = false;
        var activeStateId = this.GetSelectField( eventFields, "ActiveState.Id" );
        if ( activeStateId.DataType > 0 ) {
            if ( activeStateId.toBoolean() == true ) {
                isActive = true;
            }
        }
        return isActive;
    }

    /**
     * Determines if an event is an AcknowledgeableConditionType or a subtype
     * @param {object[]} eventFields - alarm/event
     * @param {*} includeSubTypes - Check for subtypes
     * @returns acknowledgeable type
     */
    this.IsAcknowledgeable = function ( eventFields, includeSubTypes ) {
        var acknowledgeable = false;
        var eventType = eventFields[ this.EventTypeIndex ];
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
        var alarmEventType = alarmTypes.Get( eventType.toString() );
        if ( isDefined( alarmEventType ) ) {
            var knownAlarmType = alarmEventType.SpecAlarmTypeId;
            if ( includeSubTypes ) {
                if ( this.ConditionTypeNodeIdString != knownAlarmType ) {
                    acknowledgeable = true;
                }
            } else {
                if ( this.AcknowledgeableConditionTypeNodeIdString == knownAlarmType ) {
                    acknowledgeable = true;
                }
            }
        }

        return acknowledgeable;
    }

    /**
     * Determines if Acknowledged is true
     * @param {UaVariant[]} eventFields - All event fields for an event
     */
    this.IsAcknowledged = function ( eventFields ) {
        var acked = false;
        var acknowledged = this.GetSelectField( eventFields, "AckedState.Id" );
        if ( this.ValidateDataType( acknowledged, BuiltInType.Boolean ) ) {
            acked = acknowledged.toBoolean();
        }

        return acked;
    }

    /**
     * Determines if ConfirmedState exists and is true
     * @param {UaVariant[]} eventFields - All event fields for an event
     */
    this.IsConfirmed = function ( eventFields ) {
        var confirmed = false;
        var confirmVariant = this.GetSelectField( eventFields, "ConfirmedState.Id" );
        if ( this.ValidateDataType( confirmVariant, BuiltInType.Boolean ) ) {
            confirmed = confirmVariant.toBoolean();
        }

        return confirmed;
    }

    /**
     * Determines if Acknowledge/Confirm should be called
     * Ensures ActiveState.Id is true, and Acknowledge/Confirm is
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {UaVariant} variantValue - the event field for Acknowledge/Confirm 
     */
    this.ShouldAckConfirm = function ( eventFields, variantValue ) {

        var shouldAckConfirm = false;

        if ( this.ValidateDataType( variantValue, BuiltInType.Boolean ) ) {
            var ackConfirmState = variantValue.toBoolean();

            if ( ackConfirmState == false ) {
                // Only do this for active alarms, if AlarmConditionType or subtype
                // If AcknowledgeableConditionType, then go ahead
                var activeState = this.GetSelectField( eventFields, "ActiveState.Id" );
                if ( this.ValidateDataType( activeState, BuiltInType.Boolean ) ) {
                    if ( activeState ){
                        shouldAckConfirm = true;
                    }
                }else{
                    shouldAckConfirm = true;
                }
            }
        }

        return shouldAckConfirm;
    }

    /**
     * Determines if Acknowledge should be called
     * Ensures Acknowledge is False
     * @param {UaVariant[]} eventFields - All event fields for an event
     */
    this.ShouldAcknowledge = function ( eventFields ) {
        var ackedState = this.GetSelectField( eventFields, "AckedState.Id" );
        return this.ShouldAckConfirm( eventFields, ackedState );
    }

    /**
     * Determines if Confirm should be called
     * Ensures Confirm exists and is False
     * @param {UaVariant[]} eventFields - All event fields for an event
     */
    this.ShouldConfirm = function ( eventFields ) {
        var confirmedState = this.GetSelectField( eventFields, "ConfirmedState.Id" );
        return this.ShouldAckConfirm( eventFields, confirmedState );
    }

    /**
     * Adds a message to a specific test case
     * @param {Object} testCase - Test Case for specific test in alarm types
     * @param {string} category - Message Category
     * @param {string} message - Message
     */
    this.AddMessage = function ( testCase, category, message ) {
        if ( !isDefined( testCase[ category ] ) ) {
            testCase[ category ] = [];
        }

        testCase[ category ].push( category + ": " + message );

        this.DebugPrint( message );
    }

    /**
     * Checks the test case and adds errors for TestsFailed.
     * This is called from each autorun test
     * @param {Object} testCase - Test Case for specific test in alarm types
     * @param {string[]} categories - Categories that should have messages printed
     * @param {boolean} categories - Categories that should have messages printed
     */
    this.CheckResults = function ( testCase, categories ) {

        print( "Test Ending " + UaDateTime.utcNow().toString() +
            " Minimum end time " + this.MinimumTime.toString() +
            " Maximum end time " + this.EndTime.toString() );

        var success = true;
        var totalSuccesses = 0;
        var completeEncounteredAlarm = false;

        var keys = this.TestTypeResults.Keys();
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
        for ( var typeIndex = 0; typeIndex < keys.length; typeIndex++ ) {
            var key = keys[ typeIndex ];
            print( "CheckResults " + testCase + ": key " + key );
            var alarmType = alarmTypes.Get( key );
            var encounteredAlarms = false;

            if ( this.Branch ){
                if ( isDefined( alarmType ) && isDefined( alarmType.EncounteredAlarmBranch ) ) {
                    print( alarmType.Name + " Encountered Alarm Branch" );
                    encounteredAlarms = true;
                    completeEncounteredAlarm = true;
                }
            }else{
                if ( isDefined( alarmType ) && isDefined( alarmType.EncounteredAlarm ) ) {
                    print( alarmType.Name + " Encountered Alarms" );
                    encounteredAlarms = true;
                    completeEncounteredAlarm = true;
                }
            }

            var typeResults = this.TestTypeResults.Get( key );
            if ( isDefined( typeResults ) && isDefined( typeResults.TestCases ) ) {
                var results = typeResults.TestCases.Get( testCase );
                if ( isDefined( results ) ) {

                    var totalRecorded = results.TestsFailed + results.TestsPassed + results.TestsSkipped;
                    if ( totalRecorded > 0 ){
                        completeEncounteredAlarm = true;                        
                    }

                    var message = results.TestsFailed + " tests failed for " + typeResults.Name +
                        " : " + results.TestsPassed + " tests passed " + results.TestsSkipped + " tests skipped";

                    if ( results.TestsFailed > 0 ) {
                        addError( message );
                        if ( isDefined( results.Error ) ) {
                            results.Error.forEach( function ( error ) {
                                addError( error );
                                print( error );
                            } );
                        }
                        success = false;

                    } else if ( results.TestsPassed > 0 ) {
                        addSuccessMessage( results.TestsPassed + " tests passed for " + typeResults.Name + " " +
                            results.TestsSkipped + " tests skipped" );
                        totalSuccesses += results.TestsPassed;
                    } else {
                        if ( encounteredAlarms ) {
                            if ( !( isDefined( results.IgnoreSkip ) && results.IgnoreSkip == true ) ) {
                                addSkipped( message );
                            }
                        }
                    }

                    if ( isDefined( results.NotImplemented ) ){
                        results.NotImplemented.forEach( function( entry ){
                            notImplemented( entry );
                        } );
                    }

                    if ( isDefined( categories ) ) {
                        this.PrintMessages( results, typeResults, categories );
                    }
                } else {
                    addError( "Unable to get test results for test " + testCase + ": " + typeResults.Name );
                }
            } else {
                addError( "Unable to find typeResults for test " + testCase + ": key " + key );
            }
        }

        if ( !completeEncounteredAlarm ) {
            success = false;
            notImplemented( "No Alarms received from the server" );
        }

        return success;
    }

    /**
     * Allows a test to add any custom test result that doesn't fit in the normal
     * this.TestTypeResults
     * Allows for the Autorun to run the test, and store the results for test.CheckResults 
     * to access the data
     * @param {string} unit - name of the conformance unit 
     * @param {string} test - name of the test
     * @param {object} result - a custom object that defines a test result.  Test should know how to encode/decode 
     */
    this.AddCustomResult = function ( unit, test, result ) {

        if ( !isDefined( Test.Alarm.Results ) ) {
            Test.Alarm.Results = {};
        }

        if ( !isDefined( Test.Alarm.Results[ unit ] ) ) {
            Test.Alarm.Results[ unit ] = {};
        }

        Test.Alarm.Results[ unit ][ test ] = result;
    }

    /**
     * Add IgnoreSkips to test results when the test is only applicable to 
     * specific alarm types
     * @param {string[]} typesToNotIgnore 
     * @param {string} testName 
     */
    this.AddIgnoreSkips = function ( typesToNotIgnore, testName ) {
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
        var testTypeResults = this.TestTypeResults;
        alarmTypes.Iterate( function ( nodeIdString, typeObject ) {
            var skipIt = true;
            typesToNotIgnore.forEach( function ( typeToNotIgnore ) {
                if ( typeToNotIgnore == nodeIdString ) {
                    skipIt = false;
                }
            } );

            if ( skipIt ) {
                print( "AddIgnoreSkips adding " + nodeIdString );
                var testResults = testTypeResults.Get( nodeIdString );
                if ( isDefined( testResults ) && isDefined( testResults.TestCases ) ) {
                    var testResultObject = testResults.TestCases.Get( testName );
                    if ( isDefined( testResultObject ) ) {
                        testResultObject.IgnoreSkip = skipIt;
                    }
                }
            }
        } );
    }

    /**
    * Add IgnoreSkips to test results for the specified alarm type and test
    * when the test is only applicable to specific alarm types.
    * The reverse of AddIgnoreSkips, which adds the expected alarm types
    * @param {string[]} typesToNotIgnore 
    * @param {string} testName 
    */
    this.AddIgnoreSkipsForSpecificTypes = function ( typesToIgnore, testName ) {
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
        var testTypeResults = this.TestTypeResults;
        var skipThese = [];

        alarmTypes.Iterate( function ( nodeIdString, typeObject ) {
            typesToIgnore.forEach( function ( typeToIgnore ) {
                if ( typeToIgnore == nodeIdString ||
                    typeToIgnore == typeObject.SpecAlarmTypeId ) {
                    skipThese.push( nodeIdString );
                }
            } );
        } );

        skipThese.forEach( function ( nodeIdString ) {
            print( "AddIgnoreSkipsForSpecificTypes adding " + nodeIdString );
            var testResults = testTypeResults.Get( nodeIdString );
            if ( isDefined( testResults ) && isDefined( testResults.TestCases ) ) {
                var testResultObject = testResults.TestCases.Get( testName );
                if ( isDefined( testResultObject ) ) {
                    testResultObject.IgnoreSkip = true;
                }
            }
        } );
    }

    /**
     * Prints category messages for a specific AlarmType and Test
     * @param {Object[]} results - Test Results for a specific Alarm Type and Test
     * @param {Object} type - Alarm Type 
     * @param {string[]} categories - Configured types of messages to print
     */
    this.PrintMessages = function ( results, type, categories ) {
        if ( isDefined( categories ) ) {
            categories.forEach( function ( category ) {
                if ( isDefined( results[ category ] ) ) {
                    print( "\r" + category + " for type " + type.Name );
                    results[ category ].forEach( function ( message ) {
                        print( message );
                    } );
                }
            } );
        }
    }

    /**
     * Use the alarm thread Call method
     * @param {object} args - normal args for a CallHelper.Execute
     * @returns Status of the call
     */
    this.Call = function ( args ) {
        var callHelper = this.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
        callHelper.Execute( args );
        return new UaStatusCode( callHelper.Response.Results[ 0 ].StatusCode );
    }


    this.GetCallResponseTime = function () {
        var response = this.GetCallResponse();
        return response.ResponseHeader.Timestamp;
    }

    this.GetCallResponse = function () {
        var callHelper = this.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
        return callHelper.Response;
    }

    /**
     * Use the Alarm Thread to disable an alarm
     * @param {UaNodeId} conditionId - node id of the alarm/event to disable
     * @returns Status of the call
     */
    this.DisableAlarm = function ( conditionId ) {
        return this.Call( {
            MethodsToCall: [ {
                MethodId: new UaNodeId( Identifier.ConditionType_Disable ),
                ObjectId: conditionId
            } ],
            SuppressMessaging: true
        } );
    }

    /**
     * Use the Alarm Thread to enable an alarm
     * @param {UaNodeId} conditionId - node id of the alarm/event to enable
     * @returns Status of the call
     */
    this.EnableAlarm = function ( conditionId ) {
        return this.Call( {
            MethodsToCall: [ {
                MethodId: new UaNodeId( Identifier.ConditionType_Enable ),
                ObjectId: conditionId
            } ],
            SuppressMessaging: true
        } );
    }

    /**
     * Call ConditionRefresh using the alarm thread, and it's default subscription id
     * @returns Status of the call
     */
    this.ConditionRefresh = function () {
        print( "ConditionRefresh" );
        var subscriptionId = this.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId;
        var parameter = new UaVariant();
        parameter.setUInt32( subscriptionId );

        return this.Call( {
            MethodsToCall: [ {
                MethodId: new UaNodeId( Identifier.ConditionType_ConditionRefresh ),
                ObjectId: new UaNodeId( Identifier.ConditionType ),
                InputArguments: [ parameter ]
            } ],
            SuppressMessaging: true
        } );
    }

    /**
     * Call ConditionRefresh using the alarm thread, it's default subscription id,
     * and default monitored item
     * @returns Status of the call
     */
    this.ConditionRefresh2 = function () {
        print( "ConditionRefresh2" );
        var subscriptionId = this.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId;
        var subscriptionParameter = new UaVariant();
        subscriptionParameter.setUInt32( subscriptionId );

        var eventMonitoredItemId = this.AlarmThreadHolder.AlarmThread.EventMonitoredItem.MonitoredItemId;
        var itemParameter = new UaVariant();
        itemParameter.setUInt32( eventMonitoredItemId );

        return this.Call( {
            MethodsToCall: [ {
                MethodId: new UaNodeId( Identifier.ConditionType_ConditionRefresh2 ),
                ObjectId: new UaNodeId( Identifier.ConditionType ),
                InputArguments: [ subscriptionParameter, itemParameter ]
            } ],
            SuppressMessaging: true
        } );
    }

    /**
     * Smart Condition Refresh, Designed to be used when any refresh is required, not a specific ConditionRefresh 
     * call is required.
     * Calls ConditionRefresh2, then ConditionRefresh if the first call fails
     * If ConditionRefresh2 Fails and ConditionRefresh succeeds, then a recommendation is added that ConditionRefresh2 
     * is recommended
     */
    this.Refresh = function(){
        var refresh2Result = this.ConditionRefresh2();
        if ( refresh2Result.StatusCode == StatusCode.BadMethodInvalid ){
            var error = refresh2Result.toString();
            wait(100);
            var refreshResult = this.ConditionRefresh();
            if ( refreshResult.isGood() )
            {
                addRecommendation( "Server should support ConditionRefresh2 [" + error + "]" );
            }
            return refreshResult;
        }
        return refresh2Result;
    }

    /**
     * Acknowledge an alarm using the AlarmThread Call
     * @param {object[]} eventFields - alarm/event
     * @param {string} commentToSend - Comment to Send
     * @param {string} localeToUse - locale to use
     * @returns Status of the call
     */
    this.AcknowledgeAlarm = function ( eventFields, commentToSend, localeToUse ) {
        return this.CommentCall( eventFields, commentToSend, localeToUse,
            Identifier.AcknowledgeableConditionType_Acknowledge );
    }

    /**
     * Confirm an alarm using the AlarmThread Call
     * @param {object[]} eventFields - alarm/event
     * @param {string} commentToSend - Comment to Send
     * @param {string} localeToUse - locale to use
     * @returns Status of the call
     */
    this.ConfirmAlarm = function ( eventFields, commentToSend, localeToUse ) {
        return this.CommentCall( eventFields, commentToSend, localeToUse,
            Identifier.AcknowledgeableConditionType_Confirm );
    }

    /**
     * AddComment to an alarm using the AlarmThread Call
     * @param {object[]} eventFields - alarm/event
     * @param {string} commentToSend - Comment to Send
     * @param {string} localeToUse - locale to use
     * @returns Status of the call
     */
    this.AddComment = function ( eventFields, commentToSend, localeToUse ) {
        return this.CommentCall( eventFields, commentToSend, localeToUse,
            Identifier.ConditionType_AddComment );
    }

    /**
     * Do an operation that uses AddComment to an alarm using the AlarmThread Call
     * @param {object[]} eventFields - alarm/event
     * @param {string} commentToSend - Comment to Send
     * @param {string} localeToUse - locale to use
     * @param {*} identifier - Function to call
     * @returns Status of the call
     */
    this.CommentCall = function ( eventFields, commentToSend, localeToUse, identifier ) {

        // Keep the variant
        var eventId = eventFields[ this.AlarmThreadHolder.SelectFields.Get( "EventId" ).Index ];

        var conditionIdIndex = eventFields.length - 1;
        var conditionIdNodeId = eventFields[ conditionIdIndex ].toNodeId();
        return this.CommentCallEx( conditionIdNodeId, eventId, commentToSend, localeToUse, identifier );
    }

    /**
     * Detailed function call for 'Comment' style function calls.
     * Allows for flexible function calls
     * @param {UaNodeId} conditionIdNodeId - Condition Id Node Id
     * @param {UaVariant} eventId - Event Id to comment on
     * @param {string} commentToSend - Comment
     * @param {string} localeToUse - Locale id for LocalizedText
     * @param {int} identifier - Function call identifier 
     * @returns {UaStatusCode} - Function call Status Code 
     */
    this.CommentCallEx = function ( conditionIdNodeId, eventId, commentToSend, localeToUse, identifier ) {
        var commentVariant = new UaVariant();
        var comment = UaLocalizedText.New( { Text: commentToSend, Locale: localeToUse } );

        commentVariant.setLocalizedText( comment );
        return this.Call( {
            MethodsToCall: [ {
                MethodId: new UaNodeId( identifier ),
                ObjectId: conditionIdNodeId,
                InputArguments: [ eventId, commentVariant ]
            } ],
            SuppressMessaging: true
        } );
    }

    /**
     * Gets the default SelectFields Map, typically to get event field index numbers
     * @returns {KeyPairCollection}
     */
    this.GetSelectFields = function () {
        return this.AlarmThreadHolder.SelectFields;
    }

    /**
     * Gets the desired eventField value from the default SelectFields Map
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @returns {UaVariant} - Desired EventField Value
     */
    this.GetMandatorySelectField = function ( eventFields, selectField, type ) {
        var field = this.GetSelectFieldFromMap( eventFields, selectField,
            this.GetSelectFields() );
        if ( !this.ValidateDataType( field, type ) ) {
            addError( "Unable to get mandatory event field " + selectField );
        }

        return field;
    }

    /**
     * Gets the desired eventField value from the default SelectFields Map
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @returns {UaVariant} - Desired EventField Value
     */
    this.GetSelectField = function ( eventFields, selectField ) {
        return this.GetSelectFieldFromMap( eventFields, selectField,
            this.GetSelectFields() );
    }

    /**
     * Gets the desired eventField value from the specified SelectFields Map
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @param {KeyPairCollection} selectFields - Map containing the desired selectFields
     * @returns {UaVariant} - Desired EventField Value
     */
    this.GetSelectFieldFromMap = function ( eventFields, selectField, selectFields ) {
        var field = selectFields.Get( selectField );
        if ( !isDefined( field ) || !isDefined( field.Index ) ) {
            // Leaving this message in to find programming errors
            debugger;
            throw ( "AlarmCollector::GetSelectFieldFromMap errored looking for selectField " + selectField );
        }
        var index = field.Index;
        return eventFields[ index ];
    }

    /**
     * Retrieve a list of node ids of a desired alarm type and all non standard derived alarm types
     * @param {string} baseType 
     */
    this.GetAlarmTypesAndSubTypes = function ( baseType ) {
        var nodeIds = [];
        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();
        alarmTypes.Iterate( function ( nodeIdString, typeObject ) {
            if ( nodeIdString == baseType ) {
                nodeIds.push( nodeIdString );
            } else if ( isDefined( typeObject.SpecAlarmTypeId ) &&
                baseType == typeObject.SpecAlarmTypeId ) {
                nodeIds.push( nodeIdString );
            }
        } );
        return nodeIds;
    }

    /**
     * Generate a random Event Id
     * @yields {UaByteString}
     */
    this.GenerateEventId = function () {
        var characters = "";
        for ( var index = 0; index < 32; index++ ) {
            characters += this.GenerateGuidCharacter();
        }

        var bytes = [];
        for ( var index = 0; index < characters.length / 2; index++ ) {
            var multipliedIndex = index * 2;
            var substring = characters.substring( multipliedIndex, multipliedIndex + 2 );
            bytes[ index ] = parseInt( substring, 16 );
        }

        return UaByteString.FromByteArray( bytes );
    }

    /**
     * Generate a random guid character
     * @yields {char}
     */
    this.GenerateGuidCharacter = function () {
        var character = "";
        if ( Math.floor( Math.random() * 10 ) % 2 == 0 ) {
            //Generate number
            character = Math.floor( Math.random() * 10 ).toString();
        } else {
            // Generate letter
            var asciiA = 65;
            var ascii = Math.floor( Math.random() * 6 ) + asciiA;
            character = String.fromCharCode( ascii );
        }
        return character;
    }

    /**
     * Debug, print out the final states for a specific test
     * @param {string} testName - Test Name (eg Test_001)
     * @param {KeyPairCollection} map - test case map
     */
    this.DebugFinalState = function ( testName, map ) {
        print( "Test " + testName + " Final States" );
        map.Iterate( function ( key, testCase, args ) {
            args.This.DebugPrint( key + " Final State: " + testCase.State );
        }, { This: this } );
    }

    /**
     * Debug Print a message with a timestamp
     * @param {string} message - message to print
     */
    this.DebugPrint = function ( message ) {
        if ( gServerCapabilities.Debug == true ) {
            print( UaDateTime.utcNow().toString() + " - " + message );
        }
    }

    /**
     * Debug function specifically to check enabled/Disabled States
     */
    this.CheckEnabledState = function () {
        print( "CheckEnabledState" );
        var items = [];
        this.AlarmTester.GetSupportedAlarmTypes().Iterate( function ( key, type, args ) {
            type.Instances.Iterate( function ( instanceKey, instance, args ) {
                var item = UaNodeId.fromString( instanceKey + ".EnabledState" );
                if ( isDefined( item ) ) {
                    items.push( UaNodeId.fromString( instanceKey + ".EnabledState" ) );
                } else {
                    print( "Unknown InstanceKey " + instanceKey + " for " + key );
                }
            } );
        } )

        var readItems = MonitoredItem.fromNodeIds( items );
        this.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.ReadHelper.Execute( { NodesToRead: readItems } );
        print( "Reading " + readItems.length + " Enabled Items " );
        readItems.forEach( function ( item ) {
            if ( item.Value.StatusCode.isGood() ) {
                print( item.NodeId.toString() + " enabled = " + item.Value.Value.toString() );
            } else {
                print( "Unable to read " + item.NodeId.toString() );
            }
        } );

        return readItems;
    }

    this.GetPreviousToleranceTime = function ( desiredTime ) {
        var toleranceTime = 500;
        if ( isDefined( Settings.ServerTest.AlarmsAndConditions.TimeTolerance ) ) {
            toleranceTime = Settings.ServerTest.AlarmsAndConditions.TimeTolerance;
        }
        var minTime = new UaDateTime( desiredTime );
        minTime.addMilliSeconds( -toleranceTime );
        return minTime;
    }

    /**
     * Retrieve NormalState value from OffNormal alarm types
     * @param {object[]} eventFields - alarm/event 
     * @returns NormalState variant
     */
    this.GetNormalStateVariant = function ( eventFields ) {
        var returnValue = new UaVariant();
        // Assume normal state is boolean value of zero
        returnValue.setBoolean( false );

        // NormalState is a part of OffNormalAlarmType and subtypes.
        // Just check and see if NormalState has a value, as it is mandatory.

        if ( this.IsNonNullNodeId( eventFields, "NormalState" ) ) {
            var normalStateNodeId = this.GetSelectField( eventFields, "NormalState" ).toNodeId();
            var normalStateNodeIdString = normalStateNodeId.toString();
            // Check and see if there is already a value for this.
            var alarmTester = this.GetAlarmTester();
            if ( !alarmTester.NormalStateExists( normalStateNodeIdString ) ) {
                var readItems = MonitoredItem.fromNodeIds( normalStateNodeId );
                ReadHelper.Execute( { NodesToRead: readItems } );
                print( "Reading NormalState NodeId" + normalStateNodeIdString );
                var readItem = readItems[ 0 ];
                if ( readItem.Value.StatusCode.isGood() ) {
                    alarmTester.AddNormalState( normalStateNodeIdString, readItem.Value.Value );
                } else {
                    addError( "AlarmCollector::GetNormalStateVariant Unable to read NormalState nodeId " + normalStateNodeIdString );
                }
            }

            var possibleValue = alarmTester.GetNormalStateVariant( normalStateNodeIdString );

            if ( possibleValue.DataType != 0 ) {
                returnValue = possibleValue;
            }
        }

        return returnValue
    }

    /**
 * Get an alarm instance from the condition id, if an instance exists
 * @param {object[]} eventFields - alarm/event fields
 * @returns alarm instance, or null
 */
    this.GetInstance = function ( eventFields ) {

        var instance = null;

        var alarmTypes = this.GetAlarmTester().GetSupportedAlarmTypes();

        var eventType = eventFields[ this.EventTypeIndex ];

        var alarmType = alarmTypes.Get( eventType.toString() );

        if ( isDefined( alarmType ) && isDefined( alarmType.Instances ) ) {
            var conditionIdString = this.GetConditionId( eventFields ).toString();
            instance = alarmType.Instances.Get( conditionIdString );
        }

        return instance;
    }

    this.ConditionHasBranch = function ( eventFields ) {
        var hasBranch = false;
        var conditionIdString = this.GetConditionId( eventFields ).toString();

        var conditionMap = this.GetConditionFromStore( eventFields );
        if ( isDefined( conditionMap ) ) {
            var keys = conditionMap.Keys();
            for( var index = 0; index < keys.length; index++ ){
                this.DebugPrint( conditionIdString + " has branch " + keys[ index ] );
                if ( keys[ index ].indexOf( "i=0" ) != 0 ){
                    hasBranch = true;
                    break;
                }
            }
        }

        return hasBranch;
    }

    /**
     * Retrieve the map of all events for a specific conditionId
     * @param {object[]} eventFields - alarm/event
     * @returns the map of all events for a specific conditionId or null
     */
    this.GetConditionFromStore = function ( eventFields ) {
        var map = null;
        var conditionIdString = this.GetConditionId( eventFields ).toString();
        var eventType = eventFields[ this.EventTypeIndex ].toString();

        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        var type = alarmTypes.Get( eventType.toString() );

        if ( isDefined( type ) && isDefined( type.ConditionIds ) ) {
            map = this.GetStoreMap( conditionIdString, type.ConditionIds );
        }
        return map;
    }


    if ( customInitialize !== true ) {
        this.Initialize( cuVariables );
    }
};

