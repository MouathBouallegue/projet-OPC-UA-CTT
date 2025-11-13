/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Call ActivateSession, expect success */

Test.Execute( { Debug: true, Procedure: function() {

    // create and activate a session; decorate the removeCertificate function with this property
    var session = new CreateSessionService( { Channel: Test.Channel } );
    if( !session.Execute() ) return( false );
    
    // now activate and then close the session
    if( !ActivateSessionHelper.Execute( { Session: session } ) ) return( false );
    CloseSessionHelper.Execute( { Session: session } );

    // now to look for our event...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/ActivateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/ActivateSession).", "Found AuditCreateSessionEventType (Session/ActivateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CloseSession).", "Found AuditCreateSessionEventType (Session/CloseSession) in the Publish response!" );
    }
    return( true );
} } );