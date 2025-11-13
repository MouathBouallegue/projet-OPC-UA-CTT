/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify invali dlogic, e.g. "x=6 && x=6" */

function test() {
    var serverObjectItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ), Attribute.EventNotifier )[0];
    serverObjectItem.Interval = 0;
    serverObjectItem.Filter = UaEventFilter.New( {
            SelectClauses: [
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "EventId" } ),    TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "SourceName" } ), TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "Message" } ),    TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "Severity" } ),   TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "LocalTime" } ),  TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "Time" } ),       TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "SourceNode" } ), TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ) ],
            WhereClause: UaContentFilter.New( {
                            Elements: [ 
                                UaContentFilterElement.New( {
                                        FilterOperator: FilterOperator.And,
                                        FilterOperands: [
                                            UaElementOperand.New( { Index: 1 } ).toExtensionObject(),
                                            UaElementOperand.New( { Index: 2 } ).toExtensionObject()
                                            ] } ),
                                UaContentFilterElement.New( { 
                                        FilterOperator: FilterOperator.Equals,
                                        FilterOperands: [
                                            UaAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaRelativePath.FromStrings( [ "Severity" ] ), TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ).toExtensionObject(),
                                            UaLiteralOperand.New( { Value: UaVariant.New( { Type: BuiltInType.Int16, Value: 5 } ) } ).toExtensionObject()
                                            ] } ),
                                UaContentFilterElement.New( { 
                                        FilterOperator: FilterOperator.Equals,
                                        FilterOperands: [
                                            UaAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaRelativePath.FromStrings( [ "Severity" ] ), TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ).toExtensionObject(),
                                            UaLiteralOperand.New( { Value: UaVariant.New( { Type: BuiltInType.Int16, Value: 6 } ) } ).toExtensionObject()
                                            ] } ),
                                ] } ) } ).toExtensionObject();
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
                    notImplemented( "Event validation: Will be added shortly." );
                }
                else print( "No event data received on Publish call # " + ( 1 + i ) + " of 2." );
            }//for i...
            if (!eventsReceived) addError("No events received even though the trigger nodes have been triggered.")
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: serverObjectItem, SubscriptionId: subscription, SuppressMessaging: Settings.ServerTest.Debug } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription, SuppressMessaging: Settings.ServerTest.Debug } );
    }
    else return( false );
}

test();