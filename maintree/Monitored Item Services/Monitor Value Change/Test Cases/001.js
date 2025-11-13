/*  Test prepared by Development; compliance@opcfoundation.org
    Description: CreateMonitoredItems uses default parameter values. Expected to succeed.
        subscription is created and deleted in initialize and cleanup scripts */

function createMonitoredItems591001() {
    var item = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: 1 });
    if (item.length < 1 || item === undefined || item === null) {
        addSkipped("Not enough scalar items defined for the test. Skipping test.");
        return false;
    }
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
        // wait one publishing cycle before calling publish
        PublishHelper.WaitInterval( { Items: item, Subscription: MonitorBasicSubscription } );
        if( PublishHelper.Execute( { FirstPublish: true } ) ) {
            if( Assert.True ( PublishHelper.CurrentlyContainsData(), "Expected an initial dataChange! The subscription was created, we waited for one publish interval and then called Publish." ) ) {
                Assert.Equal( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive an initial callback for all nodes added." );
            }
        }
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: item, SubscriptionId: MonitorBasicSubscription } );
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems591001 } );