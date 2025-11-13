/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the MonitoringQueueOverflowCount diagnostic properties for the subscription */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 3, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No (writable) static items configured to test with. Skipping test." ); return( false ); }
    for( var i=0; i<items.length; i++ ) items[i].QueueSize = 2;
    ReadHelper.Execute( { NodesToRead: items } ); // get the initial values
    var subscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: items } ) ) {

        // get the initial values for the item
        PublishHelper.WaitInterval( { SubscriptionId: subscription, Items: items } );
        PublishHelper.Execute();
        Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values of our items." );
        
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
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "MonitoringQueueOverflowCount" ] } ),
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            // record the baseline value:
                            diagnosticPropertyItems[0].BaselineValue = diagnosticPropertyItems[0].Value.Value.clone();
                            Assert.Equal( 0, diagnosticPropertyItems[0].Value.Value.toUInt32(), "MonitoringQueueOverflowCount should be zero because all monitored items should be active." );

                            // now for the test part...
                            // in a loop, write a value to the item without calling Publish in order to force an overflow.
                            for( var t=0; t<4; t++ ) {
                                for( var i=0; i<items.length; i++ ) UaVariant.Increment( { Item: items[i] } );
                                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                                UaDateTime.CountDown( { ShowCountDown: true, Msecs: 2 * items[0].RevisedSamplingInterval } );
                            }//for t...

                            // now call publish 
                            PublishHelper.Execute();
                            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Publish should contain the data that we have written in the last sequence of steps." ) ) {
                                if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {
                                    Assert.Equal( ( t - items[0].RevisedQueueSize ) * items.length, diagnosticPropertyItems[0].Value.Value.toUInt32(), "MonitoringQueueOverflowCount should have changed because we forced " + items.length + " items to overflow their queue! (" + ( t - items[0].RevisedQueueSize ) + " x " + items.length + " = " + ( t - items[0].RevisedQueueSize ) * items.length + ")" );
                                }
                            }

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }// browse the subscription id diagnostic

    }// create monitored items
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
} } );