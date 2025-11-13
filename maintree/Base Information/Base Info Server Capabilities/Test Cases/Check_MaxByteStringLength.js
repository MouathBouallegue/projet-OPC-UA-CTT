/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxByteStringLength matches reality */

function test() {
    if( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.ByteString.length < 1 ) {
        addNotSupported( "ByteString variable not configured in CTT settings." );
        return( false );
    }
    var result = true;
    // read the value of the setting
    var itemMaxLen = MonitoredItem.fromNodeIds( new UaNodeId( 12911 ) )[0];
    var itemString = MonitoredItem.fromSettingsExt( { Settings: [ "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString" ], Writable: true, SkipCreateSession: true } )[0];
    if( itemString == undefined || itemString == null ) {
        addSkipped( "ByteString not configured in scalar settings or not writable." );
        return( false );
    }
    
    if( ReadHelper.Execute( { NodesToRead: [ itemMaxLen, itemString ],
                               OperationResults: [
                                   new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ),
                                   new ExpectedAndAcceptedResults( StatusCode.Good ) ] } ) ) {
       if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addNotSupported( "MaxByteStringLength is not available within the ServerCapabilities object." );
           return( false );
       }
    }
    else return( false );

    // check the setting and set a bound if necessary
    var stringLen = itemMaxLen.Value.Value.toUInt32();
    if( stringLen == 0 ) {
        addWarning( "MaxByteStringLength set to 0 (meaning 'no limit'). It should be set to a more realistic value. OperationLimit will be limited to " + MAX_ALLOWED_SIZE + " for testing." );
        stringLen = MAX_ALLOWED_SIZE;
    }
    else if( stringLen > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxByteStringLength is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        stringLen = MAX_ALLOWED_SIZE;
    }

    // cache the initial string value so we can revert to it after
    itemString.InitialValue = itemString.Value.Value.clone();

    // now to write a string whose length matches the setting
    itemString.Value.Value.setByteString( UaByteString.fromStringData( WriteService.GenerateString( stringLen ) ) );
    addLog( "Specified ByteString of length: " + itemString.Value.Value.toString().length );
    if( !WriteHelper.Execute( { NodesToWrite: itemString, ReadVerification: false } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return( false );
    }

    // can we exceed the count?
    if( stringLen != Constants.UInt32_Max && stringLen != MAX_ALLOWED_SIZE ) {
        itemString.Value.Value.setByteString( UaByteString.fromStringData( WriteService.GenerateString( 1 + stringLen ) ) );
        if( !WriteHelper.Execute( { NodesToWrite: itemString, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.BadOutOfRange, StatusCode.BadEncodingLimitsExceeded ] ), ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadEncodingLimitsExceeded ] ), ReadVerification: false } ) ) {
            // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
            Test.Disconnect();
            Test.Connect();
        }
    }
    else {
        print( "Can't exceed the number of elements as the server supports more than we want to test." );
    }

    // revert the original string value 
    itemString.Value.Value = itemString.InitialValue.clone();
    WriteHelper.Execute( { NodesToWrite: itemString, ReadVerification: false } );

    return( result );
}

Test.Execute( { Procedure: test } );