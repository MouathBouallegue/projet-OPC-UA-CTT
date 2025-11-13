/*  Test 2; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Secure Channel with Message Encryption: Connect to the Server and then specify a known good username and password (without encryption).
    Expectation: Session established. */

function username002() {
    if( epSecureEncrypt === null ) {
        addSkipped( "A secure channel providing message security is not available." );
        return( false );
    }
    // establish a secure connection to the server
    Test.Channel.Execute({ RequestedSecurityPolicyUri: epSecureEncrypt.SecurityPolicyUri, MessageSecurityMode: epSecureEncrypt.SecurityMode });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epSecureEncrypt.EndpointUrl })) {
        addError("Can't connect the secure channel to the server, therefore no sessions can be established. Aborting.");
        addError("TIP: Check the UACTT is a trusted application! The certificate is defined in setting: '/Ua Settings/Certificates/ApplicationInstanceCertificates/ctt_appT'.");
        return (false);
    }
    else { CloseSessionHelper.Execute( { Session: Test.Session } ); }
    
    var foundIdentityToken = false;
    var testSuccess = false;
    for( var u=0; u<epSecureEncrypt.UserIdentityTokens.length; u++ ) {
        var strUserToken = UserTokenType.toString( epSecureEncrypt.UserIdentityTokens[u].TokenType );
        if( epSecureEncrypt.UserIdentityTokens[u].TokenType === UserTokenType.UserName ) {
            // skip test case if there is a SecurityPolicy for the IdentityToken defined
            if (epSecureEncrypt.UserIdentityTokens[u].SecurityPolicyUri == SecurityPolicy.policyToString(SecurityPolicy.None)) {
                foundIdentityToken = true;
                break;
            }
        }
    }
    if( foundIdentityToken === false ) {
        addSkipped("The desired endpoint does define a specific SecurityPolicy for the Username Password UserIdentityToken. Therefore we can't run the test on this one.");
        Test.Disconnect( { SkipCloseSession: true } );
        return false;
    }
    else {
            // create a session.
            Test.Session = new CreateSessionService( { Channel: Test.Channel } );
            if( Test.Session.Execute() ) {
                testSuccess = ActivateSessionHelper.Execute( { Session: Test.Session, 
                                                               UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
                                                                       Session: Test.Session,
                                                                       UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName ),
                                                                       EncryptionAlgorithm: null } ) } ); //Part4, Table 186 - UserNameIdentityToken requires the EncryptionAlgorithm being set to null in this scenario.
                CloseSessionHelper.Execute( { Session: Test.Session } );
            }
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( true );
}

Test.Execute( { Procedure: username002 } );