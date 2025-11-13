/*  Test prepared by Development; compliance@opcfoundation.org
    Description: QueueSize = Max UInt32; Expect revision. */

function createMonitoredItems591004() {
    var item = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, 0 )[0];
    if( !isDefined( item ) ) {
        addSkipped( "No scalar items defined. Aborting." );
        return( false );
    }
    item.QueueSize = Constants.UInt32_Max;
    if (!MonitorQueueSize1Subscription.SubscriptionCreated) {
        addError("Subscription for conformance unit Monitor QueueSize_1 was not created.");
        return (false)
    }
    // add the item
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: MonitorQueueSize1Subscription } ) ) {
        if( Constants.UInt32_Max === item.RevisedQueueSize) addWarning( "Expected the server to revise the queueSize from a Max UInt32." );
        Assert.GreaterThan( 0, item.RevisedQueueSize, "Expected the server to revise the queueSize to be 2 or greater, per the conformance unit requirements.", "CreateMonitoredItems() revised queueSize as expected from Max UInt32 to " + item.RevisedQueueSize + "." );
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: item, SubscriptionId: MonitorQueueSize1Subscription } );
    }

    return( true );
}

Test.Execute( { Procedure: createMonitoredItems591004 } );