/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Writing to a node raises AuditWriteUpdateEventType */

Test.Execute( { Debug: true, Procedure: function() {
    Test.Include( { File: "./maintree/Attribute Services/Attribute Write Values/Test Cases/001.js" } );
    if( write582001 ) {
        if( Assert.True( test.lookForEvents(), "AuditWriteUpdateEventType not received when using a certificate from an unknown host." ) ) {
            Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditWriteUpdateEventType not found in the Publish notification (Attribute/Write).", "Found AuditWriteUpdateEventType (Attribute/Write) in the Publish response!" );
        }
    }
    else return( false );
    return( true ); 
} } );