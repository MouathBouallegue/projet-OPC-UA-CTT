/*  Test prepared by Shane Kurr: shane.kurr@opcfoundation.org; 
    Description: Create MonitoredItem of type ByteString, specify IndexRange that would retrieve first 3 bytes of the string*/

function monitorValueChange040() {
    var result = true;
    var item = MonitoredItem.fromSettingsExt( { Settings: ["/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString"], Writable: true, SkipCreateSession: true } )[0];
    if( !isDefined( item ) ) {
        addSkipped( "ByteString item not set or not writable, aborting test" );
        return( false );
    }
    // init the value by writing a String that has a char at the test index
    var initialValue = UaByteString.fromHexString("0x11223344556677889900");
    item.Value.Value.setByteString(initialValue);
    WriteHelper.Execute({ NodesToWrite: item, CheckNotSupported: true });
    // Read item and find expected value with index range
    ReadHelper.Execute( { NodesToRead: item } );
    var rawValue = item.Value.Value.toByteString();
    var rawValue = rawValue.toHexString();
    var expectedValue = rawValue.slice(0,8);
    addLog( "Raw value of item is: " + rawValue );
    addLog( "Expected value with IndexRange is: " + expectedValue );

    // Set Index Range for monitored item 
    indexRange = "0:2";
    item.IndexRange = indexRange;

    // Create the monitored item and then compare the value in Publish matches expectations
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: MonitorBasicSubscription } ) ) {
        //PublishHelper.WaitInterval( { Items: item, Subscription: MonitorBasicSubscription } );
        PublishHelper.Execute( { FirstPublish: true } );
        if( Assert.True( PublishHelper.CurrentlyContainsData(), "Publish() expected to receive the initial value dataChange notification. Testing IndexRange: '" + item.IndexRange + "'." ) ) {
            if( Assert.True( PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode.isGood(), "Publish.Response.NotificationData.DataChangeNotification.MonitoredItems[0].Value.StatusCode is bad; expected Good. Testing IndexRange: '" + item.IndexRange + "'." ) ) {
                // compare value received vs. value expected
                var receivedValue = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toByteString();
            }// if good quality
            else {
                addError( "Error in Publish call" );
                result = false;
            }
        }
        else {
            addError( "Monitored Item not received in Publish Call" );
            result = false;
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: item, SubscriptionId: MonitorBasicSubscription } );
    } 
    else {
        addError( "CreateMonitoredItems failed." );
        return( false );
    }

    // Convert received value and check against expected value
    receivedValue = receivedValue.toHexString();
    if( expectedValue == receivedValue ) {
        addLog( "Received value matches expected value. Received: " + receivedValue + "; Expected: " + expectedValue );
    }
    else{
        addError( "Received value and expected value do not match. Received: " + receivedValue + "; Expected: " + expectedValue );
        result = false;
    }

    return( result );
}

Test.Execute( { Procedure: monitorValueChange040 } );