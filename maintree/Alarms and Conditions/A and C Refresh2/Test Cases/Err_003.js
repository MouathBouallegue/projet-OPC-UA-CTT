/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        add two or more refresh ConditionRefresh2 calls (near simultaneously).
    
    Expectation:
        One call should succeed whereas the other should fail.
        If one does not fail it might require manual testing.
        BadRefreshInProgress

*/

function Err_003 () {

    this.Run = function () {
        var success = false;

        const numberOfSubscriptions = 10;
        const numberOfCalls = 5;
        const eventWaitTimeoutSeconds = 60;

        var selectFields = new KeyPairCollection();
        selectFields.Set( "EventId", this.CreateSelectField( 0, [ "EventId" ] ) );
        selectFields.Set( "EventType", this.CreateSelectField( 1, [ "EventType" ] ) );
        selectFields.Set( "Time", this.CreateSelectField( 2, [ "Time" ] ) );
        var subscriptionDetails = [];

        var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
        var callHelper = alarmThread.SessionThread.Helpers.CallHelper;

        const serverNodeId = new UaNodeId( Identifier.Server );
        const methodId = new UaNodeId( Identifier.ConditionType_ConditionRefresh2 );
        const conditionTypeId = new UaNodeId( Identifier.ConditionType );

        for ( var subscriptionIndex = 0; subscriptionIndex < numberOfSubscriptions; subscriptionIndex++ ) {
            subscriptionDetails.push( {
                AlarmThreadHolder: alarmThread.AddEventItemExtended( {
                    EventNodeId: serverNodeId,
                    SelectFields: selectFields
                } ),
                OrderNumber: subscriptionIndex,
                TimeOfCall: [],
                CallResult: [],
                ExpectStart: true,
                StartCount: 0,
                EndCount: 0,
                AlarmCount: 0,
                ReceivedInOrder: [],
                EventResults: []
            } );
        }

        // Clear all current events
        alarmThread.SessionThread.Helpers.ClearThreadDataHelper.Execute( {
            ThreadId: alarmThread.SessionThread.ThreadId,
            SubscriptionId: alarmThread.Subscription.SubscriptionId,
            ClearEvents: true
        } );

        wait( 30000 );

        var expectedRefreshCount = 0;
        var refreshInProgressCount = 0;

        for ( var callIndex = 0; callIndex < numberOfCalls; callIndex++ ) {
            var methods = [];
            var operationalResults = [];

            subscriptionDetails.forEach( function ( subscriptionDetail ) {
                var inputArguments = [];
                var subscriptionVariant = new UaVariant();
                subscriptionVariant.setUInt32( subscriptionDetail.AlarmThreadHolder.Subscription.SubscriptionId );
                inputArguments.push( subscriptionVariant );
                var clientHandleVariant = new UaVariant();
                clientHandleVariant.setUInt32( subscriptionDetail.AlarmThreadHolder.EventMonitoredItem.MonitoredItemId );
                inputArguments.push( clientHandleVariant );

                methods.push( {
                    MethodId: methodId,
                    ObjectId: conditionTypeId,
                    InputArguments: inputArguments
                } );
                operationalResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadRefreshInProgress ] ) );
            } );

            if ( callHelper.Execute( {
                MethodsToCall: methods,
                OperationResults: operationalResults,
                SuppressMessaging: true
            } ) ) {
                var results = callHelper.Response.Results;
                var callTime = new UaDateTime( callHelper.Response.ResponseHeader.Timestamp );

                for ( var subscriptionIndex = 0; subscriptionIndex < numberOfSubscriptions; subscriptionIndex++ ) {
                    var subscriptionDetail = subscriptionDetails[ subscriptionIndex ];
                    subscriptionDetail.TimeOfCall.push( callTime );
                    var callResult = results[ subscriptionIndex ];
                    subscriptionDetail.CallResult.push[ callResult ];
                    if ( callResult.StatusCode.isGood() ) {
                        print( "Call [" + callIndex + "] Subscription [" + subscriptionIndex + "]:[" +
                            subscriptionDetail.AlarmThreadHolder.Subscription.SubscriptionId + "] Good, expect Refresh Entries" );
                        expectedRefreshCount++;
                    } else if ( callResult.StatusCode.StatusCode == StatusCode.BadRefreshInProgress ) {
                        print( "Call [" + callIndex + "] Subscription [" + subscriptionIndex + "]:[" +
                            subscriptionDetail.AlarmThreadHolder.Subscription.SubscriptionId + "] BadRefreshInProgress" );
                        refreshInProgressCount++;
                    } else {
                        addError( "Call [" + callIndex + "] Subscription [" + subscriptionIndex + "]:[" +
                            subscriptionDetail.AlarmThreadHolder.Subscription.SubscriptionId + "] Unexpected Failure " + callResult.StatusCode.toString() );
                    }
                }
            } else {
                addError( "Call to Refresh failed on index [" + index + "]" );
                break;
            }
        }

        if ( expectedRefreshCount > 0 ) {
            var timeout = UaDateTime.utcNow();
            timeout.addSeconds( eventWaitTimeoutSeconds );

            var finished = false;

            var startCount = 0;
            var endCount = 0;

            success = true;
            var collector = CUVariables.AlarmCollector;

            var counter = 0;

            while ( !finished && UaDateTime.utcNow().msecsTo( timeout ) > 0 ) {
                counter++;
                print( "Get Buffer Iteration " + counter );
                for ( var subscriptionIndex = 0; subscriptionIndex < subscriptionDetails.length; subscriptionIndex++ ) {
                    var currentSubscription = subscriptionDetails[ subscriptionIndex ];
                    //print( "Buffer for subscription [" + subscriptionIndex + "]" + " " + currentSubscription.AlarmThreadHolder.Subscription.SubscriptionId );
                    var buffer = alarmThread.GetBuffer(
                        currentSubscription.AlarmThreadHolder.Subscription.SubscriptionId,
                        currentSubscription.AlarmThreadHolder.EventMonitoredItem.ClientHandle );

                    if ( buffer.status && buffer.events.length > 0 ) {
                        var ids = [];
                        for ( var index = 0; index < buffer.events.length; index++ ) {
                            var event = buffer.events[ index ];
                            ids.push( event.EventHandle );
                            var eventFields = event.EventFieldList.EventFields;
                            var eventType = collector.GetSelectFieldFromMap( eventFields, "EventType", selectFields ).toNodeId();
                            var eventId = collector.GetSelectFieldFromMap( eventFields, "EventId", selectFields );
                            var time = collector.GetSelectFieldFromMap( eventFields, "Time", selectFields );

                            var refreshStart = eventType.equals( CUVariables.Refresh.RefreshStartEventType );
                            var refreshEnd = eventType.equals( CUVariables.Refresh.RefreshEndEventType );



                            if ( refreshStart || refreshEnd ) {
                                if ( refreshStart ) {
                                    currentSubscription.AlarmCount = 0;
                                }
                                currentSubscription.EventResults.push( {
                                    EventFields: eventFields,
                                    ClientHandle: event.EventFieldList.ClientHandle,
                                    AlarmCount: currentSubscription.AlarmCount
                                } );
                            } else if ( !currentSubscription.ExpectStart ) {
                                currentSubscription.AlarmCount++;
                            }

                            if ( refreshStart ) {
                                currentSubscription.StartCount++;
                                startCount++;
                                if ( currentSubscription.ExpectStart ) {
                                    currentSubscription.ExpectStart = false;
                                } else {
                                    addError( "Consecutive RefreshStartEvents SubscriptionId [" +
                                        currentSubscription.AlarmThreadHolder.Subscription.SubscriptionId + "] " + " EventItem [" +
                                        currentSubscription.AlarmThreadHolder.EventMonitoredItem.ClientHandle + "]" );
                                    success = false;
                                }
                            } else if ( refreshEnd ) {
                                currentSubscription.EndCount++;
                                endCount++;
                                if ( currentSubscription.ExpectStart ) {
                                    addError( "Consecutive RefreshEndEvents  SubscriptionId [" +
                                        currentSubscription.AlarmThreadHolder.Subscription.SubscriptionId + "] " + " EventItem [" +
                                        currentSubscription.AlarmThreadHolder.EventMonitoredItem.ClientHandle + "]" );
                                    success = false;
                                } else {
                                    currentSubscription.ExpectStart = true;
                                }
                            }
                        }

                        alarmThread.RemoveEntry( ids,
                            currentSubscription.AlarmThreadHolder.Subscription.SubscriptionId,
                            currentSubscription.AlarmThreadHolder.EventMonitoredItem.ClientHandle );

                    }
                }

                if ( startCount >= expectedRefreshCount && endCount >= expectedRefreshCount ) {
                    finished = true;
                } else {
                    wait( 100 );
                }
            }

            subscriptionDetails.forEach( function ( subscriptionDetail ) {
                subscriptionDetail.EventResults.forEach( function ( eventData ) {
                    var event = eventData.EventFields;
                    print( "ClientHandle " + eventData.ClientHandle + " AlarmCount " + eventData.AlarmCount +
                        " EventType " + collector.GetSelectFieldFromMap( event, "EventType", selectFields ).toString() + " at " +
                        collector.GetSelectFieldFromMap( event, "Time", selectFields ).toString() );
                } );

            } );

            if ( !finished ) {
                addError( "Timeout waiting for Refresh events, expected " + expectedRefreshCount +
                    " pairs, got " + startCount + " start events and " + endCount + " end events" );
                success = false;
            }
        } else {
            addError( "All Calls to Refresh Failed" );
        }

        return success;

    }

    this.CreateSelectField = function ( index, id ) {
        var browsePaths = id;
        if ( !isDefined( id.length ) ) {
            browsePaths = [];
            browsePaths.push( id );
        }
        return {
            Index: index,
            Identifier: Identifier.BaseEventType,
            BrowsePaths: browsePaths
        };
    }

    return this.Run();

}

Test.Execute( { Procedure: Err_003 } );
