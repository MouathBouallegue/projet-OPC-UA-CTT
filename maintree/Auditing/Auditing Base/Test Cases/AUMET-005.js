/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: event on invocation of multiple methods in a single Call */

Test.Execute( { Procedure: function() {

    include( "./maintree/Method Services/Method Call/Test Cases/005.js" );

    // step 2: check if an audit event occurred
    if( Assert.True( test.lookForEvents(), "AuditUpdateMethodEventType not received when invoking multiple methods in a single call." ) ) {
        if( Assert.True( test.lookForEventType( UaAuditType.AuditUpdateMethodEventType ), "AuditUpdateMethodEventType not found in the Publish notification.", "Found AuditUpdateMethodEventType in the Publish response!" ) ) {
            Assert.GreaterThan( 0, test.countEventsOfType( UaAuditType.AuditUpdateMethodEventType ), "Multiple AuditUpdateMethodEventTypes were expected in the Publish notification", "Multiple AuditUpdateMethodEventType events detected!" );
        }
    }


    return( true );
} } );