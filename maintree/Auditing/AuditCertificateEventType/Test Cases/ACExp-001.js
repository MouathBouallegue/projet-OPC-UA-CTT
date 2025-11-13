/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Expired certificate raises AuditCertificateExpiredEventType */

Test.Execute( { Debug: true, Procedure: function() {
    Test.Include( { File: "./maintree/Security/Security Certificate Validation/Test Cases/007.js" } );
    if( certificateValidation007 ) {
        if( Assert.True( test.lookForEvents(), "AuditCertificateExpiredEventType not received when using an expired certificate." ) ) {
            Assert.True( test.lookForEventType( UaAuditType.AuditCertificateExpiredEventType, "Security/Certificate" ), "AuditCertificateExpiredEventType not found in the Publish notification (Security/Certificate).", "Found AuditCertificateExpiredEventType (Security/Certificate) in the Publish response!" );
            Assert.True( test.lookForEventType( UaAuditType.AuditOpenSecureChannelEventType, "Channel/OpenSecureChannel" ), "AuditOpenSecureChannelEventType not found in the Publish notification (Channel/OpenSecureChannel).", "Found AuditCreateSessionEventType (Channel/OpenSecureChannel) in the Publish response!" );
        }
    }
    else return( false );
    return( true ); 
} } );