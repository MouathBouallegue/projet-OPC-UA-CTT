/*  Test 5.10.2 Test case 1 prepared by Development, compliance@opcfoundation.org
    Description: Modifies a subsription using the default parameter values. */

function modifySubscription5102001() {
    const NUMWRITES = 3;
    var subscription = new Subscription();
    var i;
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        // register the subscription with Publish.
        PublishHelper.RegisterSubscription( subscription );

        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // call Publish(), as we want to consume the initial data values 
            PublishHelper.ClearServerNotifications();
            PublishHelper.Clear();

            // modify subscription
            subscription.SetParameters( 2000, true, 30, 10, 0, 0 );
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription } );

            if( subscription.RevisedPublishingInterval == 2000 ) {
                // now to use the Publishing() service to check that the
                // publishing interval has changed            
                var startTime = UaDateTime.utcNow();
                for( i=0; i<NUMWRITES; i++ ) {
                    UaVariant.Increment( { Item: WritableDefaultStaticItem, Offset: i } );
                    WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem } );
                    PublishHelper.WaitInterval( { Items: WritableDefaultStaticItem, Subscription: subscription } );
                    PublishHelper.Execute( { NoAcks: true } );
                }// while
                var stopTime = UaDateTime.utcNow();
                var mdifference = startTime.msecsTo( stopTime );
                addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + mdifference + " milliseconds." );
                Assert.InRange( 5700, 7300, mdifference, "Expected total duration over 3 publishing intervale of 6000 ms (average publishing interval 2000) but actual total was " + mdifference + " (publish interval average was " + Math.floor( mdifference / NUMWRITES ) + ")" );
                Assert.Equal( NUMWRITES, PublishHelper.ReceivedDataChanges.length, "Expected " + ( 1 + NUMWRITES ) + " callbacks." );
            }
            else {
                addSkipped( "The server revised the PublishingInterval to an unexpected value (Requested: 2000, Revised: " + subscription.RevisedPublishingInterval + "). Aborting test case." );
            }
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: WritableDefaultStaticItem, SubscriptionId: subscription } );
    }
    // unregister the subscription with Publish 
    PublishHelper.UnregisterSubscription( subscription );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    PublishHelper.Clear();
    return( true );
}// function modifySubscription5102001() 

Test.Execute( { Debug: true, Procedure: modifySubscription5102001 } );