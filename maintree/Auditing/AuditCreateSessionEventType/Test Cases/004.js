/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Attempt a session with incorrect login credentials (expect fail) */

Test.Execute( { Debug: true, Procedure: function() {
const BAD_PASSWORD = "abcd1234";

    // can we create a secure channel for this test? if not, skip the test
    var endpoint = UaEndpointDescription.FindSecurityMode( { Endpoints: gServerCapabilities.Endpoints, MessageSecurityMode: MessageSecurityMode.SignAndEncrypt } );
    if( !isDefined( endpoint ) ) { addSkipped( "No secure endpoints found." ); return( false ); }

    // loop thru all UserIdentityTokens defined for this endpoint
    for( var u=0; u<endpoint.UserIdentityTokens.length; u++ ) {
        var strUserToken = UserTokenType.toString( endpoint.UserIdentityTokens[u].TokenType );
        // we only care about login based authentication in this test
        if( endpoint.UserIdentityTokens[u].TokenType === UserTokenType.UserName ) {
            // create a session.
            var session = new CreateSessionService( { Channel: Test.Channel } );
            if( session.Execute() ) {
                // we expect this call to FAIL; setup expectations and override parameters
                var expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadIdentityTokenRejected, StatusCode.BadUserAccessDenied ] );
                // now activate the session
                testSuccess = ActivateSessionHelper.Execute( { 
                        Session: session, 
                        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
                                Session: session,
                                UserCredentials: new UserCredentials( {
                                            Policy: UserTokenType.UserName, 
                                            UserName: readSetting( "/Server Test/Session/LoginNameGranted1" ),
                                            Password: BAD_PASSWORD } ) } ),
                        ServiceResult: expectedResults } );
                // close the session, accept errors that session is not activated 
                expectedResults = new ExpectedAndAcceptedResults( [ StatusCode.BadSessionNotActivated, StatusCode.Good ]);
                CloseSessionHelper.Execute( { Session: session, ServiceResult: expectedResults } );
            }
        }
    }//for u UserIdentityToken

    // now to check for our events...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/ActivateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/ActivateSession).", "Found AuditCreateSessionEventType (Session/ActivateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CloseSession).", "Found AuditCreateSessionEventType (Session/CloseSession) in the Publish response!" );
    }
    
    return( true );
} } );