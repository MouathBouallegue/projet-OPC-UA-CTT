/*  Test 5.10.2 Test case 4 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Modifies a subsription setting RequestedPublishingInterval matches RevisedPublishingInterval from CreateSubscription. */

function modifySubscription5102004() {
    var subscription = new Subscription();
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        // register the subscription with Publish.
        PublishHelper.RegisterSubscription( subscription );
        var originalSubscription = subscription.Clone();
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription } );

            // check the revisedValues are the same as they were previously
            Assert.Equal( originalSubscription.RevisedPublishingInterval, subscription.RevisedPublishingInterval, "RevisedPublishingInterval difference." );
            Assert.Equal( originalSubscription.RevisedLifetimeCount, subscription.RevisedLifetimeCount, "RevisedLifetimeCount difference." );
            Assert.Equal( originalSubscription.RevisedMaxKeepAliveCount, subscription.RevisedMaxKeepAliveCount, "RevisedMaxKeepAliveCount difference." );

            var startTime = UaDateTime.utcNow();
            for( var i=0; i<3; i++ ) {
                UaVariant.Increment( { Item: WritableDefaultStaticItem, Offset: 4 + i } );
                WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem } );
                PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: subscription } );
                PublishHelper.Execute( { NoAcks: true } );
            }// while
            var stopTime = UaDateTime.utcNow();
            var difference = startTime.secsTo( stopTime );
            addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + difference );

            Assert.Equal( 3, PublishHelper.ReceivedDataChanges.length, "Expected 3 callbacks." );
            //delete the monitoredItem
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: WritableDefaultStaticItem, SubscriptionId: subscription } );
        }
    }
    // unregister the subscription with Publish 
    PublishHelper.UnregisterSubscription( subscription );
    // clean-up
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    PublishHelper.Clear();
    return( true );
}

Test.Execute( { Procedure: modifySubscription5102004 } );