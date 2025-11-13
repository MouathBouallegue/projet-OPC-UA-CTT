/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Modify a subscription and check the ModifyCount diagnostic property for the subscription */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 1, Settings: Settings.ServerTest.NodeIds.Static.All() } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No static items configured to test with. Skipping test." ); return( false ); }
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
                //    - ModifyCount
                // Let's use TranslateBrowsePathsToNodeIds for obtaining the above-mentioned properties; they're all MANDATORY
                if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "ModifyCount" ] } )
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            // now to compare our subscription settings:
                            Assert.Equal( 0, diagnosticPropertyItems[0].Value.Value.toUInt32(), "ModifyCount should be zero since the subscription is new and has not changed." );

                            // now to change the publishing interval of the subscription
                            if( ModifySubscriptionHelper.Execute( { SubscriptionId: subscription, RequestedPublishingInterval: subscription.PublishingInterval * 10 } ) ) {

                                // now read the diagnostic and check the value has incremented
                                diagnosticPropertyItems[0].LastValue = diagnosticPropertyItems[0].Value.Value.clone();
                                if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {
                                    Assert.GreaterThan( diagnosticPropertyItems[0].LastValue.toUInt32(), diagnosticPropertyItems[0].Value.Value.toUInt32(), "ModifyCount expected to increment since we changed the publishing interval", "ModifyCount incremented as expected" );
                                }

                            }// modify subscription

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }// browse the subscription id diagnostic

    }// create monitored items
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
} } );