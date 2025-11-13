/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script sets monitoring mode of at least one monitoreditemId belonging to a different subscription. */

function setMonitoringMode593Err008() {
    // create our items
    if ( scalarItems.length < 3 ) {
        addSkipped("Not enough items to test.");
        return (false);
    } 
    var firstItem = scalarItems[0].clone();
    var secondItem = scalarItems[1].clone();
    var thirdItem = scalarItems[2].clone();
    if( !isDefined( firstItem ) || !isDefined( secondItem ) || !isDefined( thirdItem ) ) {
        addSkipped( "Not enough items to test." );
        return( false );
    }
    if (gServerCapabilities.MaxSupportedSubscriptions < 2 && gServerCapabilities.MaxSupportedSubscriptions != 0) {
        addSkipped("Server does not support two subscriptions as needed for this test case. This is only allowed for Nano and Micro Device Server profiles.");
        return (false);
    }
    // We already have one subscription created in the initialize routine. Lets's create the second one here
    var secondSubscription = new Subscription();
    CreateSubscriptionHelper.Execute( { Subscription: secondSubscription } );
    var firstSubscription = MonitorBasicSubscription;
    if( !firstSubscription.SubscriptionCreated || !secondSubscription.SubscriptionCreated ) {
        addError( "One or both subscriptions for conformance unit Monitor Basic was not created." );
        return( false );
    }
    // Add monitored items using default parameters to the first subscription
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: firstItem, SubscriptionId: firstSubscription } ) ) {
        // Add monitored items using default parameters to the second subscription
        if( maxMonitoredItems > 2 ) {
            if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: [ secondItem, thirdItem ], SubscriptionId: secondSubscription } ) ) {
                // Set the monitoringmode to disabled
                SetMonitoringModeHelper.Execute( { SubscriptionId: firstSubscription, MonitoredItemIds: thirdItem, MonitoringMode: MonitoringMode.Disabled, OperationResults: new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) } );
            }
        }
        // Delete the items we added to the first subscription
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: firstItem, SubscriptionId: firstSubscription } );
        if( maxMonitoredItems > 2 ) {
            // Delete the items we added to the second subscription
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: [ secondItem, thirdItem ], SubscriptionId: secondSubscription } );
        }
    }
    // Delete the second subscription (first subscription will be deleted in the common cleanup code)
    return( DeleteSubscriptionsHelper.Execute( { SubscriptionIds: secondSubscription } ) );
}

Test.Execute( { Procedure: setMonitoringMode593Err008 } );