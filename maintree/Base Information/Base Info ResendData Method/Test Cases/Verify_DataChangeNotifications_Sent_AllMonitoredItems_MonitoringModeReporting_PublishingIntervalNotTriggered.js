/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify DataChangeNotifications for all MonitoredItems of a Subscription are sent, when all MonitoredItems have the MonitoringMode Reporting but the PublishingInterval is not triggered yet.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestSubscription.PublishingInterval = 1000;
    TC_Variables.TestSubscription.MaxKeepAliveCount = 3;
    TC_Variables.TestMonitoredItems = [new MonitoredItem( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ), null, Attribute.Value, null, MonitoringMode.Reporting, null, null, null, 5000 )];

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
            if( TC_Variables.TestMonitoredItems[0].RevisedSamplingInterval > 2 * TC_Variables.TestSubscription.RevisedPublishingInterval ) {
                var startTime = new UaDateTime.Now();
                while( startTime.msecsTo( new UaDateTime.Now() ) < ( 3 * TC_Variables.TestMonitoredItems[0].RevisedSamplingInterval ) && PublishHelper.CurrentDataChanges.length < 1 ) {
                    PublishHelper.Execute();
                }

                if( Assert.Equal( TC_Variables.TestMonitoredItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive the initial value for each MonitoredItem. Abort test." ) ) {

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

                                if( Assert.Equal( TC_Variables.TestMonitoredItems.length, PublishHelper.CurrentDataChanges.length, "Expected to receive a value for each MonitoredItem again after calling ResendData." ) ) {
                                    if( Assert.Equal( PublishHelper.ReceivedDataChanges[0], PublishHelper.ReceivedDataChanges[1], "Expected to receive the same value after calling ResendData than in last Publish because a new Sample should not be present yet." ) ) {
                                        TC_Variables.TestResult = true;
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
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
