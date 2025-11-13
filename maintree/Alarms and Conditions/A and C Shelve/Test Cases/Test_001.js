/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:
        "Prepare a list of fields (including shelving fields, MaxTimeShelved and some basic fields) 
        that can be filtered (in a SELECT clause). Create a number of monitored items 
        (server object in all cases, just updated filters). 
        In a loop, add the ""next"" field to a SELECT clause in a MonitoredItem.
        Filter and then move to the next monitored item  
        (i.e. each monitored item has a progressly large list of fields).
        Note: A single WHERE clause to receive this type of Alarm only."

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

    this.States = {
        Initial: "Initial",
        WaitingToCheck: "WaitingToCheck",
        Completed: "Completed"
    }

    this.TestComplete = false;

    this.Initialize = function ( collector ) {

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

        this.TestState = this.States.Initial;
    }

    this.Shutdown = function () {

        if ( isDefined( this.EventToCheck ) ) {
            this.EventToCheck.TestCase.TypeCheckSuccesses = this.TypeCheckSuccesses;
            this.EventToCheck.TestCase.TypeCheckErrors = this.TypeCheckErrors;
        }
    }

    this.PreLoopAction = function ( collector ) {
        this.EventMonitors.Iterate( function ( index, eventMonitor, args ) {

            eventMonitor.IdsToRemove = [];

            var events = args.Collector.AlarmThreadHolder.AlarmThread.GetBuffer(
                args.This.SubscriptionData.Subscription.SubscriptionId,
                eventMonitor.ClientHandle );

            if ( events.status == true ) {

                for ( var index = 0; index < events.events.length; index++ ) {
                    var event = events.events[ index ];

                    eventMonitor.CurrentEvents.push( event );
                    // Get ready for cleanup
                    eventMonitor.IdsToRemove.push( event.EventHandle );
                    // Create a map for events in this eventMonitor for quick lookup
                    var eventId = args.Collector.GetSelectFieldFromMap( event.EventFieldList.EventFields, "EventId",
                        eventMonitor.SelectFields );
                    eventMonitor.CurrentEventMap.Set( eventId.toString(), event );

                    // Ensure only the desired alarm types have been retrieved
                    var eventType = args.Collector.GetSelectFieldFromMap( event.EventFieldList.EventFields, "EventType",
                        eventMonitor.SelectFields ).toNodeId();
                    if ( !eventType.equals( CUVariables.Shelve.AlarmConditionType ) ) {
                        args.This.TypeCheckErrors++;
                    } else {
                        args.This.TypeCheckSuccesses++;
                    }
                }
            }


        }, { This: this, Collector: collector } );

        if ( this.TestState == this.States.WaitingToCheck ) {
            if ( UaDateTime.utcNow > this.TimeToCheck ) {

                var eventId = collector.GetSelectField( this.EventToCheck.EventFields, "EventId" ).toString();
                this.EventMonitors.Iterate( function ( eventMonitorIndex, eventMonitor, args ) {

                    var event = eventMonitor.CurrentEventMap.Get( args.EventId );

                    if ( isDefined( event ) ) {

                        var firstShelvingIndex = -1;
                        var eventMonitorFields = event.EventFieldList.EventFields;

                        print( "archie debug Event Monitor expected " + eventMonitor.SelectFields.Length() +
                            " fields, actual " + eventMonitorFields.length );

                        if ( eventMonitorFields.length != eventMonitor.SelectFields.Length() ) {
                            args.Collector.AddMessage( args.TestCase, args.Collector.Categories.Error,
                                "Event Monitor index " + index + " expected " + eventMonitor.SelectFields.Length() +
                                " fields, actual " + eventMonitorFields.length );
                            args.TestCase.TestsFailed++;
                        }

                        var selectFieldKeys = eventMonitor.SelectFields.Keys();
                        for ( var index = 0; index < eventMonitorFields.length; index++ ) {
                            var eventMonitorFieldValue = eventMonitorFields[ index ];
                            var fullFieldValue = args.EventFields[ index ];
                            var selectFieldKey = selectFieldKeys[ index ];
                            var selectField = eventMonitor.SelectFields[ selectFieldKey ];

                            if ( firstShelvingIndex < 0 ) {
                                if ( selectFieldKey.indexOf( "ShelvingState." ) == 0 ) {
                                    firstShelvingIndex = index;
                                }
                            }

                            if ( firstShelvingIndex >= 0 && index >= firstShelvingIndex ) {
                                print( "Shelving Property " + selectFieldKey )
                            }

                            print( "Property " + selectFieldKey + " value " + eventMonitorFieldValue.toString() );

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
                            } else {
                                print( "Property " + selectFieldKey + " Is Null" );
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

                if ( this.EventToCheck.TestCase.TestsFailed == 0 ) {
                    this.EventToCheck.TestCase.TestsPassed++;
                }

                this.TestState = this.States.Completed;
            }
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var eventType = collector.GetSelectField( eventFields, "EventType" ).toNodeId();

        var conditionId = collector.GetConditionId( eventFields );

        if ( collector.CanRunTest( conditionId, this.TestName ) ) {

            if ( eventType.equals( CUVariables.Shelve.AlarmConditionType ) ) {

                if ( this.TestState == this.States.Initial ) {

                    var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();

                    if ( eventTime > this.StartTime ) {

                        print( "Event Time " + eventTime.toString() + " start time " + this.StartTime.toString() );

                        this.EventToCheck = {
                            ConditionId: conditionId,
                            EventFields: eventFields,
                            TestCase: testCase
                        }

                        this.TimeToCheck = UaDateTime.utcNow();
                        this.TimeToCheck.addMilliSeconds( 2000 );

                        this.TestState = this.States.WaitingToCheck;
                    }
                }
            } else {
                testCase.TestsSkipped++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }
    }

    this.PostLoopAction = function ( collector ) {

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
        ackTypeVariant.setNodeId( CUVariables.Shelve.AlarmConditionType );

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

        var success = true;

        var initialResult = CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );

        var results = CUVariables.AlarmCollector.TestTypeResults.Get(
            CUVariables.Shelve.AlarmConditionTypeString );

        if ( isDefined( results ) ) {
            var testCase = results.TestCases.Get( this.TestName );
            if ( isDefined( testCase ) ) {
                if ( isDefined( testCase.TypeCheckErrors ) ) {
                    if ( testCase.TypeCheckErrors > 0 ) {
                        addError( "Test Received " + testCase.TypeCheckErrors +
                            " events that should have been filtered" );
                        stopCurrentUnit();
                    }
                } else {
                    print( "Test did not complete" );
                }
            } else {
                addError( "Unable to get test case results" );
                stopCurrentUnit();
            }
        } else {
            addError( "Unable to get test results" );
            stopCurrentUnit();
        }


        if ( this.TypeCheckErrors > 0 ) {
            addError( "Extra filters found " + this.TypeCheckErrors + " events that were not the desired type" );
            success = false;
        }

        return success && initialResult;
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