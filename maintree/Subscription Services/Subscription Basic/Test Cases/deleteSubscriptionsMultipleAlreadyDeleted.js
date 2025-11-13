/*  Test 5.10.6 Test 5 prepared by compliance@opcfoundation.org
    Description: Script deletes multiple subscriptions using the subscriptionIds of subscriptions that have already been deleted. */

function deleteSubscription5106Err005() {
    var subscriptions = [];
    // STEP 1: Create the subscriptions;
    //         Note: low-level servers may only support one subscription!
    var sub1 = new Subscription( 1000 );
    if( CreateSubscriptionHelper.Execute( { Subscription: sub1 } ) ) {

        var sub2 = new Subscription( 1000 );
        CreateSubscriptionHelper.Execute( { Subscription: sub2, ServiceResult:  new ExpectedAndAcceptedResults( [ StatusCode.BadTooManySubscriptions, StatusCode.Good] ) } );

        // clean-up
        if (CreateSubscriptionHelper.Response.ResponseHeader.ServiceResult.isGood()) DeleteSubscriptionsHelper.Execute({ SubscriptionIds: [sub1, sub2] });
        else {
            DeleteSubscriptionsHelper.Execute({ SubscriptionIds: sub1 });
            addSkipped("Server only supports 1 Subscription. This is only allowed for Nano and Micro Embedded Device Server Profile. ");
        }
    }

    return( true );
}

Test.Execute( { Procedure: deleteSubscription5106Err005 } );