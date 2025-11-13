/*  Test 5.10.4 Test 2, prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Calls Publish while acknowledging a valid sequenceNumber on a valid subscription. */

function publish5104002() {
    const PUBLISHCALLCOUNT = 5; //how many times to call "Publish" in a loop.

    // step 1 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    if( defaultStaticItem == null || defaultStaticItem.length == 0 ) {
        addSkipped( "Static Scalar - items needed" );
        return( false );
    }

    // step 2 - create the subscription.
    basicSubscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: basicSubscription } ) ) return( false );

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: defaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: basicSubscription } ) ) {
        // wait for 1 publish interval to allow the monitoredItems to be polled.
        print( "Waiting " + basicSubscription.RevisedPublishingInterval + " msecs (1 publishingInterval) before calling Publish()" );
        PublishHelper.WaitInterval( { Items: defaultStaticItem, Subscription: basicSubscription } );
        if( PublishHelper.Execute( { FirstPublish: true } ) ) { // initial dataChange
            PublishHelper.Execute(); // acknowledge receipt of above
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: defaultStaticItem, SubscriptionId: basicSubscription } )
    }
    // delete the subscription we added here 
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: basicSubscription } );
    return( true );
}

Test.Execute( { Procedure: publish5104002 } );