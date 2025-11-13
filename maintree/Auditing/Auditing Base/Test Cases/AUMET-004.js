/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: event on invocation of method with in and out args */

Test.Execute( { Procedure: function() {

    include( "./maintree/Method Services/Method Call/Test Cases/004.js" );

    // step 2: check if an audit event occurred
    if( Assert.True( test.lookForEvents(), "AuditUpdateMethodEventType not received when invoking method." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditUpdateMethodEventType ), "AuditUpdateMethodEventType not found in the Publish notification.", "Found AuditUpdateMethodEventType in the Publish response!" );
    }


    return( true );
} } );