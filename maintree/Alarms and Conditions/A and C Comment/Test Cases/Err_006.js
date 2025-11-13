/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Add a Comment while specifying an EventId where the related EventType does not support Comments.
    
    Expectation:
        The request is rejected.
        Service result: Good
        Operation results: BadNotSupported

    How this test works:
*/

function Err_006 () {

    this.TestName = "Err_006";
    this.Extra = new Object();

    this.Run = function () {
        var success = false;

        if ( this.Initialize( CUVariables.AlarmCollector ) ) {
            success = this.RunTest();
            this.Shutdown();
        }

        return success;
    }

    this.Initialize = function ( collector ) {

        var success = false;

        var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;

        var selectFieldsMap = new KeyPairCollection();
        var mandatory = false;
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;

        var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
        alarmUtilities.CreateSelectFieldsMap( new UaNodeId( Identifier.BaseEventType ),
            selectFieldsMap, mandatory, startIndexObject );
        this.Extra.ExtraAlarmDetails = alarmThread.AddEventItemExtended( {
            EventNodeId: new UaNodeId( Identifier.Server ),
            SelectFields: selectFieldsMap
        } );
        this.Extra.ItemCreated = this.Extra.ExtraAlarmDetails.ItemCreated;
        if ( this.Extra.ItemCreated ) {
            this.Extra.SelectFields = selectFieldsMap;
            this.Extra.AlarmThread = alarmThread;
            this.Extra.Subscription = this.Extra.ExtraAlarmDetails.Subscription;
            this.Extra.SubscriptionId = this.Extra.ExtraAlarmDetails.Subscription.SubscriptionId;
            this.Extra.EventItem = this.Extra.ExtraAlarmDetails.EventMonitoredItem;
            this.Extra.ClientId = this.Extra.ExtraAlarmDetails.EventMonitoredItem.ClientHandle;
            success = true;
        } else {
            addError( this.TestName + " Unable to create secondary Event Monitor" );
        }

        return success;
    }

    this.Shutdown = function () {
        if ( this.Extra.ItemCreated ) {
            this.Extra.AlarmThread.SessionThread.Helpers.DeleteMonitoredItemsHelper.Execute( {
                ItemsToDelete: this.Extra.EventItem,
                SubscriptionId: this.Extra.Subscription
            } );

            // Doesn't clean out the item from the thread, that will be done at the
            // the end of the conformance unit
            this.Extra.AlarmThread.SessionThread.ClearThreadData( {
                ThreadId: this.Extra.AlarmThread.SessionThread.ThreadId,
                SubscriptionId: this.Extra.SubscriptionId,
                ClearEvents: true,
                ClientId: this.Extra.ClientId
            } );
        }
    }

    this.RunTest = function () {
        var success = false;
        // Try maxCount times to get events that are not alarms
        var maxCount = 20;
        var currentCount = 0;
        var keepGoing = true;

        var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
        var collector = CUVariables.AlarmCollector;
        var alarmTypes = CUVariables.AlarmTester.GetSupportedAlarmTypes();

        var testEvent = null;
        var alarmEvent = null;

        while ( keepGoing && currentCount < maxCount ) {

            print( this.TestName + " Iteration " + currentCount + " out of " + maxCount );

            var bufferResult = alarmThread.GetBuffer(
                this.Extra.SubscriptionId,
                this.Extra.ClientId
            );

            var idsToRemove = [];
            if ( bufferResult.status == true &&
                isDefined( bufferResult.events ) &&
                isDefined( bufferResult.events.length ) &&
                bufferResult.events.length > 0 ) {
                   
                var alarmEventCount = 0;
                var otherEventCount = 0;

                // See if there are events that are not alarms
                for ( var index = 0; index < bufferResult.events.length; index++ ) {
                    var event = bufferResult.events[ index ];
                    if ( isDefined( event ) ){
                        idsToRemove.push( event.EventHandle );
                        var eventFields = event.EventFieldList.EventFields;
                        var eventType = eventFields[ collector.EventTypeIndex ];
                        if ( !alarmTypes.Contains( eventType.toString() ) ){
                            testEvent = eventFields;
                            otherEventCount++;
                        }else{
                            alarmEventCount++;
                            if ( alarmEvent == null ){
                                alarmEvent = eventFields;
                            }
                        }
                    }
                }
    
                print( this.TestName + " " + bufferResult.events.length + 
                " events " + otherEventCount + " alarm events " + alarmEventCount );
            }

            if ( testEvent != null && alarmEvent != null ) {
                var eventId = testEvent[ collector.EventIdIndex ];
                var conditionIdNodeId = collector.GetConditionId( alarmEvent );
                
                var commentVariant = new UaVariant();
                var comment = UaLocalizedText.New( { 
                    Text: "AddComment with eventId from Non-Alarm Event should Fail", 
                    Locale: gServerCapabilities.DefaultLocaleId } );
                commentVariant.setLocalizedText( comment );

                var result = collector.Call( {
                    MethodsToCall: [ {
                        MethodId: new UaNodeId( Identifier.ConditionType_AddComment ),
                        ObjectId: conditionIdNodeId,
                        InputArguments: [ eventId, commentVariant ]
                    } ],
                    SuppressMessaging: true
                } );
        
                if ( result.isBad() && result.StatusCode == StatusCode.BadEventIdUnknown ) {
                    print( conditionIdNodeId.toString() + " Success!" );
                    success = true;
                } else {
                    print( conditionIdNodeId.toString() + " AddMessage call expected BadEventIdUnknown, actual " + result.toString() );
                }

                keepGoing = false;
            } else {
                wait( 1000 );
            }

            if ( idsToRemove.length > 0 ) {
                alarmThread.RemoveEntry(
                    idsToRemove,
                    this.Extra.SubscriptionId,
                    this.Extra.ClientId
                );
            }

            currentCount++;
        }

        if ( keepGoing ){
            addSkipped( "Unable to find event that does not support comments" );
        }

        return success;
    }

    return this.Run();
}

Test.Execute( { Procedure: Err_006 } );
