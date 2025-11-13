/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Invalid hostname raises AuditCertificateDataMismatchEventType */

Test.Execute( { Debug: true, Procedure: function() {
    Test.Include( { File: "./maintree/Security/Security Certificate Validation/Test Cases/011.js" } );
    if( certificateValidation011 ) {
        if( Assert.True( test.lookForEvents(), "AuditCertificateDataMismatchEventType not received when using a certificate from an unknown host." ) ) {
            Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
            Assert.True( test.lookForEventType( UaAuditType.AuditOpenSecureChannelEventType, "Channel/OpenSecureChannel" ), "AuditOpenSecureChannelEventType not found in the Publish notification (Channel/OpenSecureChannel).", "Found AuditCreateSessionEventType (Channel/OpenSecureChannel) in the Publish response!" );
        }
    }
    else return( false );
    return( true ); 
} } );