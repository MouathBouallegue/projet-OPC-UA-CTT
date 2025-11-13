/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description:
        Close an already closed secure channel.
*/

function tcp256sha256002() {
        // Connect to the server
    var g_channel = new UaChannel();
    Test.Session.Session = new UaSession( g_channel );

    Test.Session.Session.DefaultTimeoutHint = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ) );
    if( !connect( g_channel, Test.Session.Session, {
            RequestedSecurityPolicyUri: SecurityPolicy.Basic256Sha256,
            MessageSecurityMode: MessageSecurityMode.SignAndEncrypt 
        } ) ) {
        stopCurrentUnit();
        return( false );
    }

    if( !activateSession( Test.Session.Session ) ) {
        stopCurrentUnit();
        return( false );
    }

    disconnect( g_channel, Test.Session.Session );

    // now to close the already-closed channel
    var expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadSecureChannelIdInvalid, StatusCode.BadInvalidState ] );
    disconnectChannel( g_channel, expectedResults );
}

safelyInvoke( tcp256sha256002 );