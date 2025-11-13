/*  Test  prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request 2 items in a subscription */

function createMonitoredItems2() {
    if( !isDefined(items[0]) || !isDefined(items[1]) ) {
        addSkipped( "No Static Scalar (numeric) node is defined. Skipping test case." );
        return ( false );
    }
    var items2 = [ items[0], items[1] ];
    CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items2, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: defaultSubscription } );
    PublishHelper.Execute( { FirstPublish: true } );
    Assert.True( PublishHelper.CurrentlyContainsData(), "Publish() did not provide an initial data-change notification.", "Publish() returned initial-data as expected." );
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items2, SubscriptionId: defaultSubscription } );
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems2 } );