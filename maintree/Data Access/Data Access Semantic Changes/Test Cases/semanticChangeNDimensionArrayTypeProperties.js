/*  Test prepared by compliance@opcfoundation.org
    Description: Subscribe to NDimensionArrayItemType and change property values */

function semanticChanges017() {
    // make sure we have the necessary items configured for testing
    var result = true;
    var items = MonitoredItem.fromSettings( [ "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/NDimensionArrayItemType" ] );
    if( !isDefined( items ) || items.length == 0 ) {
        addSkipped( "NDimensionArrayItemType is not configured in /Server Test/NodeIds/Static/DA Profile/ArrayItemType/NDimensionArrayItemType. Please configure if supported." );
        return( false );
    }
    // prepare our search for properties attached to our test nodes
    var browsePathsForAllItems = [];
    var propertyNames = [ "InstrumentRange", "EURange", "EngineeringUnits", "Title", "AxisDefinition" ]; // array of property names we're going to search for
    var expectedResults = [];
    for( var i=0; i<items.length; i++ ) {                                                                // iterate thru all items
        for( var p=0; p<propertyNames.length; p++ ) {                                                          // iterate thru all property names
            browsePathsForAllItems.push( UaBrowsePath.New( { 
                    StartingNode: items[i],
                    RelativePathStrings: [ propertyNames[p] ] } ) );
            expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) );
        }
    }//for i...
    // STEP 1: Identify properties we can use for each of our analog items
    if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: browsePathsForAllItems, OperationResults: expectedResults } ) ) {

        // iterate thru the results to find the nodes that we can work with
        var propertyNodes = [];
        var analogNodes = [];
        for( var i=0; i<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; i++ ) {
        var thisResult = TranslateBrowsePathsToNodeIdsHelper.Response.Results[i];                          // get *this* result to a variable for easier access
            if( thisResult.StatusCode.isGood() ) {                                                         // we only care about GOOD results
                if( thisResult.Targets.length > 0 ) {                                                      // we only care if results were found
                    for( var t=0; t<thisResult.Targets.length; t++ ) {                                     // iterate thru all targets; we only want the first
                        if( thisResult.Targets[t].TargetId.ServerIndex === 0 ) {                                    // node is in *this* server?
                            propertyNodes.push( MonitoredItem.fromNodeIds( [ thisResult.Targets[t].TargetId.NodeId ] )[0] );    // use this target to test with
                        }//in this server?
                    }//for t...
                    analogNodes.push( MonitoredItem.fromNodeIds( [TranslateBrowsePathsToNodeIdsHelper.Request.BrowsePaths[i].StartingNode] )[0] );// save the analog node for monitoring
                }//targets > 0?
            }//is good?
            else if( thisResult.StatusCode.StatusCode == StatusCode.BadNoMatch ) { // if mandatory property is missing
                if( propertyNames[ i % propertyNames.length ] != "InstrumentRange" ) { // excluding optional property 'InstrumentRange'
                    addWarning( "Mandatory property '" + propertyNames[ i % propertyNames.length ] + "' missing in configured node '" + browsePathsForAllItems[i].StartingNode + "'");
                }
            }
        }//for i...
        
        if( propertyNodes.length == 0 ) {
            addSkipped( "No matching property nodes found. Aborting test." );
            return( false );
        }

        // STEP 2: read the initial value of all properties
        if( ReadHelper.Execute( { NodesToRead: propertyNodes } ) ) {                   // read all of our properties
            for( var i=0; i<propertyNodes.length; i++ ) {                              // iterate thru all items
                propertyNodes[i].OriginalValue = propertyNodes[i].Value.Value.clone(); // clone the value so we can revert back to it later
            }//for i..

            // STEP 3: add these monitored items to our default subscription; we'll check the notification for semantic changes
            if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: analogNodes, SubscriptionId: defaultSubscription } ) ) {
                PublishHelper.RegisterSubscription( defaultSubscription );
                PublishHelper.WaitInterval( { Items: analogNodes, Subscription: defaultSubscription } );
                PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true } );
                if( !PublishHelper.CurrentlyContainsData() ) {
                    addSkipped( "Expected to receive initial data for the MonitoredItems. Abort test." );
                    result = false;
                }
                else {
                    // STEP 4: Change the value for all of our properties
                    expectedResults = [];
                    for( var i=0; i<propertyNodes.length; i++ ) {                           // iterate thru all nodes
                        if( propertyNodes[i].Value.Value.ArrayType !== 0 ) {
                            var extObjArray = propertyNodes[i].Value.Value.toExtensionObjectArray();
                            var extObj = extObjArray[0];
                        }
                        else {
                            extObj = propertyNodes[i].Value.Value.toExtensionObject();      // convert the value to an extension object
                        }
                        if( extObj !== null ) {
                            if( extObj.TypeId.NodeId.equals(new UaNodeId( Identifier.Range ) ) || extObj.TypeId.NodeId.equals( new UaNodeId( Identifier.Range_Encoding_DefaultBinary ) ) ) { // RANGE
                                var rangeObj = extObj.toRange();                            // convert extensionObject to range object
                                rangeObj.High += -1;                                        // set a new high value
                                rangeObj.Low += 1;                                          // set a new low value 
                                extObj.setRange( rangeObj );                                // re-package the extension object with the new range definition
                                propertyNodes[i].Value.Value.setExtensionObject( extObj );  // set the item's value to the new extension object
                            }
                            else if( extObj.TypeId.NodeId.equals( new UaNodeId( Identifier.EUInformation ) ) || extObj.TypeId.NodeId.equals( new UaNodeId( Identifier.EUInformation_Encoding_DefaultBinary ) ) ) { // EUINFO
                                var euinfoObj = extObj.toEUInformation();                    // cast to euinformation object from extension object
                                euinfoObj.DisplayName.Text = "#CTT#";                        // specify a new display name
                                extObj.setEUInformation( euinfoObj );                        // re-package the extension object with the updated euinformation
                                propertyNodes[i].Value.Value.setExtensionObject( extObj );   // set the item's value to the new extension object
                            }
                            else if( extObj.TypeId.NodeId.equals( new UaNodeId( Identifier.AxisInformation ) ) || extObj.TypeId.NodeId.equals( new UaNodeId( Identifier.AxisInformation_Encoding_DefaultBinary ) ) ) {
                                var axisinfoObj = extObj.toAxisInformation();                // cast to axisInformationType object from extension object
                                axisinfoObj.Title.Text = "$CTT$";                            // change one of the elements
                                extObj.setAxisInformation( axisinfoObj );                    // re-package the extension object with the updated value
                                extObjArray[0] = extObj;
                                propertyNodes[i].Value.Value.setExtensionObjectArray( extObjArray );   // set the item's value to the new extension object

                            }
                        }// extObject is not null
                        else {
                            UaVariant.Increment( { Item: propertyNodes[i] } );
                        }
                        expectedResults.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotWritable, StatusCode.BadNotImplemented, StatusCode.BadNotSupported] ) );
                    }//for i..

                    // STEP 5: Write the new property values 
                    if( WriteHelper.Execute( { NodesToWrite: propertyNodes, OperationResults: expectedResults } ) ) {       // write all new properties to the server
                        for( var i = 0; i < WriteHelper.Response.Results.length; i++ ) {
                            if( WriteHelper.Response.Results[i].isGood() ) break;
                        }
                        if( i < WriteHelper.Response.Results.length ) {

                            // STEP 6: Call Publish, see if we get the semantic-change
                            PublishHelper.WaitInterval( { Items: propertyNodes, Subscription: defaultSubscription } );          // wait, before calling Publish
                            if( PublishHelper.Execute( { GetAllNotifications: true } ) ) {                                      // call Publish; check results if OK...
                                if( !PublishHelper.CurrentlyContainsData() ) PublishHelper.Execute();                           // if Publish is empty; call once more
                                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change." ) ) { // contains data?
                                    for( var i=0; i<PublishHelper.CurrentDataChanges[0].MonitoredItems.length; i++ ) {          // loop thru all received items
                                        Assert.Equal( StatusCode.Good | SEMANTICCHANGE_BIT, PublishHelper.CurrentDataChanges[0].MonitoredItems[i].Value.StatusCode.StatusCode, "Expected the SemanticChanged bit = TRUE because an associated property has changed.", "SemanticChange bit changed as expected."  );
                                    }
                                }// contains data?
                            }
                            else result = false;

                            // CLEAN UP: Revert all property values; don't care if they succeed or fail
                            for( var i=0; i<propertyNodes.length; i++ ) propertyNodes[i].Value.Value = propertyNodes[i].OriginalValue;
                            WriteHelper.Execute( { NodesToWrite: propertyNodes, OperationResults: expectedResults } );
                        } else {
                            addSkipped( "Attempts to write to any of the properties of all nodes failed, which is legal. Skipping test." );
                            result = true;
                        }
                    }//write success?
                    else result = false;
                }
                // clean-up
                DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: analogNodes, SubscriptionId: defaultSubscription } );  // remove the monitored items
            }// create monitored items
            else result = false;

        }// read success
        else result = false;

    } // translate browse path success
    else result = false;
    return( result );
}

Test.Execute( { Procedure: semanticChanges017 } );