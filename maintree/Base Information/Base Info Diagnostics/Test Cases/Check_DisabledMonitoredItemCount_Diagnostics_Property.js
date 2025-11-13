/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the DisabledMonitoredItemCount diagnostic properties for the subscription */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 3, Settings: Settings.ServerTest.NodeIds.Static.All() } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No static items configured to test with. Skipping test." ); return( false ); }
    ReadHelper.Execute( { NodesToRead: items } ); // get the initial values
    var subscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: items } ) ) {

        // read the SubscriptionDiagnosticsArray (test case #7)
        _subDiagsArrayNode.BrowseDirection = BrowseDirection.Forward;
        _subDiagsArrayNode.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
        if( BrowseHelper.Execute( { NodesToBrowse: _subDiagsArrayNode } ) ) {
            subscription.FoundInDiags = false;     // set this flag in our subscription so we can track if it is found in diags or not
            subscription.DiagnosticsNodeId = null; // flag to store the nodeid of the diagnostics property for this subscription
            // find our subscription in the list
            for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) {
                if( subscription.SubscriptionId.toString() == BrowseHelper.Response.Results[0].References[i].BrowseName.Name.toString() ) {
                    subscription.FoundInDiags = true;
                    subscription.DiagnosticsNodeId = BrowseHelper.Response.Results[0].References[i].NodeId.NodeId;
                    break;
                }
            }//for i...
            // did we find our subscription?
            if( Assert.True( subscription.FoundInDiags, "Subscription '" + subscription.SubscriptionId + "' not found in diagnostics.", "SubscriptionId '" + subscription.SubscriptionId + "' found in diagnostics." ) ) {

                // now to read the diagnostic information to determine the number of modifications:
                //    - RepublishRequestCount
                //    - RepublishMessageRequestCount
                //    - RepublishMessageCount
                // Let's use TranslateBrowsePathsToNodeIds for obtaining the above-mentioned properties; they're all MANDATORY
                if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "DisabledMonitoredItemCount" ] } ),
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            // record the baseline value:
                            diagnosticPropertyItems[0].BaselineValue = diagnosticPropertyItems[0].Value.Value.clone();
                            Assert.Equal( 0, diagnosticPropertyItems[0].Value.Value.toUInt32(), "DisabledMonitoredItemCount should be zero because all monitored items should be active." );

                            // now for the test part...
                            // disable the monitored items and then check the property again
                            if( SetMonitoringModeHelper.Execute( { SubscriptionId: subscription, MonitoredItemIds: items, MonitoringMode: MonitoringMode.Disabled } ) ) {
                                // wait because the server might process the request once a thread awakens...
                                PublishHelper.WaitInterval( { Subscription: subscription, Items: diagnosticPropertyItems } ); // wait, then publish
                                // now read the diagnostics value...
                                if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {
                                    Assert.Equal( items.length, diagnosticPropertyItems[0].Value.Value.toUInt32(), "DisabledMonitoredItemCount should NOT be zero because all monitored items should be deactivateed." );
                                }
                            }//modify monitored items

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }// browse the subscription id diagnostic

    }// create monitored items
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
} } );