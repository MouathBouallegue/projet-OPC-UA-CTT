/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: ActivateSession with invalid credentials */

Test.Execute( { Procedure: function() {

    // let's do this the lazy way be invoking a script that already does the test...
    // but before we can, there's a dependency this script has on a variable in its own 'initialize.js' script that we must set from here
    epSecureChNone = UaEndpointDescription.FindSecurityMode( { Endpoints: gServerCapabilities.Endpoints, MessageSecurityMode: MessageSecurityMode.SignAndEncrypt } );
    if( !isDefined( epSecureChNone ) ) { addSkipped( "No secure endpoints found." ); return( false ); }

    var session = new CreateSessionService( { Channel: Test.Channel } );
    if( session.Execute() ) {
        // we expect this call to FAIL; setup expectations and override parameters
        // now activate the session
        testSuccess = ActivateSessionHelper.Execute( { 
                Session: session, 
                UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
                        Session: session, 
                        UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessDenied, UserTokenType.UserName ) } ), 
                ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadIdentityTokenRejected, StatusCode.BadUserAccessDenied ] ) } );
        // close the session, accept errors that session is not activated 
        CloseSessionHelper.Execute( { Session: session, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadSessionNotActivated, StatusCode.Good ] ) } );
    }

    // now to look for our events...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when tranferring session." ) ) {
        Assert.Equal( 1, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType (Session/CreateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CreateSession) found for each session." );
        Assert.Equal( 1, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/ActivateSession" ), "AuditCreateSessionEventType (Session/ActivateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/ActivateSession) found for each session." );
        Assert.Equal( 1, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType (Session/CloseSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CloseSession) found for each session." );
    }

    return( true );
} } );