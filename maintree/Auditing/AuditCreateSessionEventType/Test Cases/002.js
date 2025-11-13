/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Establish a session with no client certificate. */

Test.Execute( { Procedure: function() {
    this.removeCertificate = function() {
        this.PreHook.session.Request.ClientCertficate = null;
        this.PreHook.session.Request.ClientNonce = new UaByteString();
    };

    // can we create a secure channel for this test? if not, skip the test
    var endpoint = UaEndpointDescription.FindSecurityMode( { Endpoints: gServerCapabilities.Endpoints, MessageSecurityMode: MessageSecurityMode.SignAndEncrypt } );
    if( !isDefined( endpoint ) ) { addSkipped( "No secure endpoints found." ); return( false ); }

    // create a new channel that is secure (doesn't matter if the default channel is secure or not)
    var secureChannel = new OpenSecureChannelService();
    if( !secureChannel.Execute( endpoint ) ) return( false );

    // create and activate a session; decorate the removeCertificate function with this property
    this.removeCertificate.session = new CreateSessionService( { Channel: secureChannel } );
    if( !this.removeCertificate.session.Execute( { PreHook: this.removeCertificate, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadNonceInvalid ) } ) ) return( false );
    // now close the session
    CloseSessionHelper.Execute( { Session: this.removeCertificate.session, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionIdInvalid ] ) } );

    CloseSecureChannelHelper.Execute( secureChannel );

    // now to look for our event...
    if( Assert.True( test.lookForEvents(), "AuditCreateSessionEventType not received when creating or closing a session." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CreateSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CreateSession).", "Found AuditCreateSessionEventType (Session/CreateSession) in the Publish response!" );
        Assert.True( test.lookForEventType( UaAuditType.AuditCreateSessionEventType, "Session/CloseSession" ), "AuditCreateSessionEventType not found in the Publish notification (Session/CloseSession).", "Found AuditCreateSessionEventType (Session/CloseSession) in the Publish response!" );
    }

    return( true );
} } );