/*  Test 5.10.5 Error case 3 prepared by Matthias Isele; matthias.isele@ascolab.com
    Description: Republish using an invalid subscriptionId. Expected Result: Bad_SubscriptionIdInvalid */

function republish5105Err003() {
    // create subscription    
    var subscription = new Subscription();
    CreateSubscriptionHelper.Execute( { Subscription: subscription } );

    // create monitored items
    if( !isDefined( SubscriptionMonitoredItems ) || SubscriptionMonitoredItems.length == 0 ) {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return( false );
    }

    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: SubscriptionMonitoredItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) return( false );

    // call Publish() to get the first sequence number
    if( !PublishHelper.Execute() ) {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        return( false );
    }

    // call republish with the sequence number received above
    RepublishHelper.Execute( { RetransmitSequenceNumber: PublishHelper.ReceivedSequenceNumbers.pop(), SubscriptionId: { SubscriptionId: Constants.Int32_Max }, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadMessageNotAvailable, StatusCode.BadSubscriptionIdInvalid ] ) } );

    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: SubscriptionMonitoredItems, SubscriptionId: subscription } );
    DeleteSubscriptionsHelper.Execute ( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: republish5105Err003 } );