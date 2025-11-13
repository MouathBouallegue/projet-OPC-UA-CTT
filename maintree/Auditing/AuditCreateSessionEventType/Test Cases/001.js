/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Create a session and verify an event is raised */

Test.Execute( { Procedure: function() {
    // create and activate a session
    var session = new CreateSessionService( { Channel: Test.Channel } );
    if( !session.Execute() ) return( false );
    // now close the session
    CloseSessionHelper.Execute( { Session: session, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] ) } );


    // now to look for our event...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CloseSession).", "Found AuditCreateSessionEventType (Session/CloseSession) in the Publish response!" );
    }

    return( true );
} } );