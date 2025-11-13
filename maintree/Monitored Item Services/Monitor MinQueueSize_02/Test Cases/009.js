/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Modifies a subsription's MaxNotificationsPerPublish to 10 (from 0).
        Tests this by invoking writes/publishes and counting the notifications.
        Difference between this and 26; DiscardOldest=FALSE now. */

Test.Execute( { Procedure: function test() {
    const DISCARDOLDEST = false, FILTER = null, QUEUE = 2, INDEXRANGE = "";
    var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, DiscardOldest: DISCARDOLDEST, Filter: FILTER, Queue: QUEUE, Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length < 6 ) {
        addSkipped( "Not enough static scalar nodes defined; need 5 or more. Aborting." );
        return( false );
    }
    var receivedItems = [];
    var notYetValidatedReceivedItems = [];
    // get the initial values of the nodes
    // we will be writing to them later by incrementing their values, so we need a baseline.
    ReadHelper.Execute( { NodesToRead:items } );

    // store original values and define an starting value for testing
    var originalValues = [];
    for( var i=0; i<items.length; i++ ) {
        originalValues.push( items[i].Value.Value.clone() );
        UaVariant.SetValueMin( { Item: items[i] } );
    }
    WriteHelper.Execute( { NodesToWrite:items, ReadVerification:false } );

    var info = [];
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // wait, and then call Publish() to get the initial dataChange
            PublishHelper.WaitInterval( { Items: items, Subscription: subscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive initial data." ) ) {
                Assert.Equal( items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive " + items.length + " notifications in the initial publish response." );
            }
            else {
                // we didn't receive the notification, so call Publish() again to clear the queue.
                PublishHelper.Execute();
            }

            // modify subscription
            subscription.SetParameters2( { MaxNotificationsPerPublish: items.length } );
            addLog( "Changing the MaxNotificationsPerPublish to: " + subscription.MaxNotificationsPerPublish );
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription } );

            // now write a value to all of the nodes - we will do this 3 times since we want each 
            // monitored item to overflow its buffer/queue 
            for( var w=0; w<3; w++ ) {
                // increment the value for each node
                for( var i=0; i<items.length; i++ ) {
                    UaVariant.Increment( { Item: items[i] } );
                    if( !isDefined( items[i].WrittenValues ) ) items[i].WrittenValues = [];
                    items[i].WrittenValues.push( items[i].Value.Value.clone() );
                }
                info.push( "About to Write: " + MonitoredItem.GetValuesToString( { Items: items } ) );
                // wait the revised sampling interval and then write the new node values
                PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription } );
                WriteHelper.Execute( { NodesToWrite:items, ReadVerification:false } );
            }

            // wait, before calling publish 
            PublishHelper.WaitInterval( { Items: items, Subscription: subscription } );

            // now to call Publish() 3 times
            // publish #1 - we expect a FULL data change with MoreNotifications = true
            PublishHelper.Execute();
            info.push( "Publish(0) to obtain initial data-change notifications." );
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification." ) ) {
                for( var i=0; i<PublishHelper.CurrentDataChanges[0].MonitoredItems.length; i++ ) {
                    receivedItems.push( PublishHelper.CurrentDataChanges[0].MonitoredItems[i].clone() );
                    notYetValidatedReceivedItems.push( PublishHelper.CurrentDataChanges[0].MonitoredItems[i].clone() );
                }
                Assert.Equal( items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive " + items.length + " notifications only." );
                Assert.True( PublishHelper.Response.MoreNotifications, "Expected 'MoreNotifications' to be TRUE since we have previously written more values than the queue size allows (for each monitored item)." );
                info.push( "\tExpected 'MoreNotification=TRUE': " + ( PublishHelper.Response.MoreNotifications? "Correct." : "INCORRECT. Non-compliant server returned 'MoreNotifications=TRUE'." ) );
            }

            // publish #2 through ? the remaining data changes
            var remainingNotifications = ( items.length * 2 ) - items.length;// 2 queues per item
            var i=0;
            do {
                PublishHelper.Execute();
                info.push( "Publish(" + (++i) + ") expecting notifications (" + remainingNotifications + " to remain in Server's queue)" );
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive another dataChange notification (" + remainingNotifications + " notifications remain) to contain more information that couldn't fit into the previous publish response." ) ) {
                    for( var i=0; i<PublishHelper.CurrentDataChanges[0].MonitoredItems.length; i++ ) {
                        receivedItems.push( PublishHelper.CurrentDataChanges[0].MonitoredItems[i].clone() );
                        notYetValidatedReceivedItems.push( PublishHelper.CurrentDataChanges[0].MonitoredItems[i].clone() );
                    }
                    
                    // we need to check that each monitored item is showing that its buffer has overflown: Server may send the data in any order. So lookup the data after both the publish calls
                    var expectedOverflow = 0x80; // bit #7 (8th bit)
                    var lastValueFound = false;
                    for( var i=0; i<items.length; i++ ) {
                        var receivedDataChangesForMonitoredItem = [];
                        for( var j=0; j<notYetValidatedReceivedItems.length; j++ ) {
                            if( items[i].ClientHandle === notYetValidatedReceivedItems[j].ClientHandle ) {
                                // remove the DataChangeNotification from the list so we are not processing it again and decrement the counter
                                receivedDataChangesForMonitoredItem.push( notYetValidatedReceivedItems.splice( j, 1 )[ 0 ] );
                                j--;
                            }
                        }
                        // we should have received 2 samples, if there are more the server didn't honor the settings of the MonitoredItem
                        if ( receivedDataChangesForMonitoredItem.length < 2 ) {
                            addError( items[i].NodeSetting + ": Didn't receive the expected number of DataChangeNotifications (Expected=2 | Received=" + receivedDataChangesForMonitoredItem.length + ") Skipping validation of this MonitoredItem" );
                            continue;
                        }

                        // we trust the SourceTimestamp to sort the Values on a time line. Note: This could fail if the server syncs the time during this test
                        receivedDataChangesForMonitoredItem.sort( function ( itemA, itemB ) { return ( itemB.Value.SourceTimestamp.msecsTo( itemA.Value.SourceTimestamp ) ).toString() } );

                        // run through the list of samples (where there should only be 2) and verify that only the last one has the OverflowBit set
                        for( var j=0; j<receivedDataChangesForMonitoredItem.length-1; j++ ) {
                            if( isDefined( items[i].Value.Value ) ) {
                                if( isDefined( expectedOverflow ) && expectedOverflow === ( receivedDataChangesForMonitoredItem[j].Value.StatusCode.StatusCode & expectedOverflow ) ) {
                                        addError( items[i].NodeSetting + ": OverflowBit was set on the first samples, though DiscardOldest = false. Received StatusCode: " + receivedDataChangesForMonitoredItem[j].Value.StatusCode );
                                    }
                            }
                        }
                        if ( items[i].Value.Value.DataType == BuiltInType.DateTime || receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.Value.DataType == BuiltInType.DateTime ) {
                            lastValueFound = Assert.DateTimeEqual( items[i].Value.Value, receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.Value, true );
                        }
                        // check if the last written value is equal to the last DataChangeNotification
                        else{
                            lastValueFound = Assert.Equal( items[i].Value.Value, receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.Value, true );
                        }
                        if( lastValueFound ){
                            // on the last sample we expect the OverflowBit to be set as defined in the specification
                            if ( isDefined( expectedOverflow ) && expectedOverflow === ( receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.StatusCode.StatusCode & expectedOverflow ) ) {
                                print( items[i].NodeSetting + ": OverflowBit was set (as expected). Received StatusCode: " + receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.StatusCode );
                            }
                            else {
                                addError( items[i].NodeSetting + ": OverflowBit was not set. Received StatusCode: " + receivedDataChangesForMonitoredItem[receivedDataChangesForMonitoredItem.length-1].Value.StatusCode );
                            }
                        }
                        else {
                            // print an error in case we didn't find the latest value in the DataChangeNotifications. If we found it, then print an error if the OverflowBit is not set.
                            addError( items[i].NodeSetting + ": Unable to find the last written value in the PublishResponses: " + items[i].Value.Value );
                        }
                    }
            
                    // how many items do we expect to receive?
                    var expectedNotificationsThisTime = ( remainingNotifications >= subscription.MaxNotificationsPerPublish )? subscription.MaxNotificationsPerPublish : remainingNotifications;
                    info.push( "\tReceived " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length + " notifications; expected: " + expectedNotificationsThisTime );
                    Assert.Equal( expectedNotificationsThisTime, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive " + expectedNotificationsThisTime + " notifications only." );
                    // more notifications?
                    remainingNotifications -= PublishHelper.CurrentDataChanges[0].MonitoredItems.length;
                    info.push( "\tExpecting " + remainingNotifications + " notifications to remain in the Server`s queue." );
                    if( remainingNotifications > 0 ) {
                        info.push( "\tExpected 'MoreNotifications=TRUE': " + ( PublishHelper.Response.MoreNotifications? "Correct." : "INCORRECT. Non-compliant server returned 'MoreNotifications=TRUE'." ) );
                        Assert.True( PublishHelper.Response.MoreNotifications, "Expected 'MoreNotifications' to be TRUE since we have not yet received all expected notifications." );
                    }
                    else {
                        info.push( "\tExpected 'MoreNotifications=FALSE: " + ( PublishHelper.Response.MoreNotifications? "INCORRECT. Non-compliant server returned 'MoreNotifications=TRUE'." : "Correct." ) );
                        Assert.False( PublishHelper.Response.MoreNotifications, "Expected 'MoreNotifications' to be FALSE since there shouldn't be any more notifications." );
                    }
                }
                else {
                    break;
                }
            }
            while( remainingNotifications > 0 )


            // publish #3 - keep alive
            PublishHelper.Execute();
            info.push( "Publish(last) expecting a keepAlive only... KeepAlive: " + ( PublishHelper.CurrentlyContainsData() ? "No, has data!!?" : "Yes, no data received!" ) );
            Assert.False( PublishHelper.CurrentlyContainsData(), "Last Publish() call: Expected to receive a KeepAlive only as all notifications should have been previously received." );


            // check only the expected values were received (first values are filtered)
            for( var i=0; i<items.length; i++ ) {
                var found = false;
                for( var v=0; v<receivedItems.length; v++ ) {
                    var temp = items[i].clone();
                    UaVariant.SetValueMin( { Item: temp } )
                    // verify that the expected value was discarded according to the policy
                    if ( receivedItems[v].ClientHandle == items[i].ClientHandle ) {
                        // this check can only be executed if the initial Value is not equal to the to be discarded value
                        if ( items[i].Value.Value.DataType == BuiltInType.DateTime || receivedItems[v].Value.Value.DataType == BuiltInType.DateTime ) {
                            Assert.False(Assert.DateTimeEqual( items[i].WrittenValues[1], receivedItems[v].Value.Value, true ), "The SECOND value written (" + items[i].WrittenValues[0] + ") for NodeId '" + items[i].NodeId + "' (Setting: '" + items[i].NodeSetting + "') was received in a DataChange. DiscardOldest=FALSE is not compliant. The SECOND value should have been deleted leaving the first value and the latest value in the queue.");
                        }
                        else if ( !( items[i].WrittenValues[1].equals( temp.Value.Value))) {
                            Assert.NotEqual( items[i].WrittenValues[1].toString(), receivedItems[v].Value.Value.toString(), "The SECOND value written (" + items[i].WrittenValues[0] + ") for NodeId '" + items[i].NodeId + "' (Setting: '" + items[i].NodeSetting + "') was received in a DataChange. DiscardOldest=FALSE is not compliant. The SECOND value should have been deleted leaving the first value and the latest value in the queue." );
                        }
                        found = true;
                        break;
                    }
                }//for v
                if( !found ) addError( "Item not received in any DataChanges: '" + items[i].NodeId + "' Handle: " + items[i].ClientHandle + " (Setting '" + items[i].NodeSetting + "') to make sure first written value was purged from the queue and therefore NOT received in DataChange." );
            }// for i
        }
    }

    // delete the subscription we added here 
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );

    // restore original values
    for( var i=0; i<items.length; i++ ) {
        items[i].Value.Value = originalValues[i].clone();
    }
    WriteHelper.Execute( { NodesToWrite:items, ReadVerification:false } );

    // display messages
    print( "----< REPORT >----" );
    for( var i=0; i<info.length; i++ ) print( info[i] );
    return( true );
} } );