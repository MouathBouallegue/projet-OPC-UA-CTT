/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:
        Prepare a list of ALL fields (including inherited) that can be filtered (in a SELECT clause). 
        Create a number of monitored items (server object in all cases, just updated filters). 
        In a loop, add the ""next"" field to a SELECT clause in a MonitoredItem.Filter and then 
        move to the next monitored item  (i.e. each monoted item has a progressly large list of fields).
        Note: A single WHERE clause to receive this type of Alarm only.
    

    Requirements: 
        The fields list array (to be tested) should start with the EventId.
        Note: the loop should jump 3 or 4 at a time (not 1 at a time).

    
    Expectation:
        Server accepts the subscription/monitoring request.
        The event is received in the Publish response and contains the list of fields requested only.

*/

include( "./library/Base/whereClauseCreator.js" );

function Test_001 () {

    this.TestName = "Test_001";
    this.WhereClauseCreator = null;
    this.ServerNodeId = null;
    this.EventMonitors = null;
    this.SubscriptionData = null;
    this.StartTime = null;
    this.TestState = null;
    this.TypeCheckErrors = 0;
    this.TypeCheckSuccesses = 0;
    this.EventToCheck = null;
    this.TimeToCheck = null;

    this.EventTypeToCheck = null;
    this.IncomingEvents = new KeyPairCollection();
    this.FilteredEventIds = new KeyPairCollection();

    this.States = {
        Initial: "Initial",
        WaitingForEventMonitors: "WaitingForEventMonitors",
        WaitingToCheck: "WaitingToCheck",
        Completed: "Completed"
    }

    this.TestComplete = false;

    this.Initialize = function ( collector ) {
        this.TestState = this.States.Initial;
    }

    this.AddEventMonitor = function ( collector ) {

        collector.AddIgnoreSkips( [ this.EventTypeToCheck ], this.TestName );

        this.WhereClauseCreator = new WhereClauseCreatorService();
        this.ServerNodeId = new UaNodeId( Identifier.Server );

        var allCurrentFields = CUVariables.AlarmThreadHolder.SelectFields;
        var fields = allCurrentFields.Keys();

        var increment = 4;
        var totalVariables = fields.length / increment;

        // List monitors that in turn contains a list of fields with the select creation information
        // The eventMonitor will contain the monitoredItem, the client handle, and a list of events to delete
        var eventMonitors = new KeyPairCollection();
        for ( var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++ ) {
            var field = fields[ fieldIndex ];
            var fieldDetail = allCurrentFields.Get( field );

            for ( var eventMonitorIndex = 0; eventMonitorIndex < totalVariables; eventMonitorIndex++ ) {

                if ( !eventMonitors.Contains( eventMonitorIndex ) ) {
                    eventMonitors.Set( eventMonitorIndex, {
                        MonitoredItem: null,
                        ClientHandle: -1,
                        SelectFields: new KeyPairCollection(),
                        CurrentEvents: [],
                        CurrentEventMap: new KeyPairCollection(),
                        IdsToRemove: []
                    } );
                }

                var eventMonitor = eventMonitors.Get( eventMonitorIndex );

                if ( field == "EventId" || field == "EventType" ) {
                    // Just add these, they will always be needed
                    if ( !eventMonitor.SelectFields.Contains( field ) ) {
                        eventMonitor.SelectFields.Set( field, fieldDetail );
                    }
                } else {
                    var lastIndex = eventMonitorIndex * increment;

                    if ( fieldIndex <= lastIndex ) {
                        if ( !eventMonitor.SelectFields.Contains( field ) ) {
                            eventMonitor.SelectFields.Set( field, fieldDetail );
                        }
                    }
                }
            }
        }

        var itemsToAdd = [];

        eventMonitors.Iterate( function ( index, eventMonitor, args ) {
            eventMonitor.MonitoredItem = args.This.CreateEventItem( eventMonitor.SelectFields );
            eventMonitor.ClientHandle = eventMonitor.MonitoredItem.ClientHandle;

            args.ItemsToAdd.push( eventMonitor.MonitoredItem );

        }, { This: this, ItemsToAdd: itemsToAdd } );

        this.SubscriptionData = CUVariables.AlarmThreadHolder.AlarmThread.AddEventMonitor( itemsToAdd );

        this.StartTime = UaDateTime.utcNow();
        this.StartTime.addMilliSeconds( 500 );

        this.EventMonitors = eventMonitors;
    }

    this.Shutdown = function ( collector ) {
        var sessionThread = collector.AlarmThreadHolder.AlarmThread.SessionThread;
        var statistics = sessionThread.GetThreadPublishStatistics();
        var results = sessionThread.Helpers.GetThreadPublishStatisticsHelper.ValuesToString( statistics );

        results.forEach( function ( result ) {
            print( result );
        } );

        if ( isDefined( this.EventToCheck ) ) {
            this.EventToCheck.TestCase.TypeCheckSuccesses = this.TypeCheckSuccesses;
            this.EventToCheck.TestCase.TypeCheckErrors = this.TypeCheckErrors;
            collector.AddCustomResult( "AandCAlarm", this.TestName, this.EventToCheck );
        }
    }

    this.PreLoopAction = function ( collector ) {

        if ( this.TestState == this.States.WaitingToCheck &&
                UaDateTime.utcNow() > this.TimeToCheck ) {

                var unexpectedEvents = [];

                this.EventMonitors.Iterate( function ( index, eventMonitor, args ) {

                eventMonitor.IdsToRemove = [];
    
                print( "PreLoop Request Subscription " + args.This.SubscriptionData.Subscription.SubscriptionId +
                    " client handle " + eventMonitor.ClientHandle );
    
                var events = args.Collector.AlarmThreadHolder.AlarmThread.GetBuffer(
                    args.This.SubscriptionData.Subscription.SubscriptionId,
                    eventMonitor.ClientHandle );
    
                print( "PreLoop status [" + events.status + "] test state - " + args.This.TestState );
    
                if ( events.status == true ) {
    
                    print( "PreLoop found [" + events.events.length + "] events" );
                    for ( var index = 0; index < events.events.length; index++ ) {
                        var event = events.events[ index ];
    
                        eventMonitor.CurrentEvents.push( event );
                        // Get ready for cleanup
                        eventMonitor.IdsToRemove.push( event.EventHandle );
                        // Create a map for events in this eventMonitor for quick lookup
                        var eventId = args.Collector.GetSelectFieldFromMap( event.EventFieldList.EventFields, "EventId",
                            eventMonitor.SelectFields );
                        var eventIdString = eventId.toString();
                        eventMonitor.CurrentEventMap.Set( eventIdString, event );

                        if ( !args.This.FilteredEventIds.Contains( eventIdString)){
                            args.This.FilteredEventIds.Set( eventIdString, eventIdString );
                        }
    
                        // Ensure only the desired alarm types have been retrieved
                        var eventType = args.Collector.GetSelectFieldFromMap( event.EventFieldList.EventFields, "EventType",
                            eventMonitor.SelectFields ).toNodeId();
                        if ( !eventType.equals( args.This.EventTypeToCheck ) ) {
                            args.This.TypeCheckErrors++;
                        } else {
                            args.This.TypeCheckSuccesses++;
                        }

                        args.This.IncomingEvents.Iterate( function( incomingEventId, incomingEventFields ) {
                            var incomingEventType = args.Collector.GetSelectField( incomingEventFields, "EventType" ).toNodeId();
                            if ( !incomingEventType.equals( args.This.EventTypeToCheck ) ){
                                if ( incomingEventId == eventId ){
                                    unexpectedEvents.push(incomingEventFields);
                                }
                            }
                        });
                    }
                }
            }, { This: this, Collector: collector } );

            var eventId = collector.GetSelectField( this.EventToCheck.EventFields, "EventId" ).toString();

            this.EventMonitors.Iterate( function ( eventMonitorIndex, eventMonitor, args ) {

                var event = eventMonitor.CurrentEventMap.Get( args.EventId );

                if ( isDefined( event ) ) {
                    var eventMonitorFields = event.EventFieldList.EventFields;

                    if ( eventMonitorFields.length != eventMonitor.SelectFields.Length() ) {
                        args.Collector.AddMessage( args.TestCase, args.Collector.Categories.Error,
                            "Event Monitor index " + index + " expected " + eventMonitor.SelectFields.Length() +
                            " fields, actual " + eventMonitorFields.length );
                        args.TestCase.TestsFailed++;
                    }

                    for ( var index = 0; index < eventMonitorFields.length; index++ ) {
                        var eventMonitorFieldValue = eventMonitorFields[ index ];
                        var fullFieldValue = args.EventFields[ index ];

                        if ( fullFieldValue.DataType != eventMonitorFieldValue.DataType ) {
                            args.Collector.AddMessage( args.TestCase, args.Collector.Categories.Error,
                                "Event Monitor field " + eventMonitor.SelectFields.Keys()[ index ] + " datatypes do not match" );
                            args.TestCase.TestsFailed++;
                        } else if ( eventMonitorFieldValue.DataType != 0 ) {
                            if ( !fullFieldValue.equals( eventMonitorFieldValue ) ) {
                                args.Collector.AddMessage( args.TestCase, args.Collector.Categories.Error,
                                    "Event Monitor field " + eventMonitor.SelectFields.Keys()[ index ] + " values do not match " +
                                    " Expected " + fullFieldValue.toString() + " Actual " + eventMonitorFieldValue.toString() );
                                args.TestCase.TestsFailed++;
                            }
                        }
                    }
                } else {
                    args.Collector.AddMessage( args.TestCase, args.Collector.Categories.Error,
                        "Event Monitor did not receive event " + args.EventId );
                    args.TestCase.TestsFailed++;
                }
            }, {
                This: this,
                EventId: eventId,
                EventFields: this.EventToCheck.EventFields,
                TestCase: this.EventToCheck.TestCase,
                Collector: collector
            } );

            for( var index = 0; index < unexpectedEvents.length; index++ ){
                var incomingEventFields = unexpectedEvents[ index ];
                var incomingConditionId = collector.GetConditionId( incomingEventFields ).toString();
                var incomingEventId = collector.GetSelectField( incomingEventFields, "EventId" ).toString();
                var incomingEventType = collector.GetSelectField( incomingEventFields, "EventType" ).toString();
                collector.AddMessage( this.EventToCheck.TestCase, collector.Categories.Error,
                    incomingConditionId + " EventId " + incomingEventId + " EventType " + incomingEventType + 
                    " found in filtered events for EventType " + this.EventTypeToCheck.toString() );
                this.EventToCheck.TestCase.TestsFailed++;
            }

            if ( this.EventToCheck.TestCase.TestsFailed == 0 ) {
                print( UaDateTime.utcNow() + " Test Completed with Pass " );
                this.EventToCheck.TestCase.TestsPassed++;
            }else{
                print( UaDateTime.utcNow() + " Test Completed with Fail! " + this.EventToCheck.TestCase.TestsFailed );
            }

            this.TestState = this.States.Completed;
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );

        if ( this.TestState == this.States.Initial ) {
            if ( collector.IsActive( eventFields ) ) {
                var eventType = collector.GetSelectField( eventFields, "EventType" ).toNodeId();
                var eventTypeString = eventType.toString();
                // Ensure this is a valid type
                var alarmTypes = collector.GetAlarmTester().GetSupportedAlarmTypes();
                var alarmType = alarmTypes.Get( eventTypeString );
                if ( isDefined( alarmType ) ){
                    this.EventTypeToCheck = eventType;
                    this.AddEventMonitor( collector );
                    this.TestState = this.States.WaitingForEventMonitors;
                }
            }
        }else if ( this.TestState == this.States.WaitingForEventMonitors ){

            var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();
            var localEventTime = collector.GetAlarmTester().GetLocalTimeFromDeviceTime( eventTime );

            if ( localEventTime > this.StartTime ) {

                print( "Event Time " + localEventTime.toString() + " start time " + this.StartTime.toString() );

                this.EventToCheck = {
                    ConditionId: conditionId,
                    EventFields: eventFields,
                    TestCase: testCase,
                    EventTypeToCheck: this.EventTypeToCheck
                }

                // Valid, as the comparison is local
                this.TimeToCheck = UaDateTime.utcNow();
                this.TimeToCheck.addMilliSeconds( 2000 );

                this.TestState = this.States.WaitingToCheck;
            }
        }else if ( this.TestState == this.States.WaitingToCheck ){
            print("Add Incoming Event " + conditionId );
            this.IncomingEvents.Set( collector.GetSelectField( eventFields, "EventId" ).toString(), eventFields );
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( isDefined( this.EventMonitors ) ){
            this.EventMonitors.Iterate( function ( index, eventMonitor, args ) {
                if ( eventMonitor.IdsToRemove.length > 0 ) {
    
                    collector.AlarmThreadHolder.AlarmThread.RemoveEntry(
                        eventMonitor.IdsToRemove,
                        args.This.SubscriptionData.Subscription.SubscriptionId,
                        eventMonitor.ClientHandle
                    );
    
                    eventMonitor.IdsToRemove = [];
    
                    if ( args.This.TestState == args.This.States.Completed ) {
                        eventMonitor.CurrentEvents = [];
                        eventMonitor.CurrentEventMap = new KeyPairCollection();
                    }
                }
            }, { This: this } );
        }
    }

    this.CreateSelect = function ( select ) {
        var selectClauses = new UaSimpleAttributeOperands( select.Length() );

        var selectKeys = select.Keys();
        for ( var index = 0; index < selectKeys.length; index++ ) {
            var selectKey = selectKeys[ index ];
            var selectObject = select.Get( selectKey );
            selectClauses[ index ] = CUVariables.AlarmThreadHolder.AlarmThread.CreateSimpleOperand( selectObject );
        }

        return selectClauses;
    }

    this.CreateWhere = function () {
        var ackTypeVariant = new UaVariant;
        ackTypeVariant.setNodeId( this.EventTypeToCheck );

        var whereClause = this.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[ 0 ] = this.WhereClauseCreator.CreateTwoOperandFilterElement(
            FilterOperator.Equals, "EventType", ackTypeVariant );

        return whereClause;
    }

    this.CreateEventItem = function ( select ) {

        var item = MonitoredItem.fromNodeIds( this.ServerNodeId )[ 0 ];
        item.AttributeId = Attribute.EventNotifier;
        item.QueueSize = CUVariables.AlarmTester.AlarmThreadHolder.AlarmThread.DesiredQueueSize;

        var filter = new UaExtensionObject();
        var eventFilter = new UaEventFilter();

        eventFilter.SelectClauses = this.CreateSelect( select );
        eventFilter.WhereClause = this.CreateWhere();
        filter.setEventFilter( eventFilter );

        item.Filter = filter;

        return item;
    }

    this.CheckResults = function () {

        var now = UaDateTime.utcNow();
        print( this.TestName + " CheckResults " + now );

        if ( now > CUVariables.AlarmCollector.EndTime ){
            print( this.TestName + " CheckResults Unexpected" );
        }
        var success = false;

        var initialResults = true;

        var testResults = null;

        if ( isDefined( Test.Alarm.Results ) &&
            isDefined( Test.Alarm.Results.AandCAlarm ) &&
            isDefined( Test.Alarm.Results.AandCAlarm[ this.TestName ] ) ) {
            testResults = Test.Alarm.Results.AandCAlarm[ this.TestName ];
        }

        if ( isDefined( testResults ) ) {
            if ( isDefined( testResults.TestCase ) ) {
                var testCase = testResults.TestCase;

                if ( isDefined( testCase.Error ) ){
                    testCase.Error.forEach( function( error ){addError(error);});
                }

                if ( isDefined( testCase.TypeCheckErrors ) ) {
                    if ( testCase.TypeCheckErrors > 0 ) {
                        addError( "Test Received " + testCase.TypeCheckErrors +
                            " events that should have been filtered" );
                    } else {
                        var alarmTypeName = "";
                        var alarmTypes = CUVariables.AlarmCollector.GetAlarmTester().GetSupportedAlarmTypes();
                        if ( isDefined( alarmTypes) ){
                            var alarmType = alarmTypes.Get( testResults.EventTypeToCheck.toString() );
                            if ( isDefined( alarmType ) && isDefined( alarmType.Name ) ){
                                alarmTypeName = " - " + alarmType.Name;
                            }
                        }
                        addSuccessMessage( "Success " + testCase.TypeCheckSuccesses + " events checked for event type " + 
                            testResults.EventTypeToCheck + alarmTypeName);
                        success = true;
                    }
                } else {
                    addError( "Test did not complete - TypeCheckErrors undefined" );
                }
            } else {
                addError( "Unable to get test case results" );
            }
        } else {
            addError( "Unable to get test results" );
        }

        return success && initialResults;
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