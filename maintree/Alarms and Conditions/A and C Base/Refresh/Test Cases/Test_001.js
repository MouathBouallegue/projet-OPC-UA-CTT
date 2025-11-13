/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_001.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        Connect to the Server, create a subscription for an MonitoredItem (Notifier) and invoke ConditionRefresh().
    
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

function Test_001 () {

    this.TestName = "Test_001";
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

    this.Initialize = function ( collector ) {
        collector.CanRunTest( this.TestIdentifier, this.TestName );

        var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
        CUVariables.Refresh.InitializeTestData( collector, this.TestData, "Main", this.TestName );
        CUVariables.Refresh.InitializeSubscription( this.TestData, 
            CUVariables.AlarmThreadHolder.SelectFields,
            alarmThread,
            alarmThread.Subscription,
            alarmThread.EventMonitoredItem );
    }

    this.PreLoopAction = function ( collector, events ) {
        if ( collector.CanRunTest( this.TestIdentifier, this.TestName ) && this.ContinueTest ) {
            this.TestData.Buffer = events;
            this.PrepareTest( collector, this.TestData );
            if ( this.TestData.TestState == this.States.ReadyToTest ) {
                print( this.TestName + " Ready to test " );
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

            var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

            var startTime = UaDateTime.utcNow();
            var status = CUVariables.Refresh.CallRefreshDetails(
                CUVariables, callHelper, testData.SubscriptionId, 
                testData.EventItem.MonitoredItemId );
            var elapsed = startTime.msecsTo(UaDateTime.utcNow()); 
            this.RefreshTime = new UaDateTime(callHelper.Response.ResponseHeader.Timestamp);
            this.RefreshTime.addMilliSeconds( -elapsed );
    
            testData.RefreshTime = this.RefreshTime;

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
            if ( CUVariables.Refresh.VerifyStartBeforeEnd( collector, this.TestData, this.States.Failed ) ) {
                if ( this.TestData.SaveEvents.length == 0 ) {
                    print( "No Events, Resetting" );
                    // Not enough to test.
                    this.RefreshRequired = true;
                    CUVariables.Refresh.ResetTestData( this.TestData, this.States.Initial );
                }else{
                    this.TestData.State = this.States.Completed;
                    this.TestData.TestCase.TestsPassed++;
                    collector.TestCompleted( this.TestIdentifier, this.TestName );
                }
            }
        }
    }

    this.Fail = function ( collector, testData, state, errorMessage ) {
        CUVariables.Refresh.Fail( collector, testData, state, errorMessage, this.ContinueTest );
        this.ContinueTest = false;
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
        Test.Execute( { Procedure: Test_001 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_001 } );
    }
}