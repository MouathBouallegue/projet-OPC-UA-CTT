/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify DataChangeNotifications are only generated for MonitoredItems of a Subscription which have the MonitoringMode Reporting.
*/

function test() {
    var TC_Variables = new Object();
    var i = 0;
    var j = 0;
    var numberOfMonitoredItemsInPublish = 0;
    var monitoringModes = [MonitoringMode.Reporting, MonitoringMode.Sampling, MonitoringMode.Disabled];
    var numberOfMonitoredItems = Number( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
    if( !isDefined( numberOfMonitoredItems ) || numberOfMonitoredItems === 0 ) numberOfMonitoredItems = 9;

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();
    TC_Variables.TestMonitoredItems = new MonitoredItem.GetRequiredNodes( { Number: numberOfMonitoredItems } );
    TC_Variables.ReportingItems = 0;
    TC_Variables.SamplingItems = 0;
    TC_Variables.DisabledItems = 0;

    if( !isDefined( TC_Variables.TestMonitoredItems ) || TC_Variables.TestMonitoredItems.length < 3 ) {
        if( numberOfMonitoredItems < 3 ) addSkipped( "Server does not support enough Max MonitoredItems. At least 3 needed; Configured: " + numberOfMonitoredItems + ". Skipping test case." );
        else addSkipped( "No nodes configured. Skipping test case." );
        return ( false );
    }

    for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
        TC_Variables.TestMonitoredItems[i].MonitoringMode = monitoringModes[j];
        switch( j ) {
            case 0:
                TC_Variables.ReportingItems++;
                j++;
                break;
            case 1:
                TC_Variables.SamplingItems++;
                j++;
                break;
            case 2:
                TC_Variables.DisabledItems++;
                j = 0;
                break;
            default:
                break;
        }
    }
    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        for( i = 0; i < TC_Variables.TestMonitoredItems.length; i++ ) {
            if( !TC_Variables.TestMonitoredItems[i].IsCreated ) {
                switch( TC_Variables.TestMonitoredItems[i].MonitoringMode ) {
                    case MonitoringMode.Reporting:
                        TC_Variables.ReportingItems--;
                        break;
                    case MonitoringMode.Sampling:
                        TC_Variables.SamplingItems--;
                        break;
                    case MonitoringMode.Disabled:
                        TC_Variables.DisabledItems--;
                        break;
                    default:
                        break;
                }
                TC_Variables.TestMonitoredItems.splice( i, 1 );
                i--;
            }
        }
        if( Assert.GreaterThan( 0, TC_Variables.TestMonitoredItems.length, "The creation of all MonitoredItems failed. Abort test." ) ) {
            if( Assert.GreaterThan( 0, TC_Variables.ReportingItems, "This test case requires at least 1 MonitoredItem with MonitoringMode set to Reporting. Abort test." ) &&
                Assert.GreaterThan( 0, TC_Variables.SamplingItems, "This test case requires at least 1 MonitoredItem with MonitoringMode set to Sampling. Abort test." ) &&
                Assert.GreaterThan( 0, TC_Variables.DisabledItems, "This test case requires at least 1 MonitoredItem with MonitoringMode set to Disabled. Abort test." ) ) {

                PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                for( i = 0; i < PublishHelper.CurrentDataChanges.length; i++ ) {
                    numberOfMonitoredItemsInPublish += PublishHelper.CurrentDataChanges[i].MonitoredItems.length;
                }

                if( Assert.Equal( TC_Variables.ReportingItems, numberOfMonitoredItemsInPublish, "Expected to receive the initial value for each MonitoredItem with MonitoringMode set to Reporting. Abort test." ) ) {
                    PublishHelper.CurrentDataChanges = [];
                    numberOfMonitoredItemsInPublish = 0;
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

                                if( Assert.Equal( TC_Variables.ReportingItems, numberOfMonitoredItemsInPublish, "Expected to receive a value for each MonitoredItem with MonitoringMode set to Reporting." ) ) {
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
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.TestMonitoredItems, SubscriptionId: TC_Variables.TestSubscription } );
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
