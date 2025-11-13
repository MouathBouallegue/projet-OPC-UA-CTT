/*  Test 5.10.5 Error Test 6 prepared by Anand Taparia; ataparia@kepwaare.com
    Description: Script calls republish using a sequenceNumber that had been previously acknowledged in a publish call.
    Expects BadMessageNotAvailable. */

function republish5105Err006() {
    var subscription = new Subscription();
    CreateSubscriptionHelper.Execute( { Subscription: subscription } );

    // create monitored items
    if( !isDefined( SubscriptionMonitoredItems ) || SubscriptionMonitoredItems.length === 0 ) {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return( false );
    }

    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: SubscriptionMonitoredItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) return( false );

    PublishHelper.WaitInterval( { Items: SubscriptionMonitoredItems, Subscription: subscription } );

    // call Publish() to get the first sequence number
    if( !PublishHelper.Execute() ) {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        return( false );
    }
    
    // call Publish()() to acknowledge the first sequence
    PublishHelper.Execute();

    // call republish with the sequence number received above
    RepublishHelper.Execute( { RetransmitSequenceNumber: PublishHelper.ReceivedSequenceNumbers.shift(), SubscriptionId: subscription, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadMessageNotAvailable, StatusCode.BadMessageNotAvailable ] ) } );

    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: SubscriptionMonitoredItems, SubscriptionId: subscription } );
    DeleteSubscriptionsHelper.Execute ( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: republish5105Err006 } );