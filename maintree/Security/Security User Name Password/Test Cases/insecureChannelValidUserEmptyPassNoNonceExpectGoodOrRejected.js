/*  Test 6; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify a valid username; password=”” (no serverNonce appended meaning the password field is empty); but policyId and encryptionAlgorithm are both valid.
    Expectation: ServiceResult = Bad_IdentityTokenRejected.
        IMPORTANT: This script uses the Login Name and Password defined in the CTT Settings. */

function username006() {
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
                                UserCredentials: new UserCredentials( {
                                                Policy: UserTokenType.UserName, 
                                                UserName: readSetting( "/Server Test/Session/LoginNameGranted1" ),
                                                Password: "" } ) } ),
                        ServiceResult: expectedResults,
                        NoNonceAppended:true } );
                // close the session, accept errors that session is not activated 
                expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadSessionNotActivated, StatusCode.Good ] );
                CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: expectedResults } );
            }
        }
    }//for u UserIdentityToken
    Test.Disconnect( { SkipCloseSession: true } );
    return( Assert.True( testSuccess, "The server did not respond as expected. If empty passwords are supported, and if matching the password for the defined username, then the call should've succeeded.", "Server rejected the identityToken correctly, because the serverNonce was not appended to the <empty> password." ) );
}

Test.Execute( { Procedure: username006 } );