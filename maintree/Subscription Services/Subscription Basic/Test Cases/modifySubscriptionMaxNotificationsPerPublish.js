/*  Test 5.10.2 Test case 24 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Modifies a subsription's MaxNotificationsPerPublish to 1. */

function modifySubscription5102024() {
    
    if ( !isDefined( WritableSubscriptionMonitoredItems ) || WritableSubscriptionMonitoredItems.length < 2 ) { addSkipped( "Not enough writable static scalar nodes defined; need 2 or more. Aborting." ); return( false ); }
    ReadHelper.Execute( { NodesToRead:WritableSubscriptionMonitoredItems } );
    
    var itemIds = new IntegerSet();
    var SubsetSubscriptionMonitoredItems = [];
    // now write a value to all of the nodes 
    for( var i=0; i<WritableSubscriptionMonitoredItems.length && i < 100; i++ ) {
        SubsetSubscriptionMonitoredItems.push(WritableSubscriptionMonitoredItems[i]);
        UaVariant.Increment( { Item: SubsetSubscriptionMonitoredItems[i] } );
        itemIds.insert( SubsetSubscriptionMonitoredItems[i].ClientHandle );
    }//for i

    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: SubsetSubscriptionMonitoredItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // call Publish() to get the initial dataChange
            PublishHelper.WaitInterval( { Items: WritableSubscriptionMonitoredItems, Subscription: subscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive initial data." ) ) {
                var TotalNumberOfDataChanges = PublishHelper.CurrentDataChanges[0].MonitoredItems.length;
                while( PublishHelper.Response.MoreNotifications == true ) {
                    PublishHelper.Execute();
                    TotalNumberOfDataChanges += PublishHelper.CurrentDataChanges[0].MonitoredItems.length;
                }
                Assert.Equal( SubsetSubscriptionMonitoredItems.length, TotalNumberOfDataChanges, "Expected to receive " + SubsetSubscriptionMonitoredItems.length + " notifications in the initial publish response." );
            }

            // modify subscription
            subscription.SetParameters2( { MaxNotificationsPerPublish:1 } );
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription } );

            
            WriteHelper.Execute( { NodesToWrite:SubsetSubscriptionMonitoredItems, ReadVerification:false } );

            // now to call Publish(); many calls should be needed 
            for( var i=0; i<SubsetSubscriptionMonitoredItems.length; i++ ) {
                PublishHelper.Execute();
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification. Publish call #" + i + " of " + SubsetSubscriptionMonitoredItems.length ) ) {
                    Assert.Equal( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive ONE notification only. Publish call #" + i + " of " + SubsetSubscriptionMonitoredItems.length  );
                    itemIds.remove( PublishHelper.CurrentDataChanges[0].MonitoredItems[0].ClientHandle );
                    var expectMoreNotifications = itemIds.size() > 0;
                    Assert.Equal( expectMoreNotifications, PublishHelper.Response.MoreNotifications, "Publish().Response.MoreNotifications in error. More notifications " + ( expectMoreNotifications? "expected because notifications should remain on the Server. Publish call #" + i + " of " + SubsetSubscriptionMonitoredItems.length : "not expected." ) );
                }
                else {
                    addError( "Aborting test since Publish didn't yield the expected results. More Publish calls are unnecessary at this point." );
                    break;
                }
            }//for i

            // we should have received all items by now; (a) check our array; (b) expect publish KeepAlive
            if( !Assert.Equal( 0, itemIds.size(), "Expected all items to have been received in prior Publish() calls." ) ) {
                result = false;
                // now to show which items were not received
                var msg = "";
                for( var o=0; o<itemIds.size(); o++ ) { // o = outer
                    if( SubsetSubscriptionMonitoredItems[o].ClientHandle === itemIds.atIndex(o) ) {
                            msg += "\n\t" + SubsetSubscriptionMonitoredItems[i].NodeSetting;
                            break;
                    }// found match?
                    for( var i=0; i<SubsetSubscriptionMonitoredItems.length; i++ ) { // i = inner
                        if( SubsetSubscriptionMonitoredItems[i].ClientHandle === itemIds.atIndex(o) ) {
                            msg += "\n\t" + SubsetSubscriptionMonitoredItems[i].NodeSetting;
                            break;
                        }// found match?
                    }//for i...
                }//for o...
                if( msg.length > 0 ) addError( "Items not received in Publish: " + msg );
            }
            PublishHelper.Execute();
            Assert.False( PublishHelper.CurrentlyContainsData(), "Expected to receive a KeepAlive only as all notifications should have been previously received." );
        }
    }
    // delete the subscription we added here 
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: modifySubscription5102024 } );