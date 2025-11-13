/*  Test 5.10.6 Test 2 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Deletes multiple subscriptions. */

function deleteSubscription5106003() {
    const EXPECT_SERVICE_FAIL = false;

    if( !isDefined( SubscriptionMonitoredItems ) || SubscriptionMonitoredItems.length === 0 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }

    subscription1 = new Subscription();

    if( CreateSubscriptionHelper.Execute( { Subscription: subscription1 } ) ) {
        // create the items and then delete the subscription
        CreateMonitoredItemsHelper.Execute( { ItemsToCreate: SubscriptionMonitoredItems, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: subscription1 } );
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription1 } );

        // now try to call modify
        var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        ModifySubscriptionHelper.Execute( {
                        ItemsToModify: SubscriptionMonitoredItems, 
                        TimestampstoReturn: TimestampsToReturn.Server, 
                        SubscriptionId: subscription1, 
                        ServiceResult: expectedResults
                        } );
    }

    //clean-up
    subscription1 = null;
    return( true );
}

Test.Execute( { Procedure: deleteSubscription5106003 } );