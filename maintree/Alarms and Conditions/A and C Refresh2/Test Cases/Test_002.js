/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Refresh2/Test Cases/Test_002.js
        Test is not shared

    Description:    
        Create 2 subscriptions with each monitoring conditions of different types. Invoke ConditionRefresh2 for each subscription.

    Requirements:
        Server must support 2 or more subscriptions. If not this test case can be skipped.
    
    Expectation:
        The order of events should be:
         - RefreshStartEventType
         - List of Retained Conditions (as ConditionType or ConditionType subtypes)
         - RefreshEndEventType
        
    How this test works:
        Call Refresh as soon as possible.  
        Look for start/stop events 
        Verify there are events in between start/stop events
        Test uses Buffer event ids as events are gathered by CTT thread
*/


function Test_002 () {

    this.TestName = "Test_002";
    this.TestIdentifier = CUVariables.Refresh.Virtual.MethodId;
    this.ContinueTest = true;

    this.States = {
        Initial: "Initial",
        UnableToStart: " UnableToStart",
        RefreshFailed: "RefreshFailed",
        WaitingForStart: "WaitingForStart",
        UnableToFindStart: "UnableToFindStart",
        WaitingForEnd: "WaitingForEnd",
        UnableToFindEnd: "UnableToFindEnd",
        ReadyToTest: "ReadyToTest",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestData = new Object();
    this.Extra = new Object();


    this.Initialize = function ( collector ) {
        collector.CanRunTest( this.TestIdentifier, this.TestName );

        var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
        CUVariables.Refresh.InitializeTestData( collector, this.TestData, "Main", this.TestName );
        CUVariables.Refresh.InitializeSubscription( this.TestData, 
            CUVariables.AlarmThreadHolder.SelectFields,
            alarmThread,
            alarmThread.Subscription,
            alarmThread.EventMonitoredItem );

        CUVariables.Refresh.InitializeTestData( collector, this.Extra, "Extra", this.TestName );

        var selectFieldsMap = new KeyPairCollection();
        var mandatory = false;
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;

        var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
        alarmUtilities.CreateSelectFieldsMap( CUVariables.Refresh.SystemEventTypeString,
            selectFieldsMap, mandatory, startIndexObject );
        this.Extra.ExtraAlarmDetails = alarmThread.AddEventItemExtended( {
            EventNodeId: new UaNodeId( Identifier.Server ),
            SelectFields: selectFieldsMap
        } );
        this.Extra.ItemCreated = this.Extra.ExtraAlarmDetails.ItemCreated;
        if ( this.Extra.ItemCreated ) {
            CUVariables.Refresh.InitializeSubscription( this.Extra, 
                selectFieldsMap, alarmThread,
                this.Extra.ExtraAlarmDetails.Subscription,
                this.Extra.ExtraAlarmDetails.EventMonitoredItem );
        } else {
            CUVariables.Refresh.Fail( collector, this.Extra, this.States.UnableToStart, 
                "Unable to create second event handler", this.ContinueTest );
            this.ContinueTest = false;    
        }
    }

    this.Shutdown = function () {
        CUVariables.Refresh.ShutdownItem( this.Extra );
    }

    this.PreLoopAction = function ( collector, events ) {
        if ( collector.CanRunTest( this.TestIdentifier, this.TestName ) && this.ContinueTest ) {
            this.TestData.Buffer = events;
            CUVariables.Refresh.GetExtraBuffer( this.Extra );
            this.PrepareTest( collector, this.TestData );
            this.PrepareTest( collector, this.Extra );
            if ( this.TestData.TestState == this.States.ReadyToTest &&
                this.Extra.TestState == this.States.ReadyToTest ) {
                this.Test( collector );
            }
        }
    }

    this.PrepareTest = function ( collector, testData ) {
        if ( this.ContinueTest ) {
            if ( testData.TestState == this.States.Initial ) {
                this.CallRefresh( collector, testData );
            } else if ( testData.TestState == this.States.WaitingForStart ||
                testData.TestState == this.States.WaitingForEnd ) {
                CUVariables.Refresh.ProcessEvents( collector, testData );
                if ( testData.TestState == this.States.WaitingForStart ) {
                    testData.WaitingForStartCounter++;
                    if ( testData.WaitingForStartCounter > testData.WaitLimit ) {
                        this.Fail( collector, testData.TestCase, this.States.UnableToFindStart,
                            " Unable to find refresh start event" );
                    }
                } else if ( testData.TestState == this.States.WaitingForEnd ) {
                    testData.WaitingForEndCounter++;
                    if ( testData.WaitingForEndCounter >= this.WaitLimit ) {
                        this.Fail( collector, testData.TestCase, this.States.UnableToFindEnd,
                            " Unable to find end refresh event" );
                    }
                }
            }
        }
    }

    this.CallRefresh = function ( collector, testData ) {
        if ( this.ContinueTest ) {
            print( "CallRefresh " + testData.Name + " " + testData.TestState + " Refresh Required " + this.RefreshRequired );

            testData.RefreshTime = UaDateTime.utcNow();
            var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

            var status = CUVariables.Refresh.CallRefreshDetails(
                CUVariables, callHelper, testData.SubscriptionId, 
                testData.EventItem.MonitoredItemId );

            if ( status.isGood() ) {
                testData.TestState = this.States.WaitingForStart;
            } else {
                this.Fail( collector, testData, this.States.RefreshFailed,
                    " Call to " + CUVariables.Refresh.Virtual.BrowseNameText + " Failed [" + 
                    status.toString() + "]" );
            }
        }
    }

    this.Test = function ( collector ) {
        if ( this.ContinueTest ) {
            if ( CUVariables.Refresh.VerifyStartBeforeEnd( collector, this.TestData, this.States.Failed ) &&
                CUVariables.Refresh.VerifyStartBeforeEnd( collector, this.Extra, this.States.Failed ) ) {
                if ( this.TestData.SaveEvents.length == 0 ||
                    this.Extra.SaveEvents.length == 0 ) {
                    print( "No Events, Resetting" );
                    // Not enough to test.
                    this.RefreshRequired = true;
                    CUVariables.Refresh.ResetTestData( this.TestData, this.States.Initial );
                    CUVariables.Refresh.ResetTestData( this.Extra, this.States.Initial );
                }else{
                    this.TestData.State = this.States.Completed;
                    this.TestData.TestCase.TestsPassed++;
                    this.Extra.State = this.States.Completed;
                    this.Extra.TestCase.TestsPassed++;
                    collector.TestCompleted( this.TestIdentifier, this.TestName );
                }
            }
        }
    }

    this.Fail = function ( collector, testData, state, errorMessage ) {
        CUVariables.Refresh.Fail( collector, testData, state, errorMessage, this.ContinueTest );
        this.ContinueTest = false;
    }

    this.PostLoopAction = function ( collector ) {
        CUVariables.Refresh.PostLoopDeleteEvents( this.Extra );
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