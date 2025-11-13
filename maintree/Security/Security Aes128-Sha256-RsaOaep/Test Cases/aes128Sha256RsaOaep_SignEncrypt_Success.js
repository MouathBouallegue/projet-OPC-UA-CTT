/*  Test 2; prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description: Call GetEndpoints to identify a secure endpoint to attach that is 256Sha256: 
                     Open a secure channel, use SignAndEncrypt.
                     Create a session using Anonymous if available, otherwise use UserNamePassword.
                     Close the channel immediately.
    Expectation: Connection is successful. */

function aes128sha256rsaoaep256002() {
    // is the global variable "epSecureChNone" null? if so then we can't run
    if( epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available that supports message signing and encryption." );
        return( false );
    }
    if( !Test.Connect( { OpenSecureChannel: { RequestedSecurityPolicyUri: 
                                              SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
                                              MessageSecurityMode: epSecureEncrypt.SecurityMode },
                         SkipActivateSession: true } ) ) {
        addError( "Can't connect the secure channel to the server, therefore no sessions can be established. Aborting." );
        return( false );
    }
    // we now need to create a session, see if we can use Anonymous login, if not then use username
    var overrides = null;
    if( findUsernameInEndpoints( epSecureEncrypt ) ) overrides = UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
    else if( findAnonymousInEndpoints( epSecureEncrypt ) ) overrides = new UserCredentials( { policy: UserTokenType.Anonymous } );
    else addError( "Secure endpoint located, but could not find userIdentityToken (anonymous or usernamePassword) available." );
    // create the session
    if( overrides !== null ) {
        if( ActivateSessionHelper.Execute( { Session: Test.Session, 
                                             UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
                                                     Session: Test.Session,
                                                     UserCredentials: overrides } ) } ) ) {
            Test.Disconnect();
        }
        else Test.Disconnect();
    }
    return( true );
}

Test.Execute({ Procedure: aes128sha256rsaoaep256002 } );