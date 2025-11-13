/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Create monitored items and check the SubscriptionDiagnosticsArray */

Test.Execute( { Procedure: function test() {

    // first, get a baseline for how many subscriptions exist
    _subDiagsArrayNode.BrowseDirection = BrowseDirection.Forward;
    _subDiagsArrayNode.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( !BrowseHelper.Execute( { NodesToBrowse: _subDiagsArrayNode } ) ) return( false );
    var initialSubscriptionCount = BrowseHelper.Response.Results[0].References.length;
    addLog( "Initial subscription count = " + initialSubscriptionCount );
    print( "Diagnostics shows these subscriptions:" );
    for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) print( "\t" + BrowseHelper.Response.Results[0].References[i].BrowseName );

    // get some items to monitor and add them to a subscription
    var items = MonitoredItem.GetRequiredNodes( { Number: 1, Settings: Settings.ServerTest.NodeIds.Static.All() } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No static items configured to test with. Skipping test." ); return( false ); }
    var subscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: items } ) ) {

        // invoke a Publish, to ensure the subscription exists
        PublishHelper.Execute();

        // now to read the subscription diagnostics again
        if( BrowseHelper.Execute( { NodesToBrowse: _subDiagsArrayNode } ) ) {

            // check we have some results. We expect at least 1 entry to be the "HasTypeDefinition"
            Assert.GreaterThan( initialSubscriptionCount, BrowseHelper.Response.Results[0].References.length, "Expected SamplingIntervalDiagnosticsArray to contain one or more entries. Expected 'HasTypeDefinition' plus actual SamplingInterval diagnostics entries." );

            // see if we can find our subscription in the list
            var subFound = false;
            for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) {
                if( subscription.SubscriptionId.toString() == BrowseHelper.Response.Results[0].References[i].BrowseName.Name.toString() ) {
                    subFound = true;
                    break;
                }
            }
            Assert.True( subFound, "Couldn't find SubscriptionId '" + subscription.SubscriptionId + "' in the SubscriptionDiagnosticsArray." );

        }

        // clean-up
        DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    }
    // clean up
    DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscription } );
    return( true );
} } );