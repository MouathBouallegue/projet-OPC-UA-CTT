/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Refresh/Test Cases/Test_002.js
        Test is not shared.

    Description:    
        Connect to the Server, create a subscription for two MonitoredItem (Notifier) and invoke ConditionRefresh().
    
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
    this.RefreshRequired = true;
    this.RefreshTime = null;

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

        var selectFieldsMap = CUVariables.AlarmThreadHolder.SelectFields;
        var eventItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) )[0];
        eventItem.AttributeId = Attribute.EventNotifier;
        eventItem.QueueSize = CUVariables.AlarmTester.AlarmThreadHolder.AlarmThread.DesiredQueueSize;
        eventItem.Filter = new UaExtensionObject();
        var eventFilter = new UaEventFilter();

        eventFilter.SelectClauses = alarmThread.CreateSelect( selectFieldsMap );

        eventItem.Filter.setEventFilter( eventFilter );

        if ( alarmThread.SessionThread.Helpers.CreateMonitoredItemsHelper.Execute(
            {
                ItemsToCreate: eventItem,
                SubscriptionId: alarmThread.Subscription,
                ThreadId: alarmThread.SessionThread.ThreadId
            } ) ) {
            CUVariables.Refresh.InitializeSubscription( this.Extra, 
                selectFieldsMap,
                alarmThread,
                alarmThread.Subscription,
                eventItem );
        }else{
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
            if ( this.RefreshRequired ){

                this.RefreshTime = UaDateTime.utcNow();
                testData.RefreshTime = this.RefreshTime;

                var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

                var status = CUVariables.Refresh.CallRefreshDetails(
                    CUVariables, callHelper, 
                    testData.SubscriptionId, testData.EventItem.MonitoredItemId );

                if ( status.isGood() ) {
                    testData.TestState = this.States.WaitingForStart;
                } else {
                    this.Fail( collector, testData, this.States.RefreshFailed,
                        " Call to " + CUVariables.Refresh.Virtual.BrowseNameText + " Failed [" + 
                        status.toString() + "]" );
                }

                this.RefreshRequired = false;
            }else{
                // Refresh already called
                testData.RefreshTime = this.RefreshTime;
                testData.TestState = this.States.WaitingForStart;
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