/*  Test 11; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Secure Channel with Message Encryption: Connect to the Server and then specify a known good username and password (without encryption).
    Expectation: Session established. */

function username011() {
    if( epSecureEncrypt === null ) {
        addSkipped( "A secure channel providing message security is not available." ); 
        return( false ); 
    }
    var result = true;
    Test.Channel.Execute({ RequestedSecurityPolicyUri: epSecureEncrypt.SecurityPolicyUri, MessageSecurityMode: epSecureEncrypt.SecurityMode });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epSecureEncrypt.EndpointUrl })) {
        addError("Can't connect the secure channel to the server, therefore no sessions can be established. Aborting.");
        addError("TIP: Check the UACTT is a trusted application! The certificate is defined in setting: '/Ua Settings/Certificates/ApplicationInstanceCertificates/ctt_appT'.");
        return (false);
    }
    else { CloseSessionHelper.Execute( { Session: Test.Session } ); }
    for( var u=0; u<epSecureEncrypt.UserIdentityTokens.length; u++ ) {
        // we only care about login based authentication in this test
        if( epSecureEncrypt.UserIdentityTokens[u].TokenType === UserTokenType.UserName ) {
            // override the default endpoint (from settings)
            Test.Session = new CreateSessionService( { Channel: Test.Channel } );
            if( Test.Session.Execute( { EndpointUrl: epSecureEncrypt.EndpointUrl } ) ) {
                // we need to look at the endpoint to see if encryption is required, or not
                var tokenRequiresSecurity = epSecureEncrypt.UserIdentityTokens[u].SecurityPolicyUri !== SecurityPolicy.policyToString( SecurityPolicy.None );
                var encryptionAlgorithm = tokenRequiresSecurity ? SecurityPolicy.policyToString( SecurityPolicy.None ) : SecurityPolicy.policyToString( SecurityPolicy.Basic128Rsa15 );

                // prepare our invalid user identity token
                var invalidPolicy = UaUserIdentityToken.FromUserCredentials( { 
                                    Session: Test.Session,
                                    UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName ),
                                    EncryptionAlgorithm: encryptionAlgorithm } );

                // now activate the session using the login credentials from the Settings; we expect this call to FAIL; setup expectations and override parameters
                result = ActivateSessionHelper.Execute( { 
                        Session: Test.Session, 
                        UserIdentityToken: invalidPolicy,
                        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenInvalid ) } );
                // close the session, which actually shouldn't be open
                CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadSessionNotActivated, StatusCode.Good ] ) } );
            }
        }
    }//for u UserIdentityToken
    Test.Disconnect( { SkipCloseSession: true } );
    return( Assert.True( result, "Expected server to reject the session because the UserIdentityToken contains an empty encryptionAlgorithm, which is not valid." ) );
}

Test.Execute( { Procedure: username011 } );