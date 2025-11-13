/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxStringLength matches reality */

function test() {
    if( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.String.length < 1 ) {
        addNotSupported( "String NodeId not specified in settings." );
        return( false );
    }
    var result = true;
    // read the value of the setting
    var itemMaxLen = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_MaxStringLength ) )[0];
    var itemString = MonitoredItem.fromSettingsExt( { Settings: ["/Server Test/NodeIds/Static/All Profiles/Scalar/String"], Writable: true, SkipCreateSession: true } )[0];
    if( itemString == undefined || itemString == null ) {
        addSkipped( "String not configured in scalar settings or not writable." );
        return( false );
    }
    if( !ReadHelper.Execute( { NodesToRead: [ itemMaxLen, itemString ], OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ), new ExpectedAndAcceptedResults( [ StatusCode.Good ] ) ] } ) ) return( false );
    if( !ReadHelper.Response.Results[0].StatusCode.isGood() ) {
        addNotSupported( "MaxStringLength not supported." );
        return( false );
    }
    var realValue = itemMaxLen.Value.Value;

    // check the setting and set a bound if necessary
    var stringLen = Number( itemMaxLen.Value.Value );
    if( stringLen == 0 ) {
        addWarning( "MaxStringLength set to 0 (meaning 'no limit'). It should be set to a more realistic value. OperationLimit will be limited to this value." );
        stringLen = MAX_ALLOWED_SIZE;
    }
    else if( stringLen > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxStringLength is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        stringLen = MAX_ALLOWED_SIZE;
    }

    // cache the initial string value so we can revert to it after
    itemString.InitialValue = itemString.Value.Value.clone();

    // now to write a string whose length matches the setting
    itemString.Value.Value.setString( WriteService.GenerateString( { nodeId: itemString.NodeId, maxLength: MAX_ALLOWED_SIZE } ) );
    addLog( "Specified string of length: " + itemString.Value.Value.toString().length );
    if( itemString.Value.Value.toString().length < stringLen ) {
        addSkipped( "The configured string node provides a property that indicates a smaller capability than the MaxStringLength property in the ServerCapabilities. Unable to validate OperationLimit." );
        return ( false );
    }
    if( !WriteHelper.Execute( { NodesToWrite: itemString, ReadVerification: false } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return( false );
    }

    // can we exceed the count?
    if (stringLen != Constants.UInt32_Max && stringLen != MAX_ALLOWED_SIZE ) {
        itemString.Value.Value.setString( WriteService.GenerateString( 1 + stringLen ) );
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

Test.Execute( { Debug: true, Procedure: test } );