/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: MaxNodesPerBrowse */

function test() {
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerBrowse) )[0];
    if( ReadHelper.Execute( { NodesToRead: item,
                               OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } ) ) {
       if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addNotSupported( "MaxNodesPerBrowse is not available within the ServerCapabilities object." );
           return( false );
       }
    }
    else return( false );

    var realValue = item.Value.Value.toUInt32();
    if( realValue === 0 ) {
        addError( "MaxNodesPerBrowse is set to zero. Specifications Part 5, OperationLimitsType: 'Any operational limits Property that is provided shall have a non zero value.'" );
        return ( false );
    }
    else if( realValue > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxNodesPerBrowse is set to '" + realValue + "', which is above the max allowed size setting of '" + MAX_ALLOWED_SIZE + "'. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    // we need to allow for the fact that while multiple nodes can be specified, the server may run-out
    // of continuation points
    var expectedResults = [];
    // we will browse the root node, multiple times
    var rootNodeIds = [];
    for( var i=0; i<realValue; i++ ) {
        expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoContinuationPoints ] ) );
        rootNodeIds.push( new UaNodeId( Identifier.RootFolder ) );
    }
    var rootNodes = MonitoredItem.fromNodeIds( rootNodeIds );
    if(! BrowseHelper.Execute( { NodesToBrowse: rootNodes, MaxReferencesToReturn: 1, OperationResults: expectedResults } ) ) return( false );

    // now to repeat, but to exceed the allowed limits
    if (realValue < MAX_ALLOWED_SIZE) {
        rootNodes.push(rootNodes[0].clone());
        if ( !BrowseHelper.Execute( { NodesToBrowse: rootNodes, MaxReferencesToReturn: 1, ProhibitSplitting: true, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded ] ) } ) ) {
                // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
                Test.Disconnect();
                Test.Connect();
        }
    }
    else {
        print( "Can't exceed the number of elements as the server supports more than we want to test." );
    }
    return( true );
}

Test.Execute( { Procedure: test } );