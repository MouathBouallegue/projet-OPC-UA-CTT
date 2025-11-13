/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description:
        Create a secure channel.
*/

function tcpaes128sha256rsaoaep001() {
        // Connect to the server
    var g_channel = new UaChannel();
    Test.Session.Session = new UaSession( g_channel );

    Test.Session.Session.DefaultTimeoutHint = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ) );
    if( !connect( g_channel, Test.Session.Session, {
            RequestedSecurityPolicyUri: SecurityPolicy.Aes128Sha256RsaOaep,
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

safelyInvoke( tcpaes128sha256rsaoaep001 );