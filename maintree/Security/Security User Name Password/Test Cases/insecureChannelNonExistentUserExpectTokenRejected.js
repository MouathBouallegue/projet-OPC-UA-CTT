/*  Test 4; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify a valid but non-existent username; password=""; but policyId and encryptionAlgorithm are both valid.
    Expectation: ServiceResult = Bad_IdentityTokenRejected.
        IMPORTANT: This script uses the Login Name and Password defined in the CTT Settings. */

function username004() {
    // is the global variable "epSecureChNone" null? if so then we can't run
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

    // simple flag used to determine if test succeeds
    var testSuccess = false;
    // loop thru all UserIdentityTokens defined for this endpoint
    for (var u = 0; u < epGeneralTesting.UserIdentityTokens.length; u++ ) {
        var strUserToken = UserTokenType.toString(epGeneralTesting.UserIdentityTokens[u].TokenType );
        // we only care about login based authentication in this test
        if (epGeneralTesting.UserIdentityTokens[u].TokenType === UserTokenType.UserName ) {
            // create a session.
            Test.Session = new CreateSessionService( { Channel: Test.Channel } );
            if( Test.Session.Execute() ) {
                // we expect this call to FAIL; setup expectations and override parameters
                var expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadIdentityTokenRejected, StatusCode.BadUserAccessDenied ] );
                // now activate the session
                testSuccess = ActivateSessionHelper.Execute( { 
                        Session: Test.Session, 
                        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
                                Session: Test.Session, 
                                UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessDenied, UserTokenType.UserName ) } ), 
                        ServiceResult: expectedResults } );
                // close the session, accept errors that session is not activated 
                expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadSessionNotActivated, StatusCode.Good ]);
                CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: expectedResults } );
            }
        }
    }//for u UserIdentityToken
    Test.Disconnect( { SkipCloseSession: true } );
    return( Assert.True( testSuccess, "The test did not complete successfully. The session was allowed, even though the username shouldn't exist!", "The session was correctly rejected because of the invalid UsernameIdentityToken." ) );
}

Test.Execute( { Procedure: username004 } );
