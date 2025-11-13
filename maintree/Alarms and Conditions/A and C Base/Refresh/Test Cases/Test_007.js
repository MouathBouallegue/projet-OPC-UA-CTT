/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_007.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        Create a subscription for events and observing the communication for a while 
        (e.g. until 10 Alarms have been received). After receiving several Alarms call 
        the ConditionRefresh method and see if all Alarms are reported.

    
    Expectation:
        All previous events can be received.
        The order of events should be:
        - RefreshStartEventType
        - List of Retained Conditions (as ConditionType or ConditionType subtypes)
        - RefreshEndEventType
        
*/

function Test_007 () {

    this.TestName = "Test_007";
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
        UnableToRefresh: "UnableToRefresh",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestData = new Object();
    this.Tolerance = 1000;

    this.Initialize = function ( collector ) {
        CUVariables.Refresh.InitializeTestData( collector, this.TestData, "Main", this.TestName );
        CUVariables.Refresh.InitializeSubscription( this.TestData,
            collector.AlarmThreadHolder.SelectFields,
            collector.AlarmThreadHolder.AlarmThread,
            collector.AlarmThreadHolder.AlarmThread.Subscription,
            collector.AlarmThreadHolder.AlarmThread.EventMonitoredItem );
        this.TestData.States = this.States;
        this.TestData.ActiveEvents = new KeyPairCollection();
        this.TestData.RefreshedEvents = new KeyPairCollection();
        this.TestData.RefreshTriggerCount = 10;

    }

    this.PreLoopAction = function ( collector, events ) {
        var testData = this.TestData;
        if ( collector.CanRunTest( testData.TestIdentifier, this.TestName ) && this.ContinueTest && events.length > 0 ) {
            testData.Buffer = events;
            if ( testData.TestState == testData.States.Initial ) {
                for ( var eventIndex = 0; eventIndex < events.length; eventIndex++ ) {
                    var eventFields = events[ eventIndex ].EventFieldList.EventFields;
                    var eventType = eventFields[ collector.EventTypeIndex ];
                    var alarmEventType = collector.AlarmTester.GetSupportedAlarmTypes().Get( eventType );
                    if ( isDefined( alarmEventType ) ) {
                        this.TestEvent( eventFields, testData.TestCase, collector );
                    }
                }
            } else if ( testData.TestState == testData.States.WaitingForStart ||
                testData.TestState == testData.States.WaitingForEnd ) {
                CUVariables.Refresh.ProcessEvents( collector, testData );
            }
        }
    }

    // Not called from the alarm collector due to method test case differentiation 
    // It is called locally from PostEventLoop, the main worker
    this.TestEvent = function ( eventFields, testCase, collector ) {

        var testData = this.TestData;

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var retain = collector.GetSelectField( eventFields, "Retain" ).toBoolean();
        var eventId = collector.GetSelectField( eventFields, "EventId" );

        if ( testData.TestState == testData.States.Initial ) {
            if ( testData.ActiveEvents.Contains( conditionIdString ) ) {
                if ( !retain ) {
                    print( testData.Name + " Removing " + conditionIdString + " eventId " + eventId.toString() );
                    testData.ActiveEvents.Remove( conditionIdString );
                } else {
                    // New Event, should update
                    testData.ActiveEvents.Set( conditionIdString, eventFields );
                    print( testData.Name + " Updating " + conditionIdString + " eventId " + eventId.toString() );
                }
            } else {
                if ( retain ) {
                    testData.ActiveEvents.Set( conditionIdString, eventFields );
                    print( testData.Name + " Adding " + conditionIdString + " eventId " + eventId.toString() );
                }
            }
        } else if ( testData.TestState == testData.States.WaitingForStart ||
            testData.TestState == testData.States.WaitingForEnd ) {
            // Make sure this is in the list
            if ( testData.ActiveEvents.Contains( conditionIdString ) ) {

                var currentEventFields = testData.ActiveEvents.Get( conditionIdString );
                var savedEventId = collector.GetSelectField( currentEventFields, "EventId" );
                if ( savedEventId.equals( eventId ) ) {
                    if ( retain ) {
                        if ( !isDefined( testData.StartEvent ) ) {
                            collector.AddMessage( testCase, collector.Categories.Error,
                                testData.Name + " " + conditionIdString + " Event Received before the RefreshStartEvent" );
                            testData.TestState = testData.States.StartEventError;
                            collector.TestCompleted( conditionId, this.TestName );
                        } else {
                            if ( isDefined( testData.EndEvent ) ) {
                                collector.AddMessage( testCase, collector.Categories.Error,
                                    testData.Name + " " + conditionIdString + " Event Received after the RefreshEnd" );
                                testCase.TestsFailed++;
                                testData.TestState = testData.States.EndEventError;
                                collector.TestCompleted( conditionId, testData.TestName );
                            } else {
                                collector.AddMessage( testCase, collector.Categories.Activity,
                                    testData.Name + " " + conditionIdString + " Refresh Event Received Correctly" );
                                testData.RefreshedEvents.Set( conditionIdString, {
                                    TestCase: testCase,
                                    EventFields: eventFields
                                } );
                            }
                        }
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Activity,
                            testData.Name + " " + conditionIdString + " Retain set to false, excluding from test" );
                        this.ActiveEvents.Remove( conditionIdString );
                        testCase.TestsSkipped++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Activity,
                        testData.Name + " " + conditionIdString + " Ignoring unexpected event due to different EventId" );
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Activity,
                    testData.Name + " " + conditionIdString + " Ignoring unexpected event" );
            }
        } else {
            testCase.TestsSkipped++;
        }
    }

    this.PostLoopAction = function ( collector ) {
        var testData = this.TestData;
        if ( this.ContinueTest && collector.CanRunTest( testData.TestIdentifier, this.TestName ) ) {
            if ( testData.TestState == testData.States.Initial ) {
                if ( testData.ActiveEvents.Length() >= testData.RefreshTriggerCount ) {
                    print( testData.Name + " Ready to Refresh Count = " + testData.ActiveEvents.Length() )
                    testData.ActiveEvents.Iterate( function ( conditionIdString, eventFields ) {
                        print( testData.Name + " Expecting to refresh " + conditionIdString );
                    } );

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
                        testData.TestState = testData.States.WaitingForStart;
                    } else {
                        testData.TestState = testData.UnableToRefresh;
                        collector.AddMessage( testData.TestCase, collector.Categories.Error,
                            "Call to " + CUVariables.Refresh.Virtual.BrowseNameText + " Failed [" + 
                            status.toString() +"]" );
                        testData.TestCase.TestsFailed++;
                    }
                }
            } else if ( testData.TestState == testData.States.ReadyToTest ) {
                var startIndex = testData.StartEvent.EventHandle;
                var endIndex = testData.EndEvent.EventHandle;
                if ( CUVariables.Debug ) {
                    print( "Ready to test, Refresh time " + testData.RefreshTime.toString() + " startIndex " + startIndex + " endIndex " + endIndex );
                    testData.ActiveEvents.Iterate( function ( key, fields, args ) {
                        var collector = args.Collector;
                        var eventId = fields[ collector.EventIdIndex ].toString();
                        var time = collector.GetSelectField( fields, "Time" ).toDateTime();
                        print( "Active events Looking for condition " + key + " event Id " + eventId + " event time " + time.toString() );
                    }, { Collector: collector } );
                }

                // There is a list of events that should be refreshed.  Verify.
                var success = true;
                var found = new KeyPairCollection();
                var passedCount = 0;
                var failedCount = 0;
                var changedCount = 0;
                var duplicateCount = 0;
                for ( var index = 0; index < testData.SaveEvents.length; index++ ) {
                    var event = testData.SaveEvents[ index ];
                    var eventFields = event.EventFieldList.EventFields;
                    var eventId = eventFields[ collector.EventIdIndex ].toByteString();
                    var conditionId = collector.GetConditionId( eventFields );
                    var conditionIdString = conditionId.toString();
                    var eventIdString = eventId.toString();
                    var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();
                    var eventIndex = event.EventHandle;

                    if ( eventIndex > startIndex && eventIndex < endIndex ) {
                        print( "Refresh events index[" + eventIndex + "] condition " + conditionIdString + " event Id " + eventIdString +
                            " event time " + eventTime.toString() );
                        var alreadyFound = found.Contains( conditionIdString );
                        if ( !alreadyFound ){
                            var expectedRefresh = testData.ActiveEvents.Get( conditionIdString );
                            var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();
                            var timeDifferenceFromRefresh = Math.abs( eventTime.msecsTo( testData.RefreshTime ) );
                            
                            if ( expectedRefresh ){
                                var foundEventId = expectedRefresh[ collector.EventIdIndex ].toByteString();
                                if ( foundEventId.equals( eventId ) ){
                                    print( "Expected Event Id " + eventId.toString() + " found" );
                                    found.Set( conditionIdString, "Found" );
                                    passedCount++;
                                }else{
                                    if ( timeDifferenceFromRefresh > this.Tolerance ) {    
                                        collector.AddMessage( testData.TestCase, collector.Categories.Error,
                                            "Expected " + conditionIdString + " has conflicting eventIds: Expecting " +
                                            foundEventId.toString() + " Actual " + eventId.toString() );
                                        found.Set( conditionIdString, "Error" );
                                        failedCount++;
                                        success = false;
                                    }else{
                                        // Change of state for condition
                                        found.Set( conditionIdString, "Changed" );
                                        changedCount++;
                                    }
                                }
                            }
                        }else{
                            print( "Index " + eventIndex + ":" + conditionIdString + " already contains an event in refresh" );
                            duplicateCount++;
                        }
                    } else {
                        collector.AddMessage( testData.TestCase, collector.Categories.Error,
                            "Event " + eventIdString + " came in out of order" );
                        success = false;
                    }
                }

                print( "Expected " + testData.ActiveEvents.Length() + " refresh events, found " +
                    found.Length() + " expected events, " + 
                    " passed " + passedCount + " failed " + failedCount + 
                    " changed state " + changedCount + " duplicates " + duplicateCount );

                testData.TestState = testData.States.Completed;
                if ( success ) {
                    testData.TestCase.TestsPassed++;
                } else {
                    testData.TestCase.TestsFailed++;
                }

                collector.TestCompleted( testData.TestIdentifier, this.TestName );

                this.ContinueTest = false;
            } else {
                print( "UnknownState " + testData.TestState );
            }
        }
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
        Test.Execute( { Procedure: Test_007 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_007 } );
    }
}