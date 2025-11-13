/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Transfer a session and check for audit events */

Test.Execute( { Procedure: function() {

    // let's do this the lazy way be invoking a script that already does the test...
    Test.Include( { File: "./maintree/Session Services/Session Base/Test Cases/008.js" } );
    if( activateSession562005() ) {

        // now to look for our events...
        if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when tranferring session." ) ) {
            Assert.Equal( 1, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType (Session/CreateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CreateSession) found for each session." );
            Assert.Equal( 2, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/ActivateSession" ), "AuditCreateSessionEventType (Session/ActivateSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/ActivateSession) found for each session." );
            Assert.Equal( 1, test.countEventsOfType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType (Session/CloseSession) was not created as many times as expected.", "AuditCreateSessionEventType (Session/CloseSession) found for each session." );
        }

    }

    return( true );
} } );