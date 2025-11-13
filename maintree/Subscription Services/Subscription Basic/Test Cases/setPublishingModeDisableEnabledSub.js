/*  Test 5.10.3 Test 1 prepared by Development; compliance@opcfoundation.org
    Description: Modifies a valid (enabled) subscription by disabling it.
        This script works by:
         1) creating 2 monitored items
         2) subscribing to them
         3) calling Publish once, to verify we are receiving data
         4) disabling a subscription
         5) calling Publish again, to verify we do not receive data for the disabled subscription. */

Test.Execute( { Procedure: function test() {
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    const DELAYTIMER = 1000;
    var basicSubscription1 = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: basicSubscription1 } ) ) {

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: basicSubscription1 } ) ) {
            wait( DELAYTIMER );
            // call Publish() to make sure that we do receive data.
            if( PublishHelper.Execute( { FirstPublish: true } ) ) {
                if( Assert.Equal( true, PublishHelper.CurrentlyContainsData(), "We expect a DataChange" ) ) {
                    print( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );
                    // set publishing mode
                    if( SetPublishingModeHelper.Execute( { SubscriptionIds: basicSubscription1, PublishingEnabled: false } ) ) {
                        // Write a value to the monitoredItem
                        UaVariant.Increment( { Item: WritableDefaultStaticItem } );
                        WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem } );
                        // add a delay to give UA Server time to acquire some data
                        wait( DELAYTIMER );
                        // LAST STEP: call Publish() again, this time we expect no data!
                        if( PublishHelper.Execute() ) Assert.Equal( false, PublishHelper.CurrentlyContainsData(), "We DO NOT expect DataChanges" );
                    }
                }
            }
            // delete the monitoredItems
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: WritableDefaultStaticItem, SubscriptionId: basicSubscription1 } );
        }// if createMonItems
    }
    // delete all subscriptions added above
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: basicSubscription1 } );
    return( true );
} } );