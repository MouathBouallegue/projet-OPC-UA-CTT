/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the server only generates DataChangeNotifications for the given Subscription ID.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;
    var numberOfMonitoredItemsInPublish = 0;
    var numberOfMonitoredItems = Number( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
    if( !isDefined( numberOfMonitoredItems ) || numberOfMonitoredItems === 0 || numberOfMonitoredItems > 10 ) numberOfMonitoredItems = 10;

    if( Number( Settings.ServerTest.Capabilities.MaxSupportedSubscriptions ) === 1 ) {
        addSkipped( "This test case requires 2 Subscriptions. According to the CTT settings, only 1 subscription is supported by the server." );
        return ( false );
    }

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestSubscription2 = new Subscription();
    TC_Variables.TestMonitoredItems = new MonitoredItem.GetRequiredNodes( { Number: numberOfMonitoredItems } );
    TC_Variables.TestMonitoredItems2 = new MonitoredItem.GetRequiredNodes( { Number: numberOfMonitoredItems } );

    if( !isDefined( TC_Variables.TestMonitoredItems ) || TC_Variables.TestMonitoredItems.length < 1 || !isDefined( TC_Variables.TestMonitoredItems2 ) || TC_Variables.TestMonitoredItems2.length < 1 ) {
        addSkipped( "No nodes configured. Skipping test case." );
        return ( false );
    }

    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );
    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription2 } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) && Assert.True( TC_Variables.TestSubscription2.SubscriptionCreated, "Unable to create two subscriptions. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription2 );

        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItems2, SubscriptionId: TC_Variables.TestSubscription2 } );

        for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
            if( !TC_Variables.TestMonitoredItems[i].IsCreated ) {
                TC_Variables.TestMonitoredItems.splice( i, 1 );
                i--;
            }
        }

        for( i = 0; i < TC_Variables.TestMonitoredItems2.length; i++ ) {
            if( !TC_Variables.TestMonitoredItems2[i].IsCreated ) {
                TC_Variables.TestMonitoredItems2.splice( i, 1 );
                i--;
            }
        }

        if( Assert.GreaterThan( 0, TC_Variables.TestMonitoredItems.length, "The creation of all MonitoredItems in the first subscription failed. Abort test." ) && Assert.GreaterThan( 0, TC_Variables.TestMonitoredItems2.length, "The creation of all MonitoredItems in the second subscription failed. Abort test." ) ) {

            PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

            for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
            }

            PublishHelper.CurrentDataChanges = [];
            PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

            for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
            }

            if( Assert.Equal( ( TC_Variables.TestMonitoredItems.length + TC_Variables.TestMonitoredItems2.length ), numberOfMonitoredItemsInPublish, "Expected to receive the initial value for each MonitoredItem. Abort test." ) ) {
                numberOfMonitoredItemsInPublish = 0;
                PublishHelper.Execute();
                if( Assert.Equal( 0, PublishHelper.CurrentDataChanges.length, "Expected to receive a KeepAlive notification after receiving all initial values. Abort test." ) ) {

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
                                PublishHelper.Execute( { GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                                for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                                    numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
                                }

                                if( Assert.Equal( TC_Variables.TestMonitoredItems.length, numberOfMonitoredItemsInPublish, "Expected to receive a value for each MonitoredItem again after calling ResendData. Abort test." ) ) {
                                    if( CallHelper.Execute( {
                                        MethodsToCall: [{
                                            MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
                                            ObjectId: new UaNodeId( Identifier.Server ),
                                            InputArguments: UaVariant.New( { Value: TC_Variables.TestSubscription.SubscriptionId, Type: BuiltInType.UInt32 } )
                                        },
                                        {
                                            MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
                                            ObjectId: new UaNodeId( Identifier.Server ),
                                            InputArguments: UaVariant.New( { Value: TC_Variables.TestSubscription2.SubscriptionId, Type: BuiltInType.UInt32 } )
                                        }]
                                    } ) ) {
                                        numberOfMonitoredItemsInPublish = 0;
                                        PublishHelper.CurrentDataChanges = [];

                                        PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                                        for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                                            numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
                                        }

                                        PublishHelper.CurrentDataChanges = [];
                                        PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                                        for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                                            numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
                                        }

                                        if( Assert.Equal( ( TC_Variables.TestMonitoredItems.length + TC_Variables.TestMonitoredItems2.length ), numberOfMonitoredItemsInPublish, "Expected to receive values for all MonitoredItems of both subscriptions." ) ) {
                                            TC_Variables.TestResult = true;
                                        }
                                    }
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
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems2, SubscriptionId: TC_Variables.TestSubscription2 } );
    }

    if( TC_Variables.TestSubscription.SubscriptionCreated ) DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    if( TC_Variables.TestSubscription2.SubscriptionCreated ) DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription2 } );

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
