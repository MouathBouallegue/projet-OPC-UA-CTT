/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check all configured nodes for ValueAsText; validate accordingly */

Test.Execute( { Debug: true, Procedure: function test() {
    // get a list of ALL configured nodes..
    var allItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.All() );
    // we're going to use TranslateBrowsePaths... to see if the "ValueAsText" property exists
    // but we can't put all requests into a single call as that may be impossible for smaller
    // devices, so we'll break them out into batches of 10
    while( allItems.length > 0 ) {
        var browsePaths = [];
        var operationResults = [];
        for( var i=0; ( i<10 && allItems.length > 0 ); i++ ) {
            browsePaths.push( UaBrowsePath.New( { StartingNode: allItems[0].NodeId, RelativePathStrings: [ "ValueAsText" ] } ) );
            operationResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) );
            allItems.splice( 0, 1 )
        }

        // continue to TranslateBrowsePaths if we have something to actually browse...
        if( browsePaths.length > 0 ) {
            if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: browsePaths, OperationResults: operationResults } ) ) {
                // now to search through our results to find anything that may have succeeded
                for( var r=0; r<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; r++ ) {
                    if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[r].StatusCode.isGood() ) {
                        // we have found a good result, now to add all matches to our '_propertyNodes' array
                        for( var m=0; m<TranslateBrowsePathsToNodeIdsHelper.Response.Results[r].Targets.length; m++ ) { // m=match
                            _propertyNodes.push( TranslateBrowsePathsToNodeIdsHelper.Response.Results[r].Targets[m].TargetId.NodeId );
                            _parentsOfValueAsTextProperty.push( TranslateBrowsePathsToNodeIdsHelper.Request.BrowsePaths[r].StartingNode );
                        }//for m...
                    }
                }//for r...
            }//translate
        }//something to browse?
    }//while

    // did we find any nodes with ValueAsText?
    if( _propertyNodes.length > 0 ) {
        var propertyValues = MonitoredItem.fromNodeIds( _propertyNodes );
        if( ReadHelper.Execute( { NodesToRead: propertyValues } ) ) {

            // now check the results are LocalizedText and NOT empty!
            for( var i=0; i<propertyValues.length; i++ ) {
                Assert.Equal( BuiltInType.LocalizedText, propertyValues[i].Value.Value.DataType, "Type mismatch. Property 'ValueAsText' should be a LocalizedText." );
                Assert.GreaterThan( 0, propertyValues[i].Value.Value.toLocalizedText().Text.length, "'PropertyAsText' should contain a text value that is 1-or-more characters long." );
            }//for i..

        }//read
    }
    else {
        addSkipped( "No nodes with .ValueAsText property found. If your server has them then please make sure they are specified anywhere in the CTT settings." );
        Test.Disconnect();              // disconnect from server 
        Test.PostTestFunctions = [];    // remove post test hooks
        stopCurrentUnit();
    }

    return( true );
} } );
