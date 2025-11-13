/*  Test 001 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Generate multiple events to cause a queue (size=1) overflow.
*/

function eventQueueOverflow001() {
    // setup Server.EventNotifier and specify an event filter
    var serverObjectItem = MonitoredItem.fromNodeIds(new UaNodeId(Identifier.Server), Attribute.EventNotifier)[0];
    if (eventTriggerItems === undefined || eventTriggerItems === null || eventTriggerItems.length === 0) {
        addSkipped("Triggering nodes are not configured but are required for this test script.");
        return true;
    }
    serverObjectItem.Intrval = 0;
    serverObjectItem.Filter = UaEventFilter.New({
        SelectClauses: [
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "EventId" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "SourceName" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "Message" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "Severity" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "LocalTime" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "Time" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) }),
            UaSimpleAttributeOperand.New({ AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New({ Name: "SourceNode" }), TypeDefinitionId: new UaNodeId(Identifier.BaseEventType) })],
    }).toExtensionObject();
    //subscribe to the item
    var subscription = new Subscription( { MaxNotificationsPerPublish: 1, RequestedPublishingInterval: 1000, RequestedLifetimeCount: 1000 });
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if (CreateMonitoredItemsHelper.Execute({ ItemsToCreate: serverObjectItem, SubscriptionId: subscription } ) ) {
            // call Publish() to make sure that we receive nothing
            PublishHelper.Execute();
            if( PublishHelper.CurrentlyContainsEvents() ) {
                addLog( "Publish.Response.NotificationMessage.NotificationData contains information, which was not expected." );
                // call Publish again, hopefully no events this time
                PublishHelper.Execute();
                if( PublishHelper.CurrentlyContainsEvents() ) addWarning( "More events received, which were not expected. Test will continue, but may be unreliable." );
            }

            // call trigger function for each trigger item to ensure we're getting some events
            for (var i = 0; i < eventTriggerItems.length; i++) eventTriggerItems[i].invokeTrigger();

            addLog( "Triggered both trigger nodes." );
            PublishHelper.Execute();
            Assert.True( PublishHelper.CurrentlyContainsEvents(), "(Test #1) Publish.Response.NotificationMessage.NotificationData did not contain any Events." );

            // call trigger function for each trigger item to ensure we're getting some events
            for (var i = 0; i < eventTriggerItems.length; i++) eventTriggerItems[i].invokeTrigger();
            PublishHelper.Execute();
            Assert.True( PublishHelper.CurrentlyContainsEvents(), "(Test #2) Publish.Response.NotificationMessage.NotificationData did not contain any Events.\nOne event was expected." );
            notImplemented( "Check the event received is EventQueueOverflowEventType." );

            DeleteMonitoredItemsHelper.Execute({ ItemsToDelete: serverObjectItem, SubscriptionId: subscription } );
        }
    }
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}// function eventQueueOverflow001

Test.Execute( { Procedure: eventQueueOverflow001 } );