/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxNodesPerWrite matches reality */

function test() {
    var result = true;
    // read the value of the setting
    var itemMaxLen = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerWrite ) )[0];
    if( ReadHelper.Execute( { NodesToRead: itemMaxLen,
                               OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } ) ) {
       if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addNotSupported( "MaxNodesPerWrite is not available within the ServerCapabilities object." );
           return( false );
       }
    }
    else return( false );

    var realValue = itemMaxLen.Value.Value.toUInt32();
    if( realValue === 0 ) {
        addError( "MaxNodesPerWrite is set to zero. Specifications Part 5, OperationLimitsType: 'Any operational limits Property that is provided shall have a non zero value.'" );
        return ( false );
    }
    else if( realValue > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxNodesPerWrite is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    // read the initial value of all items; we're gonna write-back the same values we receive (no changes!)
    print(UaDateTime.utcNow() + " | Creating Items for testing.");
    var testItems = MonitoredItem.GetRequiredNodes( { Number: realValue, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.AllSettings, Writable: true, SkipCreateSession: true } );
    if( !isDefined( testItems ) || testItems.length === 0 ){
        addSkipped( "No writable items configured to test with. Skipping test." );
        return( false );  
    }
    if( !ReadHelper.Execute( { NodesToRead: testItems } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return (false);    
    }

    // now to re-fill the testItems with the max # needed by the test
    print(UaDateTime.utcNow() + " | Writing all Items");
    if( !WriteHelper.Execute( { NodesToWrite: testItems, ReadVerification: false, ProhibitSplitting: true } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return (false);    
    }

    // increase the # and expect a 
    if (realValue < MAX_ALLOWED_SIZE) {
        print(UaDateTime.utcNow() + " | Exceeding the number of Items for testing.");
        testItems.push( testItems[0].clone() );
        //MantisId=4378
        if( !WriteHelper.Execute( { NodesToWrite: testItems, ReadVerification: false, ProhibitSplitting: true, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded] ) } ) ) {
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