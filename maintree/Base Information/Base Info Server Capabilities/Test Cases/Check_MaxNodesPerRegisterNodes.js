/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: MaxNodesPerRegisterNodes */

function test() {
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRegisterNodes ) )[0];
    if( ReadHelper.Execute( { NodesToRead: item,
                               OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } ) ) {
       if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addNotSupported( "MaxNodesPerRegisterNodes is not available within the ServerCapabilities object." );
           return( false );
       }
    }
    else return( false );


    var realValue = item.Value.Value.toUInt32();
    if( realValue === 0 ) {
        addError( "MaxNodesPerRegisterNodes is set to zero. Specifications Part 5, OperationLimitsType: 'Any operational limits Property that is provided shall have a non zero value.'" );
        return ( false );
    }
    else if( realValue > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxNodesPerRegisterNodes is set to '" + realValue + "', which is above the max allowed size setting of '" + MAX_ALLOWED_SIZE + "'. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    // setup to register the server node multiple times
    var serverNodes = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) );
    for( var i=0; i < (realValue - 1 ); i++ ) serverNodes.push( serverNodes[0].clone() );

    // registerNodes, should succeed
    if( !RegisterNodesHelper.Execute( { NodesToRegister: serverNodes } ) ) return( false );

    // cleanup
    UnregisterNodesHelper.Execute( { NodesToUnregister: serverNodes } );

    // now to exceed the limit by one, should fail
    if (realValue < MAX_ALLOWED_SIZE) {
        serverNodes.push(serverNodes[0].clone());
        if ( !RegisterNodesHelper.Execute( { NodesToRegister: serverNodes, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded ] ), ProhibitSplitting: true } ) ) {
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

Test.Execute( { Debug: true, Procedure: test } );