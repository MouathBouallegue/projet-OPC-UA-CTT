/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify DataChangeNotifications for all MonitoredItems of a Subscription are NOT sent, when all MonitoredItems have the MonitoringMode Sampling.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;
    var numberOfMonitoredItemsInPublish = 0;
    var numberOfMonitoredItems = Number( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
    if( !isDefined( numberOfMonitoredItems ) || numberOfMonitoredItems === 0 ) numberOfMonitoredItems = 10;

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestMonitoredItems = new MonitoredItem.GetRequiredNodes( { Number: numberOfMonitoredItems } );

    if( !isDefined( TC_Variables.TestMonitoredItems ) || TC_Variables.TestMonitoredItems.length < 1 ) {
        addSkipped( "No nodes configured. Skipping test case." );
        return ( false );
    }

    for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
        TC_Variables.TestMonitoredItems[i].MonitoringMode = MonitoringMode.Sampling;
    }
    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
            if( !TC_Variables.TestMonitoredItems[i].IsCreated ) {
                TC_Variables.TestMonitoredItems.splice( i, 1 );
                i--;
            }
        }
        if( Assert.GreaterThan( 0, TC_Variables.TestMonitoredItems.length, "The creation of all MonitoredItems failed. Abort test." ) ) {
            PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

            for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
            }

            if( Assert.Equal( 0, numberOfMonitoredItemsInPublish, "Expected to receive a KeepAlive notification because the MonitoringMode of all MonitoredItems is set to Sampling. Abort test." ) ) {

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

                            if( Assert.Equal( 0, numberOfMonitoredItemsInPublish, "Expected to receive another KeepAlive notification after calling ResendData because the MonitoringMode of all MonitoredItems is set to Sampling." ) ) {
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
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
