/*  Test prepared by Nathan Pocock compliance@opcfoundation.org
    Description:
        Create a MonitoredItem where the node is of /derives from type TwoStateDiscrete (DA Profile).
        In a loop: write a value to the Node, call Publish()() and compare the value received to the value written.
    Expectations:
        All service and operation level results are Good.
        The values received in Publish() match the values written, and the quality isGood with a valid timestamp. */

function subscription66006() {
    const NUM_WRITES = 10;
    if( twoStateItems == null || twoStateItems.length == 0 ) {
        addSkipped( TSDT );
        return( false );
    }

    // create array in relation to max monitored items
    var twoStateItemsMaxMon = [];
    var idx = 0;
    if( maxMonitoredItems != 0 ) {
        while( ( twoStateItemsMaxMon.length < maxMonitoredItems ) && ( idx < twoStateItems.length ) ) { twoStateItemsMaxMon.push( twoStateItems[idx] ); idx++; }; }
    else twoStateItemsMaxMon = twoStateItems;


    // read the nodes first, because we'll toggle the values
    if (!ReadHelper.Execute( { NodesToRead: twoStateItemsMaxMon } ) ) return( false );

    // store the initial values
    for( var i=0; i<twoStateItemsMaxMon.length; i++ ) twoStateItemsMaxMon[i].InitialValue = twoStateItemsMaxMon[i].Value.Value.clone();

    // create the subscription
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        //create the monitored items within the subscription
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: twoStateItemsMaxMon, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // get the initial values first, before testing...
            PublishHelper.WaitInterval( { Items: twoStateItems, Subscription: subscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            // here's the loop, write a value; wait; publish; compare
            for( var i=0; i<NUM_WRITES; i++ ) {
                // set the new values
                for( var m=0; m<twoStateItemsMaxMon.length; m++ ) {
                    var newBitVal = !twoStateItemsMaxMon[m].Value.Value.toBoolean();
                    twoStateItemsMaxMon[m].Value.Value.setBoolean( newBitVal );
                    twoStateItemsMaxMon[m].WrittenValue = twoStateItemsMaxMon[m].Value.Value.clone();
                }
                // write
                if( WriteHelper.Execute( { NodesToWrite: twoStateItemsMaxMon } ) ) {
                    // wait
                    PublishHelper.WaitInterval( { Items: twoStateItemsMaxMon, Subscription: subscription } );
                    // publish
                    if( PublishHelper.Execute() ) {
                        // we expect a data change
                        if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected a DataChange!" ) ) {
                            PublishHelper.SetItemValuesFromDataChange( twoStateItemsMaxMon, "v" );
                            // we expect multiple notifications
                            Assert.Equal( twoStateItemsMaxMon.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, ("Expected " + twoStateItemsMaxMon.length + " notifications!") );
                            // we expect to receive the same value we wrote
                            for( var r=0; r<twoStateItemsMaxMon.length; r++ ) {
                                Assert.Equal( twoStateItemsMaxMon[r].Value.Value.toBoolean(), twoStateItemsMaxMon[r].WrittenValue.toBoolean(), "Expected to receive the same value as previously written on Node '" + twoStateItemsMaxMon[r].NodeSetting + "'" );
                            }
                        }
                    }// publish
                }// write
                else {
                    break;
                }
            }// for i...
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: twoStateItemsMaxMon, SubscriptionId: subscription } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    PublishHelper.Clear();
    // revert the nodes back to their original values
    print( "\n\n\nReverting to original values." );
    for( var i=0; i<twoStateItemsMaxMon.length; i++ ) twoStateItemsMaxMon[i].Value.Value = twoStateItemsMaxMon[i].InitialValue.clone();
    WriteHelper.Execute( { NodesToWrite: twoStateItemsMaxMon } );
    return( true );
}

Test.Execute( { Procedure: subscription66006 } );