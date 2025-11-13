/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies samplingInterval of -1 ms.
        Expected result: ServiceResult/OperationResult: Good
        The UA server should revise the SamplingInterval to the PublishingInterval of the subscription. */

function createMonitoredItems591037() {
    var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems } );
    if( items == null || items.length == 1 ) { addSkipped( "Not enough Scalar STATIC items defined." ); return( false ); }
    for( var i=0; i<items.length; i++ ) items[i].SamplingInterval = -1;

    if( !MonitorBasicSubscription.SubscriptionCreated ) addError( "Subscription for Monitor Basic was not created." );
    else {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
            Assert.NotEqual( -1, items[0].RevisedSamplingInterval, "Invalid Sampling period was not revised!" );
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: MonitorBasicSubscription } );
        }
    }
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems591037 } );