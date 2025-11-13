/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MinimumSampleRate matches reality */

function test() {
    // read the value of the setting
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_MinSupportedSampleRate ) )[0];
    var monitoredItem = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.All() );
    if( !ReadHelper.Execute( { NodesToRead: item } ) ) return( false );
    var realValue = item.Value.Value.clone();
    // MantisId=6487: only nodes without the optional MinimumSamplingInterval attribute can be used for this test case
    for( var i = 0; i < monitoredItem.length; i++ ) {
        monitoredItem[i].AttributeId = Attribute.MinimumSamplingInterval;
        ReadHelper.Execute( { NodesToRead: monitoredItem[i], OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadAttributeIdInvalid] ) } );
        monitoredItem[i].AttributeId = Attribute.Value;
        if( ReadHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.BadAttributeIdInvalid ) break;
    }
    if( i == monitoredItem.length ) {
        addSkipped( "No node configured that can be used for this test case. A node without the MinimumSamplingInterval attribute set is required." );
        return ( false );
    }
    else {
        monitoredItem = monitoredItem[i];
    }
    // create a subscription
    var sub = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: sub } ) ) return( false );
    // now to compare a sampling interval to what is specified
    monitoredItem.SamplingInterval = 0;
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: monitoredItem, SubscriptionId: sub } ) ) {
        if( realValue.toDouble() !== CreateMonitoredItemsHelper.Response.Results[0].RevisedSamplingInterval ) addWarning( "Expected the revised Sampling Interval (" + CreateMonitoredItemsHelper.Response.Results[0].RevisedSamplingInterval + ") to match the Server.ServerCapabilities.MinSupportedSampleRate=" + realValue );
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItem, SubscriptionId: sub } );
    }
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub } );
    return( true );
}

Test.Execute( { Procedure: test } );