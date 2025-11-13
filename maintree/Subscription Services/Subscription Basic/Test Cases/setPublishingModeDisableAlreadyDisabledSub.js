/*  Test 5.10.3 Test 4 prepared by Development; compliance@opcfoundation.org
    Description: Modifies a valid (disabled) subscription by disabling it (again).
        This script works by:
         1) creating 2 monitored items
         2) subscribing to them (disabled subscription)
         3) calling Publish once, to verify we are NOT receiving data
         4) enabling the subscription
         5) calling Publish again, to verify we ARE receiving data for the subscription. */

function setPublishingMode5103004() {
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    var basicSubscription1 = new Subscription( null, false ); // create a DISABLED subscriptiion...
    if( CreateSubscriptionHelper.Execute( { Subscription: basicSubscription1 } ) ) {
        // add some monitored items to our subscription
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: basicSubscription1 } ) ) {
            // call Publish() to make sure that we do NOT receive data.
            PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: basicSubscription1 } );
            if( PublishHelper.Execute() ) {
                if( Assert.Equal( false, PublishHelper.CurrentlyContainsData(), "We dot not expect dataChanges from a disabled subscription!" ) ) {
                    // set publishing mode    
                    if( SetPublishingModeHelper.Execute( { SubscriptionIds: basicSubscription1, PublishingEnabled: false } ) ) {
                        // Write a value to the item, even though the subscription is disabled
                        UaVariant.Increment( { Item: WritableDefaultStaticItem, Offset: new Date().getSeconds() } );
                        WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem } );
                        // LAST STEP: call Publish() again, this time we expect data!
                        addLog( "call Publish() to make sure that we DO NOT receive data." );
                        PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: basicSubscription1 } );
                        if( PublishHelper.Execute() ) Assert.False( PublishHelper.CurrentlyContainsData(), "We do not expect the subscription to return any data." );
                    }
                }
                else addError( "Publish() yielded dataChange notifications when NONE were expected. NotificationMessage.NotificationData length: " + PublishHelper.Response.NotificationMessage.NotificationData.length );
            }
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: WritableDefaultStaticItem, SubscriptionId: basicSubscription1 } );
        }
    }
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: basicSubscription1 } );
    return( true );
}

Test.Execute( { Procedure: setPublishingMode5103004 } );