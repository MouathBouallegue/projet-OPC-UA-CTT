/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description:
        Create a secure channel.
*/

function tcp256sha256001() {
        // Connect to the server
    var g_channel = new UaChannel();
    Test.Session.Session = new UaSession( g_channel );

    Test.Session.Session.DefaultTimeoutHint = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ) );
    if( !connect( g_channel, Test.Session.Session, {
            RequestedSecurityPolicyUri: SecurityPolicy.Basic256Sha256,
            MessageSecurityMode: MessageSecurityMode.SignAndEncrypt } ) ) {
        stopCurrentUnit();
        return( false );
    }

    if( !activateSession( Test.Session.Session ) ) {
        stopCurrentUnit();
        return( false );
    }

    disconnect( g_channel, Test.Session.Session );
}

safelyInvoke( tcp256sha256001 );