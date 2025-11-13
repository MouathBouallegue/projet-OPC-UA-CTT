/*  Test 10; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify a valid known username, password, and policyId; but encryptionAlgorithm does not match what the server specified, e.g. ”” or “abc123” etc.
    Expectation: ServiceResult = Bad_IdentityTokenInvalid.
        IMPORTANT: This script uses the Login Name and Password defined in the CTT Settings. */

function username010() {
    // is the global variable "epGeneralTesting" null? if so then we can't run
    if (epGeneralTesting === null ) {
        addSkipped( "An insecure channel is not available." );
        return( false );
    }
    Test.Channel.Execute({ RequestedSecurityPolicyUri: epGeneralTesting.SecurityPolicyUri, MessageSecurityMode: epGeneralTesting.SecurityMode });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epGeneralTesting.EndpointUrl })) {
        addError("Can't connect the secure channel to the server, therefore no sessions can be established. Aborting.");
        addError("TIP: Check the UACTT is a trusted application! The certificate is defined in setting: '/Ua Settings/Certificates/ApplicationInstanceCertificates/ctt_appT'.");
        return (false);
    }
    else { CloseSessionHelper.Execute( { Session: Test.Session } ); }
    var result = true;
    
    // loop thru all UserIdentityTokens defined for this endpoint
    for (var u = 0; u < epGeneralTesting.UserIdentityTokens.length; u++ ) {
        // we only care about login based authentication in this test
        if (epGeneralTesting.UserIdentityTokens[u].TokenType === UserTokenType.UserName ) {
            // create a session.
            Test.Session = new CreateSessionService( { Channel: Test.Channel } );
            // override the default endpoint (from settings)
            if (Test.Session.Execute({ EndpointUrl: epGeneralTesting.EndpointUrl } ) ) {
                // prepare our invalid user identity token
                var invalidPolicy = UaUserIdentityToken.FromUserCredentials( { 
                                    Session: Test.Session,
                                    UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName ),
                                    EncryptionAlgorithm: BAD_ENCRYALG } );
                // now activate the session; we expect this call to FAIL; setup expectations and override parameters
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
    return( Assert.True( result, "The server did not respond as expected. The EncryptionAlgorithm is garbage, invalidating the identityToken." ) );
}

Test.Execute( { Procedure: username010 } );