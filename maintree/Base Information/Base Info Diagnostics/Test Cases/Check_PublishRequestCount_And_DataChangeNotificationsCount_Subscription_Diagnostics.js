/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the PublishRequestCount and DataChangeNotificationsCount diagnostic properties for the subscription */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 3, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No (writable) static items configured to test with. Skipping test." ); return( false ); }
    ReadHelper.Execute( { NodesToRead: items } ); // get the initial values
    for (var i = 0; i < items.length; i++) items[i].OriginalValue = items[i].Value.Value.clone();
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
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "PublishRequestCount" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "DataChangeNotificationsCount" ] } ),
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            // record the baseline values:
                            for( var i=0; i<diagnosticPropertyItems.length; i++ ) diagnosticPropertyItems[i].BaselineValue = diagnosticPropertyItems[i].Value.Value.clone();

                            // now for the test part...
                            // we're going into a loop of 3
                            // we're going to write new values to our items and then call publish
                            // we're going to check the diagnostic property values on each iteration
                            for( var t=0; t<3; t++ ) { // t = test
                                for( var i=0; i<items.length; i++ ) UaVariant.Increment( { Item: items[i] } ); // increment the value 
                                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } ); // write the new values to the server 
                                PublishHelper.WaitInterval( { Subscription: subscription, Items: diagnosticPropertyItems } ); // wait, then publish
                                PublishHelper.Execute();
                                Assert.True( PublishHelper.CurrentlyContainsData(), "Publish expected to return the values that we wrote in the previous call." );

                                // now to check the diagnostics have incremented
                                if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {
                                    var errmsg = " did not increment as expected, even though we have invoked Write and Publish calls.";
                                    Assert.Equal( 1 + diagnosticPropertyItems[0].BaselineValue.toUInt32(), diagnosticPropertyItems[0].Value.Value.toUInt32(), "PublishRequestCount" + errmsg );
                                    Assert.Equal( ( WriteHelper.Request.NodesToWrite.length * ( 1 + t ) ) + diagnosticPropertyItems[1].BaselineValue.toUInt32(), diagnosticPropertyItems[1].Value.Value.toUInt32(), "DataChangeNotificationsCount" + errmsg );

                                    // increment the baseline to make the next iteration/calculation easier...
                                    diagnosticPropertyItems[0].BaselineValue = diagnosticPropertyItems[0].Value.Value.clone();
                                }//read

                            }//for i...

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }// browse the subscription id diagnostic

    }// create monitored items
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );

    for (var i = 0; i < items.length; i++) items[i].Value.Value = items[i].OriginalValue;
    WriteHelper.Execute({ NodesToWrite: items, SkipReadVerification: true });

    return( true );
} } );