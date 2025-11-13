/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Establish a session with different client certificate to what is used in the secure channel. */

Test.Execute( { Debug: true, Procedure: function() {

    // can we create a secure channel for this test? if not, skip the test
    var endpoint = UaEndpointDescription.FindSecurityMode( { Endpoints: gServerCapabilities.Endpoints, MessageSecurityMode: MessageSecurityMode.SignAndEncrypt } );
    if( !isDefined( endpoint ) ) { addSkipped( "No secure endpoints found." ); return( false ); }

    // create a new channel that is secure (doesn't matter if the default channel is secure or not)
    var secureChannel = new OpenSecureChannelService();
    if( !secureChannel.Execute( endpoint ) ) return( false );

    // create and activate a session; decorate the removeCertificate function with this property
    var session = new CreateSessionService( { Channel: secureChannel } );
    if( !session.Execute( { CertificateFile: "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSip",
                            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadCertificateUriInvalid, StatusCode.BadSecurityChecksFailed, StatusCode.BadCertificateUntrusted, StatusCode.BadCertificateHostNameInvalid ] ) } ) ) return( false );
    // now close the session
    CloseSessionHelper.Execute( { Session: session, 
                                  ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionIdInvalid ] ) } );
    CloseSecureChannelHelper.Execute( secureChannel );

    // now to look for our event...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CloseSession).", "Found AuditCreateSessionEventType (Session/CloseSession) in the Publish response!" );
    }
    return( true );
} } );