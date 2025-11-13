/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the republishCount diagnostic property for the subscription */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 1, Settings: Settings.ServerTest.NodeIds.Static.All(), Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No (writable) static items configured to test with. Skipping test." ); return( false ); }
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
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "RepublishRequestCount" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "RepublishMessageRequestCount" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "RepublishMessageCount" ] } )
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            // record the baseline values:
                            for( var i=0; i<diagnosticPropertyItems.length; i++ ) diagnosticPropertyItems[i].BaselineValue = diagnosticPropertyItems[i].Value.Value.clone();

                            // call publish to get the initial values and then write some new values and call publish again, but don't acknowledge
                            PublishHelper.WaitInterval( { Subscription: subscription, Items: diagnosticPropertyItems } );
                            PublishHelper.Execute();
                            Assert.True( PublishHelper.CurrentlyContainsData(), "Expected the initial values in Publish.Response." );

                            // now the write-back...
                            for( var i=0; i<items.length; i++ ) UaVariant.Increment( { Item: items[i] } );
                            if( WriteHelper.Execute( { NodesToWrite: items } ) ) {

                                PublishHelper.WaitInterval( { Subscription: subscription, Items: diagnosticPropertyItems } );
                                PublishHelper.Execute();
                                Assert.True( PublishHelper.CurrentlyContainsData(), "Expected the values (just written) in Publish.Response." );


                                // now to invoke Republish
                                if( RepublishHelper.Execute( { SubscriptionId: subscription, RetransmitSequenceNumber: PublishHelper.Response.NotificationMessage.SequenceNumber } ) ) {

                                    // now read the diagnostics again and then check the values have incremented
                                    var errmsg = " did not increment as expected even though we have successfully called Republish.";
                                    if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {
                                        Assert.GreaterThan( diagnosticPropertyItems[0].BaselineValue.toUInt32(), diagnosticPropertyItems[0].Value.Value.toUInt32(), "RepublishRequestCount" + errmsg );
                                        Assert.GreaterThan( diagnosticPropertyItems[1].BaselineValue.toUInt32(), diagnosticPropertyItems[1].Value.Value.toUInt32(), "RepublishMessageRequestCount" + errmsg );
                                        Assert.GreaterThan( diagnosticPropertyItems[2].BaselineValue.toUInt32(), diagnosticPropertyItems[2].Value.Value.toUInt32(), "RepublishMessageCount" + errmsg );
                                    }//read

                                }//republish

                            }//write

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }// browse the subscription id diagnostic

    }// create monitored items
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
} } );