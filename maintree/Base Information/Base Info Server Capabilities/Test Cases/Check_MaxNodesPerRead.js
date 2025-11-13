/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxNodesPerRead matches reality */

function test() {
    var result = true;
    // read the value of the setting
    var itemMaxLen = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRead ) )[0];
    if( ReadHelper.Execute( { NodesToRead: itemMaxLen,
                               OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } ) ) {
       if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addNotSupported( "MaxNodesPerRead is not available within the ServerCapabilities object." );
           return( false );
       }
    }
    else return( false );

    var realValue = itemMaxLen.Value.Value.toUInt32();
    if( realValue === 0 ) {
        addError( "MaxNodesPerRead is set to zero. Specifications Part 5, OperationLimitsType: 'Any operational limits Property that is provided shall have a non zero value.'" );
        return ( false );
    }
    else if( realValue > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxNodesPerRead is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    print(UaDateTime.utcNow() + " | Creating Items for testing.");
    var bigReadItems = MonitoredItem.GetRequiredNodes( { Number: realValue, settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.AllSettings } );
    // If no scalar nodes configured, use array of currentTime nodes instead
    if( !isDefined( bigReadItems ) || bigReadItems.length === 0 ){
        addWarning( "No scalar nodes configured. Using array of currentTime nodes instead." );
        bigReadItems = [];
        var currentTimeItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ) )[0];
        for( var i=0; i<realValue; i++ ) bigReadItems.push( currentTimeItem );
    }
    print(UaDateTime.utcNow() + " | Reading all Items.");
    if (!ReadHelper.Execute({ NodesToRead: bigReadItems, ProhibitSplitting: true })) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return( false );
    }

    // increase the # and expect a 
    if (realValue < MAX_ALLOWED_SIZE) {
        print(UaDateTime.utcNow() + " | Exceeding the number of Items for testing.");
        bigReadItems.push( bigReadItems[0].clone() );
        if ( !ReadHelper.Execute( { NodesToRead: bigReadItems, ProhibitSplitting: true, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded ] ) } ) ) {
            // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
            Test.Disconnect();
            Test.Connect();
        }
    }
    else {
        print( "Can't exceed the number of elements as the server supports more than we want to test." );
    }
    print(UaDateTime.utcNow() + " | Done.");
    return( result );
}

Test.Execute( { Procedure: test } );