/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Subscribe to server object and [hopefully] receive events */

function test() {
    // setup Server.EventNotifier and specify an event filter
    var serverObjectItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ), Attribute.EventNotifier )[0];
    serverObjectItem.Intrval = 0;
    serverObjectItem.Filter = UaEventFilter.New( {
            SelectClauses: [
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } )  ]
        } ).toExtensionObject();
    // subscribe to the item
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { SubscriptionId: subscription, SuppressMessaging: Settings.ServerTest.Debug } ) ) {
        if (CreateMonitoredItemsHelper.Execute({ ItemsToCreate: serverObjectItem, SubscriptionId: subscription, SuppressMessaging: Settings.ServerTest.Debug })) {
            var eventsReceived = false;
            // call trigger function for each trigger item to ensure we're getting some events
            for (var i = 0; i < eventTriggerItems.length; i++) eventTriggerItems[i].invokeTrigger();
            // call Publish a twice to see if we get ANY events...
            for( var i=0; i<2; i++ ) {
                PublishHelper.Execute( { SuppressMessaging: Settings.ServerTest.Debug } );
                if( PublishHelper.CurrentlyContainsEvents() ) {
                    print("Events received...");
                    eventsReceived = true;
                    notImplemented("Event validation: Will be added shortly.");
                }
                else print("No event data received on Publish call # " + (1 + i) + " of 2.");
            }//for i...
            if (!eventsReceived) addError("No events received even though the trigger nodes have been triggered.")
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: serverObjectItem, SubscriptionId: subscription, SuppressMessaging: Settings.ServerTest.Debug } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription, SuppressMessaging: Settings.ServerTest.Debug } );
        return( true );
    }
    else return( false );
}

Test.Execute( { Procedure: test } );