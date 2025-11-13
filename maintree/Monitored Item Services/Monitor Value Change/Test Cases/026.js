/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script creates a MonitoredItem of type String with IndexRange of “2:3”. */

function createMonitoredItems591053() {
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Scalar/String";

    var item = MonitoredItem.fromSettingsExt( { Settings: [ nodeSetting ], Writable: true, SkipCreateSession: true } )[0];
    if( item === null || item === undefined ) { addSkipped( "String not configured or not writable." ); return( false ); }

    // init the value by writing a String that has a char at the test index
    var initialValue = WriteService.GenerateString( { nodeId: item.NodeId } );
    item.Value.Value.setString( initialValue );
    if( !WriteHelper.Execute( { NodesToWrite: item, ReadVerification: false } ) ) {
        addError( "Exiting test. Unable to set the initial value of the String to: " + item.Value.Value );
        return( false );
    }

    // now add the item to a subscription and call Publish(), the subscription ONLY CARES ABOUT
    // IndexRange "2:3".
    item.IndexRange = "2:3";
    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
        addError( "Exiting test. Couldn't add the monitoredItem to the subscription." );
        return( false );
    }

    // wait one publishing cycle before calling publish
    PublishHelper.WaitInterval( { Items: item, Subscription: MonitorBasicSubscription } );
    if( PublishHelper.Execute() ) {
        PublishHelper.SetItemValuesFromDataChange( [item] );
        // check to see the value received was the 2nd character of the value we initial wrote
        var initialValue2ndCharacter = initialValue.substring( 2, 4 ); //3rd and 4th chr$
        var receivedValue = item.Value.Value.toString();
        Assert.Equal( initialValue2ndCharacter, receivedValue, "Expected the Publish to yield ONLY the values within the specified IndexRange position.", "Publish() returned expected value for IndexRange: '" + item.IndexRange + "'. Expected: '" + initialValue2ndCharacter + "'; Received: '" + receivedValue + "'." );
    }

    // clean-up
    DeleteMonitoredItemsHelper.Execute({ ItemsToDelete: item, SubscriptionId: MonitorBasicSubscription });
    revertOriginalValuesScalarStatic();
    revertOriginalValuesArrayStatic();
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems591053 } );