/*  Test 5.10.3 Test 5 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify same subscription 5 times in one call. */

// this function is a hook into the SetPublishingMode helper BEFORE invocation
function setFiveSubscriptions() {
    for( var i=1; i<5; i++ ) SetPublishingModeHelper.Request.SubscriptionIds[i] = SetPublishingModeHelper.Request.SubscriptionIds[0];
}

Test.Execute( { Procedure: function test() {
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    // create a DISABLED subscriptiion...
    var basicSubscription1 = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: basicSubscription1 } ) ) {
        // read the items to get the initial values 
        ReadHelper.Execute( { NodesToRead: WritableDefaultStaticItem } );
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: basicSubscription1 } ) ) {
            // call Publish() to make sure that we do NOT receive data.
            PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: basicSubscription1 } );
            addLog( "call Publish() to make sure that we DO NOT receive data." );
            if( PublishHelper.Execute() ) {
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected the initial dataChange for the subscription!" ) ) {
                    // set publishing mode    
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );
                    if( SetPublishingModeHelper.Execute( { SubscriptionIds: basicSubscription1, PublishingEnabled: false, PreHook: setFiveSubscriptions } ) ) {
                        // Write a value to the item, even though the subscription is disabled
                        UaVariant.Increment( { Item: WritableDefaultStaticItem } );
                        WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem } );
                        // LAST STEP: call Publish() again, this time we expect data!
                        addLog( "call Publish() to make sure that we DO NOT receive data." );
                        PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: basicSubscription1 } );
                        if( PublishHelper.Execute() ) Assert.False( PublishHelper.CurrentlyContainsData(), "We do not expect the subscription to return any data." );
                    }
                }
                else addError( "Publish() yielded dataChange notifications when NONE were expected. NotificationMessage.NotificationData length: " + PublishHelper.Response.NotificationMessage.NotificationData.length );
            }
            // delete the monitoredItems
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: WritableDefaultStaticItem, SubscriptionId: basicSubscription1 } );
        }
    }
    // delete all subscriptions added above
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: basicSubscription1 } );
    return( true );
} } );