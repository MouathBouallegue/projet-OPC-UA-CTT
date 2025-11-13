/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create a monitoredItem for each configured numeric array type (int32[], double [] etc.) where the mode is reporting; 
        DeadbandAbsolute of 10; QueueSize=1. Vary the size of the arrays via Write() operations. */


function createMonitoredItem591069() {
    var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.NumericSettings, AttributeId: Attribute.ArrayDimensions, Filter: Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue ), Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length === 0 ) {
        addSkipped( "Array nodes not defined or not writable. Check settings: /Server Test/NodeIds/Static/All Profiles/Arrays." );
        return( false );
    }

    // The ArrayDimensions attribute is optional so we need to be prepared for when it is available, and when unavailable...
    var expectedResults = [];
    for( var i=0; i<items.length; i++ ) expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadAttributeIdInvalid ] ) );

    // first, find those items whose array dimension can change. If none are found then gracefully exit this test
    if( !ReadHelper.Execute( { NodesToRead: items, OperationResults: expectedResults } ) ) return( false );
    for( var i = items.length - 1; i > -1; i-- ) {
        // check quality code first
        if( ReadHelper.Response.Results[i].StatusCode.isBad() ) items.splice( i, 1 );
        else {
            // we are looking for arrays that can be dynamically changed, therefore ArrayDimensions=[0]
            var arrSizeValue = UaVariantToSimpleType( items[i].Value.Value );
            if( !( arrSizeValue.length === 1 && arrSizeValue[0] === 0 ) ) {
                items.splice( i, 1 );
            }
        }
    }//for

    // do we have any items left to test with?
    if( items.length === 0 ) {
        addSkipped( "No array items available whose array dimensions can be changed by the UA Client. Skipping test." );
        return( false );
    }

    // get the initial values of all nodes, we can then increment them by +/-10 per test-case requirements.
    for( var i=0; i<items.length; i++ ) items[i].AttributeId = Attribute.Value;
    ReadHelper.Execute( { NodesToRead: items } );

    // add items to existing subscription
    if( !CreateMonitoredItemsHelper.Execute( { 
                ItemsToCreate: items,
                TimestampsToReturn: TimestampsToReturn.Server,
                SubscriptionId: MonitorBasicSubscription } ) ) return( false );

    // call Publish()() make sure we receive the initial data change
    PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute( { FirstPublish: true } );
    Assert.True( PublishHelper.CurrentlyContainsData(), "Publish() initial data-change expected.", "Publish() received initial data change notifications, as expected." );


    // test #1 - write back all values previously read (no change) but add one more element (increase size of array)
    for( var i=0; i<items.length; i++ ) SafeArray.AddElement( { Value: items[i].Value.Value } );
    WriteHelper.Execute( {
                NodesToWrite: items, 
                ReadVerification: false } );
    PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if( Assert.True( PublishHelper.CurrentlyContainsData(), "Publish() expected a data change notification containing the new array values, although none of the existing values changed, a new element was added!", "Publish() received data change notifications as expected." ) ) {
        Assert.Equal( items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Publish() received a different number of notifications than expected.", "Publish() received the correct number of notifications." );
    }


    // test #2 - write back all values previously read (no change) but remove one more element (decrease size of array)
    ReadHelper.Execute( { NodesToRead: items } );
    for( var i=0; i<items.length; i++ ) SafeArray.RemoveElement( { Value: items[i].Value.Value } );
    WriteHelper.Execute( { 
                NodesToWrite: items,
                ReadVerification: false } );
    PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if( Assert.True( PublishHelper.CurrentlyContainsData(), "Publish() expected a data change notification containing the new array values, although none of the elements changed, one element was deleted!", "Publish() received data change notifications as expected." ) ) {
        Assert.Equal( items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Publish() received a different number of notifications than expected.", "Publish() received the correct number of notifications." );
    }

    // clean-up
    DeleteMonitoredItemsHelper.Execute( { 
                ItemsToDelete: items, 
                SubscriptionId: MonitorBasicSubscription } );
    return( true );
}

Test.Execute( { Procedure: createMonitoredItem591069 } );