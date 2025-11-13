/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Untrusted certificate raises AuditCertificateUntrustedEventType and AuditOpenSecureChannelEventType */

Test.Execute( { Debug: true, Procedure: function() {
    Test.Include( { File: "./maintree/Security/Security Certificate Validation/Test Cases/005.js" } );
    if( certificateValidation005 ) {
        if( Assert.True( test.lookForEvents(), "AuditCertificateUntrustedEventType not received when using an expired certificate." ) ) {
            Assert.True( test.lookForEventType( UaAuditType.AuditCertificateUntrustedEventType, "Security/Certificate" ), "AuditCertificateUntrustedEventType not found in the Publish notification (Security/Certificate).", "Found AuditCertificateUntrustedEventType (Security/Certificate) in the Publish response!" );
            Assert.True( test.lookForEventType( UaAuditType.AuditOpenSecureChannelEventType, "Channel/OpenSecureChannel" ), "AuditOpenSecureChannelEventType not found in the Publish notification (Channel/OpenSecureChannel).", "Found AuditCreateSessionEventType (Channel/OpenSecureChannel) in the Publish response!" );
        }
    }
    else return( false );
    return( true ); 
} } );