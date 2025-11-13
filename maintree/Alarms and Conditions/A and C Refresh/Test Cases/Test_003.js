/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Refresh/Test Cases/Test_003.js
        Test is not shared

    Description:    
        Create 2 subscriptions with each have a monitored item with a different (unique) filter. 
        Invoke ConditionRefresh for each subscription.
    
    Requirements:
        Server must support 2 or more subscriptions.
    
    Expectation:
        Both subscriptions return events that are specific to the subscription Filter. 
        A RefreshStartEvent is received along with the events, and then a RefreshEndEvent.

    How this test works:
        Call Refresh as soon as possible.  
        Look for start/stop events 
        Verify there are events in between start/stop events
        Test uses Buffer event ids as events are gathered by CTT thread
*/

function Test_003 () {

    this.TestName = "Test_003";
    this.TestIdentifier = CUVariables.Refresh.Virtual.MethodId;
    this.ContinueTest = true;
    this.WaitLimit = 5;

    this.States = {
        Initial: "Initial",
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
        var addExtraDetails = alarmThread.AddEventItemExtended( {
            EventNodeId: new UaNodeId( Identifier.Server ),
            SelectFields: selectFieldsMap
        } );
        this.Extra.ItemCreated = addExtraDetails.ItemCreated;
        if ( this.Extra.ItemCreated ) {
            CUVariables.Refresh.InitializeSubscription( this.Extra, 
                selectFieldsMap, alarmThread,
                addExtraDetails.Subscription,
                addExtraDetails.EventMonitoredItem );
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
        print("Preloop testdata state = " + this.TestData.TestState + " extra state = " + this.Extra.TestState );
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
            print( "CallRefresh " + testData.Name + " " + testData.TestState );

            testData.RefreshTime = UaDateTime.utcNow();

            var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

            var status = CUVariables.Refresh.CallRefreshDetails(
                CUVariables, callHelper, testData.SubscriptionId, 
                testData.EventItem.MonitoredItemId );

            if ( status.isGood() ) {
                testData.TestState = this.States.WaitingForStart;
                success = true;
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
                    CUVariables.Refresh.ResetTestData( this.TestData, this.States.Initial );
                    CUVariables.Refresh.ResetTestData( this.Extra, this.States.Initial );
                } else {
                    this.Compare( collector, this.TestData );
                    this.Compare( collector, this.Extra );
                    if ( this.ContinueTest ) {
                        collector.TestCompleted( this.TestIdentifier, this.TestName );
                        this.ContinueTest = false;
                    }
                }
            }
        }
    }

    this.Compare = function ( collector, testData ) {
        var success = true;
        for ( var index = 0; index < testData.SaveEvents.length; index++ ) {
            if ( !this.ValidateEvent( collector, testData, testData.SaveEvents[ index ] ) ) {
                success = false;
            }
        }
        if ( success ) {
            testData.TestCase.TestsPassed++;
        }
    }

    this.ValidateEvent = function ( collector, testData, event ) {
        var success = true;
        // Need to return true to pass the test case.  Do I?
        var eventFields = event.EventFieldList.EventFields;
        var eventId = collector.GetSelectFieldFromMap( eventFields, "EventId", testData.SelectFields );
        if ( event.EventHandle > testData.StartEvent.EventHandle ||
            event.EventHandle < testData.EndEvent.EventHandle ) {
            // Add one to select fields to handle condition id automatically added
            var verifyLength = testData.SelectFields.Length() + 1;
            if ( eventFields.length != verifyLength ) {
                this.Fail( collector, testData, this.States.Failed, "Event " + eventId.toString() +
                    " has invalid number of fields Expected " + verifyLength + " Actual " + eventFields.length );
                success = false;
            }

            // Retain flag should be set to true
            if ( testData.SelectFields.Contains( "Retain") ){
                var retain = collector.GetSelectFieldFromMap( eventFields, "Retain", testData.SelectFields ).toBoolean();
                if ( !retain ){
                    this.Fail( collector, testData, this.States.Failed, "Event " + eventId.toString() +
                        " Refreshed even though retain is false" );
                    success = false;
                }
            }
        } else {
            this.Fail( collector, testData, this.States.Failed, "Event " + eventId.toString() +
                " arrived in invalid order" );
            success = false;
        }
        return success;
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
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}
