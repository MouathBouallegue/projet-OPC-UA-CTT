/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: OpenSecureChannel (secure) with untrusted certificate; check if audit event AuditOpenSecureChannelEventType received */

var channel2;

function clearClientCertificate() {
    channel2.ClientCertificate = null;
    channel2.clientPrivateKey  = null;
    print( "Modified Channel Properties:\n\tClientCertificate: " + channel2.ClientCertificate + "\n\tClientPrivateKey: " + channel2.ClientPrivateKey );
}

function testx() {
    // step 1: make sure we have a secure endpoint we can connect to...
    // initialize some endpoints that will be useful to scripts
    var epSecureSign = null;    // secure channel, no security
    var epSecureEncrypt = null; // secure channel, message encryption

    for( var e=0; e<gServerCapabilities.Endpoints.length; e++ ) {
        // We are not interested in the HTTP protocol, so filter those out.
        var strEndpoint = gServerCapabilities.Endpoints[e].EndpointUrl;
        if( strEndpoint.substring( 0, 4 ) == "http" ) continue;
        var ep = gServerCapabilities.Endpoints[e];
        if( ep.SecurityPolicyUri.lastIndexOf( "http://opcfoundation.org/UA/SecurityPolicy#Basic" ) == 0 ) {
            // find a secure endpoint, usinn Sign&Encrypt
            if( ep.SecurityMode === MessageSecurityMode.SignAndEncrypt ) epSecureEncrypt = ep;
            // find a secure endpoint, using Sign only
            if( ep.SecurityMode === MessageSecurityMode.Sign ) epSecureSign = ep;
        }
    }

    if( epSecureEncrypt === null && epSecureSign === null ) {
        addSkipped( "Secure endpoint using 128Rsa15 not found!" );
        return( false );
    }


    // step 1: create and destroy a new channel
    channel2 = new OpenSecureChannelService();
    if( channel2.Execute(  {
                            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
                            MessageSecurityMode: epSecureEncrypt.SecurityMode, 
                            ClientCertificate: readSetting( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appU" ),
                            ClientCertificatePrivateKey: readSetting( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appUPrivateKey" ),
                            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadSecurityChecksFailed, StatusCode.BadSecurityPolicyRejected, StatusCode.BadCertificateTimeInvalid ] ) } ) ) {
        var closeChannel2 = new CloseSecureChannelService();
        closeChannel2.Execute( { Channel: channel2 } );
    }

    // step 2: check if an audit event occurred
    if( Assert.True( test.lookForEvents(), "AuditOpenSecureChannelEventType not received for failed attempt to open a channel." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditOpenSecureChannelEventType ), "AuditOpenSecureChannelEventType not found in the Publish notification.", "Found AuditOpenSecureChannelEventType in the Publish response!" );
    }

    return( true );
}

Test.Execute( { Debug: true, Procedure: testx } );