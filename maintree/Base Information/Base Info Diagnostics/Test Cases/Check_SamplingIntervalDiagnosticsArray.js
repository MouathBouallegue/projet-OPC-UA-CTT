/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Create monitored items and check the SamplingIntervalDiagnosticsArray */

Test.Execute( { Procedure: function test() {

    // sampling interval diagnostics is OPTIONAL, so skip the test if it is not present
    _samplingIntArrayNode.AttributeId = Attribute.BrowseName;
    if( ReadHelper.Execute( { NodesToRead: _samplingIntArrayNode, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } ) ) {
        if( ReadHelper.Response.Results[0].StatusCode.isBad() ) { 
            notSupported( "SamplingIntervalDiagnosticsArray is not supported." );
            return( true );
        }
    }

    // get some items to monitor and add them to a subscription
    var items = MonitoredItem.GetRequiredNodes( { Number: 3, Settings: Settings.ServerTest.NodeIds.Static.All() } );
    for( var i=0; i<items.length; i++ ) items[i].SamplingInterval = 100 * ( 1 + i ) * 10;
    var subscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: items } ) ) {

        // now to read the sampling interval diags
        _samplingIntArrayNode.BrowseDirection = BrowseDirection.Forward;
        if( BrowseHelper.Execute( { NodesToBrowse: _samplingIntArrayNode } ) ) {

            // check we have some results. We expect at least 1 entry to be the "HasTypeDefinition"
            if( Assert.GreaterThan( 1, BrowseHelper.Response.Results[0].References.length, "Expected SamplingIntervalDiagnosticsArray to contain one or more entries. Expected 'HasTypeDefinition' plus actual SamplingInterval diagnostics entries." ) ) {

                // see if we can find our SamplingIntervals in the list
                for( var s = 0; s < items.length; s++ ) {
                    var siFound = false;
                    for( var i = 0; i < BrowseHelper.Response.Results[0].References.length; i++ ) {
                        if( Number( BrowseHelper.Response.Results[0].References[i].BrowseName.Name ) == items[s].RevisedSamplingInterval ) {
                            siFound = true;
                            print( "Found a match for the SamplingInterval: " + items[s].RevisedSamplingInterval + ": " + BrowseHelper.Response.Results[0].References[i].BrowseName.Name.toString() );
                            break;
                        }
                    }
                    Assert.True( siFound, "Couldn't find SamplingInterval '" + items[s].RevisedSamplingInterval + "' in the SamplingIntervalDiagnosticsArray." );
                }
            }
        }

        // clean-up
        DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    }
    // clean up
    DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscription } );
    return( true );
} } );