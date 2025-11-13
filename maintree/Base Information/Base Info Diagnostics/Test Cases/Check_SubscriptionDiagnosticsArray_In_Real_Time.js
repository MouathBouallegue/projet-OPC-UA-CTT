/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: A series of steps to test the diagnostics reflect the true status of a subscription.
                 A mistake in the definition of the test-case resulted in separate test-cases being created instead of individual steps */

Test.Execute( { Procedure: function test() {
    // create our items and add to a subscription (test case #6)
    var items = MonitoredItem.GetRequiredNodes( { Number: 1, Settings: Settings.ServerTest.NodeIds.Static.All() } );
    if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No static items configured to test with. Skipping test." ); return( false ); }
    var subscription = new Subscription2( { MaxNotificationsPerPublish: 5 } );
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: items } ) ) {

        // read the SubscriptionDiagnosticsArray (test case #7)
        _subDiagsArrayNode.BrowseDirection = BrowseDirection.Forward;
        _subDiagsArrayNode.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
        if( BrowseHelper.Execute( { NodesToBrowse: _subDiagsArrayNode } ) ) {
            subscription.FoundInDiags = false;     // set this flag in our subscription so we can track if it is found in diags or not
            subscription.DiagnosticsNodeId = null; // flag to store the nodeid of the diagnostics property for this subscription
            // find our subscription in the list; here's how we're going to do this:
            // 1. get the NodeId of the reference
            // 2. invoke a READ of all Diagnostics nodeids.
            var subscriptionIdProperties = [];
            // step 1
            for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ){
                if(BrowseHelper.Response.Results[0].References[i].NodeId.NodeId.NamespaceIndex != 0) {
                    subscriptionIdProperties.push( MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[0].References[i].NodeId.NodeId )[0] );
                }
            }
            // step 2
            if( ReadHelper.Execute( { NodesToRead: subscriptionIdProperties } ) ) {
                for( var i=0; i<subscriptionIdProperties.length; i++ ) {
                    if( subscriptionIdProperties[i].Value.StatusCode.isGood() ) {
                        var diagsObject = subscriptionIdProperties[i].Value.Value.toExtensionObject().toSubscriptionDiagnosticsDataType();
                        if( diagsObject.SubscriptionId == subscription.SubscriptionId ) {
                            subscription.FoundInDiags = true;
                            subscription.DiagnosticsNodeId = subscriptionIdProperties[i].NodeId;
                        }// matching subscriptionId?
                    }// status is good?
                }// for i...
            }// read ok?

            // did we find our subscription?
            if( Assert.True( subscription.FoundInDiags, "Subscription '" + subscription.SubscriptionId + "' not found in diagnostics.", "SubscriptionId '" + subscription.SubscriptionId + "' found in diagnostics." ) ) {

                // now to read the diagnostic information to determine if the configuration matches what the server returned to us when we created the subscription:
                // we will care about:
                //    - PublishingEnabled
                //    - Priority
                //    - MaxNotificationsPerPublish
                //    - PublishingInterval
                //    - LifetimeCount
                //    - MaxKeepAliveCount
                // Let's use TranslateBrowsePathsToNodeIds for obtaining the above-mentioned properties; they're all MANDATORY
                if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "PublishingEnabled" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "Priority" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "MaxNotificationsPerPublish" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "PublishingInterval" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "MaxLifetimeCount" ] } ),
                        UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "MaxKeepAliveCount" ] } )
                        ] } ) ) {
                        // now to extract the results and turn results into items
                        var diagnosticPropertyItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                        if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems } ) ) {

                            var errmsg = " value in Diagnostics does not match the value expected by the Client (CreateSubscription.Response.values).";
                            // now to compare our subscription settings:
                            Assert.Equal( subscription.PublishingEnabled,          diagnosticPropertyItems[0].Value.Value.toBoolean(), "PublishingEnabled" + errmsg );
                            Assert.Equal( subscription.Priority,                   diagnosticPropertyItems[1].Value.Value.toByte(),    "Priority mismatch" + errmsg );
                            Assert.Equal( subscription.MaxNotificationsPerPublish, diagnosticPropertyItems[2].Value.Value.toUInt32(),  "MaxNotificationsPerPublish" + errmsg );
                            Assert.Equal( subscription.RevisedPublishingInterval,  diagnosticPropertyItems[3].Value.Value.toDouble(),  "PublishingInterval" + errmsg );
                            Assert.Equal( subscription.RevisedMaxLifetimeCount,    diagnosticPropertyItems[4].Value.Value.toUInt32(),  "MaxLifetimecount" + errmsg );
                            Assert.Equal( subscription.RevisedMaxKeepAliveCount,   diagnosticPropertyItems[5].Value.Value.toUInt32(),  "MaxKeepAliveCount" + errmsg );


                            // Now to test Publish and the incrementing of the following: (test case 8)
                            //    - PublishRequestCount
                            //    - DataChangeNotificationsCount
                            //    - NotificationsCount
                            //    - UnacknowledgedMessageCount
                            // So let's start by acquiring the node id of the above properties, all of which are MANDATORY
                            if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [
                                    UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "PublishRequestCount" ] } ),
                                    UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "DataChangeNotificationsCount" ] } ),
                                    UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "NotificationsCount" ] } ),
                                    UaBrowsePath.New( { StartingNode: subscription.DiagnosticsNodeId, RelativePathStrings: [ "UnacknowledgedMessageCount" ] } ) ] } ) ) {
                                // now to convert the results into items and then read their values
                                var diagnosticStatsItems = MonitoredItem.FromBrowsePathResults( { BrowsePathResults: TranslateBrowsePathsToNodeIdsHelper.Response.Results } );
                                if( ReadHelper.Execute( { NodesToRead: diagnosticStatsItems } ) ) {
                                    // store the initial values because they should increment momentarily
                                    for( var i=0; i<diagnosticStatsItems.length; i++ ) diagnosticStatsItems[i].InitialValue = diagnosticStatsItems[i].Value.Value.clone();

                                    // invoke a Publish call and then read the properties again
                                    PublishHelper.Execute();

                                    ReadHelper.Execute( { NodesToRead: diagnosticStatsItems } );
                                    // now to make sure all items have increased by 1
                                    errmsg = " did not increment by 1.";
                                    Assert.GreaterThan( diagnosticStatsItems[0].InitialValue.toUInt32(), diagnosticStatsItems[0].Value.Value.toUInt32(), "PublishRequestCount" + errmsg );
                                    Assert.GreaterThan( diagnosticStatsItems[1].InitialValue.toUInt32(), diagnosticStatsItems[1].Value.Value.toUInt32(), "DataChangeNotificationsCount" + errmsg );
                                    Assert.GreaterThan( diagnosticStatsItems[2].InitialValue.toUInt32(), diagnosticStatsItems[2].Value.Value.toUInt32(), "NotificationsCount" + errmsg );
                                    Assert.GreaterThan( diagnosticStatsItems[3].InitialValue.toUInt32(), diagnosticStatsItems[3].Value.Value.toUInt32(), "UnacknowledgedMessageCount" + errmsg );



                                    // Invoke Publish again and then read UnacknowledgedMessageCount (test case 9)
                                    diagnosticStatsItems[3].LastValue = diagnosticStatsItems[3].Value.Value.clone();
                                    PublishHelper.Execute();
                                    if( ReadHelper.Execute( { NodesToRead: diagnosticStatsItems[3] } ) ) {
                                        print( "UnacknowledgedMessageCount:\n\tBefore: " + diagnosticStatsItems[3].LastValue.toUInt32() + "\n\tAfter: " + diagnosticStatsItems[3].Value.Value.toUInt32() );
                                        Assert.LessThan( diagnosticStatsItems[3].LastValue.toUInt32(), diagnosticStatsItems[3].Value.Value.toUInt32(), "UnacknowledgedMessageCount did not decrement by 1." );
                                        Assert.Equal   ( 2, PublishHelper.Response.SequenceNumber, "Publish.Response.SequenceNumber mismatch." );




                                        // Toggle subscription state and read PublishingEnabled property (test case 10)
                                        if( SetPublishingModeHelper.Execute( { SubscriptionIds: subscription, PublishingEnabled: false } ) ) {
                                            // some Servers may change the subscription property when the thread wakes up.. so lets wait...
                                            UaDateTime.CountDown( { Msecs: subscription.RevisedPublishingInterval } );
                                            if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems[0] } ) ) {
                                                Assert.False( diagnosticPropertyItems[0].Value.Value.toBoolean(), "PublishingEnabled diagnostic value should be 'false' since we deactivated the subscription." );
                                                
                                                // toggle and check again
                                                if( SetPublishingModeHelper.Execute( { SubscriptionIds: subscription, PublishingEnabled: true } ) ) {
                                                    UaDateTime.CountDown( { Msecs: subscription.RevisedPublishingInterval } );
                                                    if( ReadHelper.Execute( { NodesToRead: diagnosticPropertyItems[0] } ) ) {
                                                        Assert.True( diagnosticPropertyItems[0].Value.Value.toBoolean(), "PublishingEnabled diagnostic value should be 'true' since we reactivated the subscription." );
                                                    }
                                                }
                                            }
                                        }// set publishing mode = false

                                    }

                                }
                            }

                        }//read the diagnostic properties
                }// translate browse paths...

            }// subscription found in diags?
        }

    }
    DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: items } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
} } );