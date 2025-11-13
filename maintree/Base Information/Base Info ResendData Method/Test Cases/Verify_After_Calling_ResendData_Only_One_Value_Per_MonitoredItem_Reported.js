/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that after calling ResendData only one value per MonitoredItem is reported.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;
    var numberOfMonitoredItemsInPublish = 0;
    var numberOfMonitoredItems = Number( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
    if( !isDefined( numberOfMonitoredItems ) || numberOfMonitoredItems === 0 ) numberOfMonitoredItems = 10;

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestMonitoredItems = new MonitoredItem.GetRequiredNodes( { Number: numberOfMonitoredItems, Writable: true, SkipCreateSession: true } );

    if( !isDefined( TC_Variables.TestMonitoredItems ) || TC_Variables.TestMonitoredItems.length < 1 ) {
        addSkipped( "No nodes configured. Skipping test case." );
        return ( false );
    }

    for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
            TC_Variables.TestMonitoredItems[i].QueueSize = 2;
    }

    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
            if( !TC_Variables.TestMonitoredItems[i].IsCreated || TC_Variables.TestMonitoredItems[i].RevisedQueueSize < 2 ) {
                TC_Variables.TestMonitoredItems.splice( i, 1 );
                i--;
            }
        }
        if( Assert.GreaterThan( 0, TC_Variables.TestMonitoredItems.length, "The creation of all MonitoredItems failed. Abort test." ) ) {
            PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

            for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
            }

            PublishHelper.SetItemValuesFromDataChange( TC_Variables.TestMonitoredItems );
            TC_Variables.OriginalValues = MonitoredItem.Clone( TC_Variables.TestMonitoredItems, { IncludeValue: true } );

            if( Assert.Equal( TC_Variables.TestMonitoredItems.length, numberOfMonitoredItemsInPublish, "Expected to receive the initial value for each MonitoredItem. Abort test." ) ) {
                numberOfMonitoredItemsInPublish = 0;
                PublishHelper.Execute();
                if( Assert.Equal( 0, PublishHelper.CurrentDataChanges.length, "Expected to receive a KeepAlive notification after receiving all initial values. Abort test." ) ) {
                    PublishHelper.WaitInterval( { Item: TC_Variables.TestMonitoredItems[0], Subscription: TC_Variables.TestSubscription } );
                    for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
                        UaVariant.Increment( { Item: TC_Variables.TestMonitoredItems[i] } );
                    }

                    WriteHelper.Execute( { NodesToWrite: TC_Variables.TestMonitoredItems } );
                    PublishHelper.WaitInterval( { Item: TC_Variables.TestMonitoredItems[0], Subscription: TC_Variables.TestSubscription } );

                    if( CallHelper.Execute( {
                        MethodsToCall: [{
                            MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
                            ObjectId: new UaNodeId( Identifier.Server ),
                            InputArguments: UaVariant.New( { Value: TC_Variables.TestSubscription.SubscriptionId, Type: BuiltInType.UInt32 } )
                        }]
                    } ) ) {
                        if( CallHelper.Response.Results[0].StatusCode.StatusCode !== StatusCode.BadNotImplemented ) {
                            if( Assert.True( CallHelper.Response.Results[0].StatusCode.isGood(), "Calling ResendData failed with StatusCode: " + CallHelper.Response.Results[0].StatusCode + ". Abort test." ) ) {
                                PublishHelper.Execute( { GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                                for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                                    numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
                                }

                                if( Assert.Equal( TC_Variables.TestMonitoredItems.length, numberOfMonitoredItemsInPublish, "Expected to receive only one value for each MonitoredItem after calling ResendData." ) ) {
                                    TC_Variables.TestResult = true;
                                }
                            }
                        }
                        else {
                            addNotSupported( "The ResendData method is available in the address space of the server returned BadNotImplemented when calling it.\nPlease verify that this CU is optional in the desired target profile. Aborting Conformance Unit." );
                            stopCurrentUnit();
                        }
                    }
                    WriteHelper.Execute( { NodesToWrite: TC_Variables.OriginalValues } );
                }
            }
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
