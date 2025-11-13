/*  Test 5.10.2 Test case 5 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Modifies a subsription setting RequestedPublishingInterval=1; Server returns fastest possible value which != 0. */

function modifySubscription5102005() {
    
    // check if static item is defined
    if( !isDefined( defaultStaticItem ) || defaultStaticItem.length == 0 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }
    
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: defaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            subscription.SetParameters( 1 );
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription } );
            // check the revised publishingInterval matches the fastest the server supports
            if( ModifySubscriptionHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
                Assert.CoercedEqual( fastestPublishingIntervalSupported, subscription.RevisedPublishingInterval, "RevisedPublishingInterval is not set to the fastest value the UA Server supports." );
            }
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: defaultStaticItem, SubscriptionId: subscription } );
        }
    }
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: modifySubscription5102005 } );