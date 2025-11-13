/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Call ActivateSession multiple times, expect success */

Test.Execute( { Debug: true, Procedure: function() {
const SESSIONCOUNT=2;
    var session = [];

    // create and activate multiple sessions
    for( var i=0; i<SESSIONCOUNT; i++ ) {
        session[i] = new CreateSessionService( { Channel: Test.Channel } );
        if( session[i].Execute() ) {
            // now activate and then close the session
            ActivateSessionHelper.Execute( { Session: session[i] } );
        }
    }

    for( var i=0; i<SESSIONCOUNT; i++ ) CloseSessionHelper.Execute( { Session: session[i], ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionClosed, StatusCode.BadSessionNotActivated ] ) } );

    // now to look for our events...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.Equal( SESSIONCOUNT, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType (Session/CreateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CreateSession) found for each session." );
        Assert.Equal( SESSIONCOUNT, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/ActivateSession" ), "AuditCreateSessionEventType (Session/ActivateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/ActivateSession) found for each session." );
        Assert.Equal( SESSIONCOUNT, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType (Session/CloseSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CloseSession) found for each session." );
    }

    return( true );
} } );