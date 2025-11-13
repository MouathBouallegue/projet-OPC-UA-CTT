/*  Test prepared by Nathan Pocock compliance@opcfoundation.org
    Description:
        Create multiple MonitoredItems where each node is of /derives from type
        MultiStateDiscrete (DA Profile).
        In a loop: write a value to each Node, call Publish() and compare the
        value received to the value written.
    Expectations:
        All service and operation level results are Good.
        The values received in Publish() match the values written, and the
        quality is Good with a valid timestamp.
*/

function subscription65005() {
    // We need multiple MultiStateDiscrete items for this test. Clone the Item if the server does not support mltiple MultiStateDiscrete items
    var Items = [];
    if( multiStateItems.length < maxMonitoredItems ) {
        for( var a=0; a<maxMonitoredItems; a++ ) Items.push( MonitoredItem.Clone( multiStateItems[0] ) );
    } 
    else Items = multiStateItems;

    // get the enumStrings property for each of our items so that we can use that as a guage to regular our
    // writes so that we do not exceed the bounds
    var browsePaths = [];
    for( var i=0; i<multiStateItems.length; i++ ) browsePaths.push( UaBrowsePath.New( { StartingNode: Items[i], RelativePathStrings: [ "EnumStrings" ] } ) );
    if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: browsePaths } ) ) return( false );
    // make sure all TranslateBrowsePaths are good, and then cache the EnumStrings NodeId into the item object
    var enumStringsNodeIds = [];
    for( var i=0; i<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; i++ ) enumStringsNodeIds.push( MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].Targets[0].TargetId.NodeId )[0] );
    // now to read the EnumStrings values and to cache them into the main item's object...
    if( !ReadHelper.Execute( { NodesToRead: enumStringsNodeIds } ) ) return( false );
    for( var i=0; i<ReadHelper.Response.Results.length; i++ ) Items[i].EnumStrings = ReadHelper.Response.Results[i].Value.toLocalizedTextArray();

    // create the subscription
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {       
        //create the monitored item within the subscription
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: Items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // wait and get the initial publish out of the way...
            PublishHelper.WaitInterval( { Items: Items, Subscription: subscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values for all monitored items." ) ) {
                PublishHelper.SetItemValuesFromDataChange( Items, "v" );
                print( "Checking all items were received..." );
                // set the new values
                for( j=0; j<Items.length; j++ ) UaVariant.Increment( { Item: Items[j], Range: { Low: 0, High: Items[j].EnumStrings.length - 1 } } );
                if( WriteHelper.Execute( { NodesToWrite: Items } ) ) {
                    // wait and call Publish...
                    PublishHelper.WaitInterval( { Items: Items, Subscription: subscription } );
                    PublishHelper.Execute();
                }// write new values
            }//initial value received
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTimeout, StatusCode.BadNoSubscription ] ) } );

    // now validate the publish response: 
    Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive DataChange notifications. Since we changed the state of the MultiStateDiscrete type items." );
    if( Assert.Equal( Items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected Publish.DataChange.MonitoredItems to be receive a value for each monitored item." ) ) {
        var TempCurrentDataChangeNotifications = [];
        for (var o = 0; o < PublishHelper.CurrentDataChanges[0].MonitoredItems.length; o++) TempCurrentDataChangeNotifications.push(PublishHelper.CurrentDataChanges[0].MonitoredItems[o]);
        // we expect to receive the same value we wrote
        print( "Checking all items were received (for the second Publish call)..." );
        for( var i=0; i<Items.length; i++ ) {
            var found = false;
            // we expect the data-type to be a UInteger (according to UA Spec part 8: Table 5.
            Assert.True( IsUInteger( { Value: Items[i].Value.Value } ), "Data Type of .Value attribute should be UInteger, but is: " + BuiltInType.toString( Items[i].Value.Value.DataType ) );
            if (PublishHelper.CurrentlyContainsData()) {
                // within the dataChange, now loop through each monitoredItem
                for (m = 0; m < TempCurrentDataChangeNotifications.length; m++) {
                    if (Items[i].ClientHandle === TempCurrentDataChangeNotifications[m].ClientHandle) {
                        // Now remove the item we just checked
                        TempCurrentDataChangeNotifications.splice(m, 1);
                        found = true;
                    }
                }// loop thru monitoredItems
            }
            Assert.True( found, "Item #" + i + " (ClientHandle: " + Items[i].ClientHandle + ") not found in Publish response." );
        }// for i...
    }// currently contains data

    PublishHelper.Clear();
    return( true );
}// function subscription65005()

Test.Execute( { Procedure: subscription65005, Debug: true } );