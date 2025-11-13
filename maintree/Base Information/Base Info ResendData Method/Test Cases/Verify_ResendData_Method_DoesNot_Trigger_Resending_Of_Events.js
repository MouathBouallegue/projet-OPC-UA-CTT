/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the ResendData method does not trigger resending of events.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;
    var j = 0;

    var eventTriggerItems = MonitoredItem.fromSettings( ["/Server Test/NodeIds/Events/TriggerNode01", "/Server Test/NodeIds/Events/TriggerNode02"], undefined, Attribute.NodeClass );
    if( !isDefined( eventTriggerItems ) || eventTriggerItems.length === 0 ) {
        addSkipped( "Node to trigger an event is not configured." );
        return ( false );
    }

    // determine the type of the triggers
    if( !ReadHelper.Execute( { NodesToRead: eventTriggerItems } ) ) {
        addError( "Unable to read trigger nodes. Aborting test." );
        return ( false );
    }
    for( i = 0; i < eventTriggerItems.length; i++ ) {
        eventTriggerItems[i].AttributeId = Attribute.Value;                                   // change the attribute to .Value
        if( eventTriggerItems[i].Value.Value.toInt32() === NodeClass.Variable ) {
            ReadHelper.Execute( { NodesToRead: eventTriggerItems[i] } );                      // read the value, so that we have it
            eventTriggerItems[i].OriginalValue = eventTriggerItems[i].Value.Value.clone();    // remember the initial value so we can revert to it later
            eventTriggerItems[i].invokeTrigger = function() {
                UaVariant.Increment( { Item: this } );                                 // increment the value
                return ( WriteHelper.Execute( { NodesToWrite: this } ) );                      // write the value to the server
            }
        }
        else if( eventTriggerItems[i].Value.Value.toInt32() === NodeClass.Method ) {
            eventTriggerItems[i].parentObject = init_GetMethodParent( eventTriggerItems[i].NodeId );
            eventTriggerItems[i].invokeTrigger = function() {
                if( isDefined( this.parentObject ) ) {
                    return ( CallHelper.Execute( { MethodsToCall: [{ MethodId: this.NodeId, ObjectId: this.parentObject.NodeId }] } ) );
                }
            }
        }
        else eventTriggerItems[i].invokeTrigger = function() { return ( true ); }
    }//for i...

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestMonitoredItem = new MonitoredItem( new UaNodeId( Identifier.Server ) );
    TC_Variables.TestMonitoredItem.AttributeId = Attribute.EventNotifier;

    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        TC_Variables.TestMonitoredItem.Filter = UaEventFilter.New( {
            SelectClauses: [
                UaSimpleAttributeOperand.New( { AttributeId: Attribute.Value, BrowsePath: UaQualifiedName.New( { Name: "EventId" } ), TypeDefinitionId: new UaNodeId( Identifier.BaseEventType ) } ),
            ],
            WhereClause: UaContentFilter.New()
        } ).toExtensionObject();

        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItem, SubscriptionId: TC_Variables.TestSubscription } ) && TC_Variables.TestMonitoredItem.IsCreated ) {

            eventTriggerItems[0].invokeTrigger();

            PublishHelper.Execute( { FirstPublish: true } );

            if( Assert.GreaterThan( 0, PublishHelper.CurrentEvents.length, "Expected to receive at least one event because we previoulsy triggered one using TriggerNode01. Abort test." ) ) {
                TC_Variables.ReceivedEventIds = [];
                for( i = 0; i < PublishHelper.CurrentEvents.length; i++ ) {
                    for( j = 0; j < PublishHelper.CurrentEvents[i].Events.length; j++ ) {
                        TC_Variables.ReceivedEventIds.push( PublishHelper.CurrentEvents[i].Events[j].EventFields[0].toString() );
                    }
                }
                if( CallHelper.Execute( {
                    MethodsToCall: [{
                        MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
                        ObjectId: new UaNodeId( Identifier.Server ),
                        InputArguments: UaVariant.New( { Value: TC_Variables.TestSubscription.SubscriptionId, Type: BuiltInType.UInt32 } )
                    }]
                } ) ) {
                    if( CallHelper.Response.Results[0].StatusCode.StatusCode !== StatusCode.BadNotImplemented ) {
                        if( Assert.True( CallHelper.Response.Results[0].StatusCode.isGood(), "Calling ResendData failed with StatusCode: " + CallHelper.Response.Results[0].StatusCode + ". Abort test." ) ) {
                            PublishHelper.Execute();

                            if( PublishHelper.CurrentEvents.length > 0 ) {
                                var found = false;
                                for( i = 0; i < PublishHelper.CurrentEvents.length && !found; i++ ) {
                                    for( s = 0; s < PublishHelper.CurrentEvents[i].Events.length && !found; s++ ) {
                                        for( j = 0; j < TC_Variables.ReceivedEventIds.length && !found; j++ ) {
                                            if( PublishHelper.CurrentEvents[i].Events[s].EventFields[0].toString() === TC_Variables.ReceivedEventIds[j] ) {
                                                found = true;
                                            }
                                        }
                                    }
                                }
                                if( Assert.Equal( false, found, "Expected to receive not to receive the same event again after calling ResendData." ) ) {
                                    TC_Variables.TestResult = true;
                                }
                            }
                        }
                        else {
                            addNotSupported( "The ResendData method is available in the address space of the server returned BadNotImplemented when calling it.\nPlease verify that this CU is optional in the desired target profile. Aborting Conformance Unit." );
                            stopCurrentUnit();
                        }
                    }
                }
            }
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItem, SubscriptionId: TC_Variables.TestSubscription } );
        }
        else {
            addError( "The creation of all MonitoredItems failed. Abort test." );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
