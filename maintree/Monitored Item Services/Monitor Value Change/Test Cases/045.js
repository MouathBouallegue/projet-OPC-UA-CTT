/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org (29-Nov-2012)
    Description: Test the Value attribute with a NaN value. */

function test023() {
    const ERR_NAN_EXPECTED = "KeepAlive received. Expected a DataChange in Publish because NaN is always unique, even \"NaN == NaN\" returns False";
    const ERR_NOT_NAN = "Did not receive NaN; expected NaN.";
    const OK_NAN_RECEIVED = "Publish.Response.NotificationMessage.DataChange.MonitoredItems[0].Value = NaN as expected.";
    
    var items = MonitoredItem.fromSettingsExt( { Settings: ["/Server Test/NodeIds/Static/All Profiles/Scalar/Float", "/Server Test/NodeIds/Static/All Profiles/Scalar/Double"], Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length == 0 ) {
        addSkipped( "No writable float/double items to test with. Please check settings." );
        return( false );
    }
    // read and store the original value include the value data type
    ReadHelper.Execute( { NodesToRead: items } );
    for( var i = 0; i < items.length; i++ ) {
        items[i].OriginalValue = items[i].Value.Value.clone();
    }

    // create a subscription and add the item to it
    var sub = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: sub } ) ) {
        // register the subscription with Publish.
        PublishHelper.RegisterSubscription( sub );
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, SubscriptionId: sub } ) ) { 
            // get the initial Publish and DataChange 
            PublishHelper.WaitInterval( { Items: items[0], Subscription: sub } );
            PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true } );
            // do our test three times
            for( var i=0; i<3; i++ ) {
                for( var s = 0; s < items.length; s++ ) {
                    switch( i ) {
                        case 2:
                            items[s].SafelySetValueTypeKnown( items[s].OriginalValue, items[s].Value.Value.DataType );
                            break;
                        default:
                            items[s].SafelySetValueTypeKnown( NaN, items[s].Value.Value.DataType );
                            break;
                    }
                }
                // write
                if( WriteHelper.Execute( { NodesToWrite: items, ReadVerification: true } ) ) {
                    // call Publish, get a DataChange 
                    PublishHelper.Execute( { GetAllNotifications: true } );
                    switch( i ) {
                        case 0:
                            if( Assert.True( PublishHelper.CurrentlyContainsData(), ERR_NAN_EXPECTED ) ) {
                                for( var t = 0; t < PublishHelper.CurrentDataChanges[0].MonitoredItems.length; t++ ) {
                                    Assert.True( isNaN( PublishHelper.CurrentDataChanges[0].MonitoredItems[t].Value.Value ), ERR_NOT_NAN, OK_NAN_RECEIVED );
                                }
                            }
                            break;
                        case 1:
                            Assert.False( PublishHelper.CurrentlyContainsData(), "Expected not to receive a DataChangeNotification after we wrote NaN a second time." );
                            break;
                        case 2:
                            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Received a KeepAlive. Expected to receive a DataChangeNotification containing the previously written values." ) ) {
                                for( var t = 0; t < items.length; t++ ) {
                                    Assert.True( PublishHelper.LookupDataChange( { Items: items[t], ExpectedValue: items[t].Value.Value } ), "A DataChangeNotification has been received, but it did not contain all recently written values." );
                                }
                            }
                            break;
                    }
                }// if( WriteHelper.Execute
            }// for( var i=0; i<3; i++ ) 
            PublishHelper.Execute(); // ack the last sequence
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: sub } );
        }// if( CreateMonitoredItems.Execute( { ItemsToCreate: items } ) )
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub } );
    }// if( CreateSubscription.Execute( { SubscriptionId: sub } ) )
    return( true );
}// function test023() 

Test.Execute( { Procedure: test023 } );
