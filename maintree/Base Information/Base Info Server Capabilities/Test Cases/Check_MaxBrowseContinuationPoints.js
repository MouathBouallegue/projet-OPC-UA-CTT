/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxBrowseContinuationPoints matches reality */

function test() {
    // read the value of the setting
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_MaxBrowseContinuationPoints ) )[0];
    if( !ReadHelper.Execute( { NodesToRead: item } ) ) return( false );
    var realValue = item.Value.Value.clone();
    // don't run the test if the value is zero
    if( realValue.toUInt16() == 0 ) {
        addWarning( "MaxBrowseContinuationPoints is set to zero, which means unlimited. Please verify if this is accurate. OperationLimit will be limited to " + MAX_ALLOWED_SIZE + " for testing." );
        realValue = MAX_ALLOWED_SIZE;
    }
    else if( realValue.toUInt16() > MAX_ALLOWED_SIZE ) {
        addWarning("MaxBrowseContinuationPoints is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }
    print( "MaxBrowseContinuationPoints advertized as: " + realValue );

    // ensure that MaxBrowseContinuationPoints is not equal to the MaxNodesPerBrowse
    var MaxNodesPerBrowseItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerBrowse ) )[0];
    var MaxNodesPerBrowseValue;
    if( ReadHelper.Execute( {
        NodesToRead: MaxNodesPerBrowseItem,
        OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown] )
    } ) ) {
        MaxNodesPerBrowseValue = MaxNodesPerBrowseItem.Value.Value.toUInt32();
    }
    else {
        MaxNodesPerBrowseValue = Constants.UInt32_Max;
    }
    if( MaxNodesPerBrowseValue > realValue || MaxNodesPerBrowseValue == 0 ) {
        // step 1: in a single Browse call, consume all available continuation points by browsing the root node and asking for 1-node only
        var browseItems = [];
        for( var i = 0; i < realValue; i++ ) browseItems.push( MonitoredItem.fromNodeIds( new UaNodeId( Identifier.RootFolder ) )[0] );
        if( !BrowseHelper.Execute( { NodesToBrowse: browseItems, MaxReferencesToReturn: 1 } ) ) return ( false );
        // now to release all continuationPoints
        BrowseNextHelper.Execute( { ContinuationPoints: BrowseHelper.Response.Results, ReleaseContinuationPoints: true } );

        // step 2: exceed and expect one to fail; we don't know WHICH item will fail
        if( realValue < MAX_ALLOWED_SIZE ) {
            browseItems.push( MonitoredItem.fromNodeIds( new UaNodeId( Identifier.RootFolder ) )[0] );
            var expectedResults = [];
            for( var i = 0; i <= realValue; i++ ) {
                expectedResults.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoContinuationPoints, StatusCode.BadTooManyOperations] ) );
            }
            if( BrowseHelper.Execute( { NodesToBrowse: browseItems, MaxReferencesToReturn: 1, OperationResults: expectedResults, ProhibitSplitting: true } ) ) {
                // count how many failed, should only be 1
                var count = 0;
                for( var i = 0; i < BrowseHelper.Response.Results.length; i++ ) {
                    if( BrowseHelper.Response.Results[i].StatusCode.StatusCode == StatusCode.BadNoContinuationPoints || BrowseHelper.Response.Results[i].StatusCode.StatusCode == StatusCode.BadTooManyOperations ) count++;
                }//for i...
                Assert.Equal( 1, count, "Expected one browse item to fail. Perhaps the server is re-using older/unused ContinuationPoints? (which is legal)" );
            }// browse
            expectedResults[expectedResults.length - 1] = new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadContinuationPointInvalid] );
            BrowseNextHelper.Execute( { ContinuationPoints: BrowseHelper.Response.Results, ReleaseContinuationPoints: true, OperationResults: expectedResults, ProhibitSplitting: true } );
        }
        else {
            addLog( "Couldn't verify correct StatusCode when exceeding the MaxBrowseContinuationPoints as MaxNodesPerBrowse is smaller than MaxBrowseContinuationPoints." );
        }
    }
    else {
        addSkipped( "Couldn't verify the MaxBrowseContinuationPoints as the MaxNodesPerBrowse is smaller than MaxBrowseContinuationPoints." );
    }
    return( true );
}

Test.Execute( { Procedure: test } );