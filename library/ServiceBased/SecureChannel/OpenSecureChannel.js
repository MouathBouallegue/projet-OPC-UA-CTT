include( "./library/Base/Nonce.js" );

function OpenSecureChannelService( args ) {
    this.Name = "OpenSecureChannel";
    this.Channel = null;
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) args = new Object();
    this.Channel = isDefined( args.Channel )? args.Channel : new UaChannel();

    this.Execute = function( args ) {
        // validate all of our parameters first; and configure a new channel object
        if( !isDefined( args ) ) args = new Object();
        if( !isDefined( args.SuppressErrors ) ) args.SuppressErrors = false;
        if( isDefined( args.SecurityPolicyUri ) ) args.RequestedSecurityPolicyUri = args.SecurityPolicyUri;
        if( isDefined( args.SecurityMode ) )      args.MessageSecurityMode = args.SecurityMode;
        if( this.Channel === null ) this.Channel = new UaChannel();
        // setup the certificate handling
        var pkiProvider = new UaPkiUtility();    // we need this pki provider object to load PKI certificates with
        pkiProvider.PkiType = isDefined( args.PkiType )? args.PkiType : PkiType.OpenSSL;
        pkiProvider.CertificateRevocationListLocation  = isDefined( args.CertificateRevocationListLocation )? args.CertificateRevocationListLocation : readSetting( "/Advanced/Certificates/CertificateRevocationListLocation" );
        pkiProvider.CertificateTrustListLocation       = isDefined( args.CertificateTrustListLocation )?      args.CertificateTrustListLocation :      readSetting( "/Advanced/Certificates/CertificateTrustListLocation" );
        this.Channel.CertificateRevocationListLocation = pkiProvider.CertificateRevocationListLocation;
        this.Channel.CertificateTrustListLocation      = pkiProvider.CertificateTrustListLocation;
        // setup all other details
        this.Channel.MessageSecurityMode               = isDefined( args.MessageSecurityMode )?               args.MessageSecurityMode :               parseInt( readSetting( "/Server Test/Secure Channel/MessageSecurityMode" ) );
        this.Channel.NetworkTimeout                    = isDefined( args.NetworkTimeout )?                    args.NetworkTimeout :                    parseInt( readSetting( "/Server Test/Secure Channel/NetworkTimeout" ) );
        this.Channel.RequestedLifetime                 = isDefined( args.RequestedLifetime )?                 args.RequestedLifetime :                 parseInt( readSetting( "/Server Test/Secure Channel/RequestedLifetime" ) );
        this.Channel.ServerUrl                         = isDefined( args.ServerUrl )?                         args.ServerUrl :                         readSetting( "/Server Test/Server URL" );
        this.Channel.ClientNonce                       = isDefined( args.ClientNonce )?                       args.ClientNonce :                       UaByteString.fromStringData( Nonce.Next( 32 ) );
        if( isDefined( args.RequestedSecurityPolicyUri ) ) {
            if( typeof( args.RequestedSecurityPolicyUri ) === "string" ) this.Channel.RequestedSecurityPolicyUri = SecurityPolicy.policyFromString( args.RequestedSecurityPolicyUri );
            else this.Channel.RequestedSecurityPolicyUri = args.RequestedSecurityPolicyUri;
        }
        else this.Channel.RequestedSecurityPolicyUri = parseInt( readSetting( "/Server Test/Secure Channel/RequestedSecurityPolicyUri" ) );

        if( !isDefined( args.ServerCertificate ) ) {
            if( isDefined( gServerCapabilities ) && isDefined( gServerCapabilities.Endpoints ) && gServerCapabilities.Endpoints.length > 0 ) {
                for( var eps = 0; eps < gServerCapabilities.Endpoints.length; eps++ ) {
                    if( this.Channel.RequestedSecurityPolicyUri == SecurityPolicy.policyFromString( gServerCapabilities.Endpoints[eps].SecurityPolicyUri ) && this.Channel.MessageSecurityMode == gServerCapabilities.Endpoints[eps].SecurityMode ) {
                        this.Channel.ServerCertificate = gServerCapabilities.Endpoints[eps].ServerCertificate;
                        gServerCapabilities.ConnectedEndpoint = gServerCapabilities.Endpoints[eps];
                        gServerCapabilities.ServerCertificate = UaPkiCertificate.fromDER( gServerCapabilities.Endpoints[eps].ServerCertificate );
                        break;
                    }
                }
            }
            else { // we don't have the server certificate; let's go get it using an insecure connection
                var tmpChannel = new UaChannel();
                var discoverySession = new UaDiscovery( tmpChannel );
                var status = tmpChannel.connect( readSetting( "/Server Test/Server URL" ) );
                CheckUserStop();
                if (status.isGood()) {
                    var foundDesiredEndpoint = false;
                    var getEndpointsHelper = new GetEndpointsService( { Session: discoverySession } );
                    getEndpointsHelper.Execute2();
                    tmpChannel.disconnect();
                    // cache the endpoints; and then locate the exact endpoint matching the CTT settings. We will use it for connecting to...
                    for( var e=0; e<getEndpointsHelper.Response.Endpoints.length; e++ ) {             // process our endpoints...
                        var currEndpoint = getEndpointsHelper.Response.Endpoints[e].clone();          // clone the endpoint
                        gServerCapabilities.Endpoints.push(currEndpoint);                           // cache the endpoints in the gServerCapabilities object, but do this only once
                        var endpointUsesIp = false;
                        var channelUsesIp = false;
                        var endpointHost = currEndpoint.EndpointUrl.substring(currEndpoint.EndpointUrl.indexOf("://") + 3, currEndpoint.EndpointUrl.lastIndexOf(":"));
                        var channelHost = this.Channel.ServerUrl.substring(this.Channel.ServerUrl.indexOf("://") + 3, this.Channel.ServerUrl.lastIndexOf(":"));
                        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(endpointHost)) {
                            endpointUsesIp = true;
                        }
                        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(channelHost)) {
                            channelUsesIp = true;
                        }
                        if (endpointUsesIp != channelUsesIp) addWarning("There is a mismatch of the configured ServerUrl (" + this.Channel.ServerUrl + ") in the CTT Settings and the returned EndpointUrl (" + currEndpoint.EndpointUrl + ") in the GetEndpoints. Please validate configuration.")
                        if (currEndpoint.SecurityMode === this.Channel.MessageSecurityMode    // does *this* endpoint match our connection criteria in the settings?
                            && SecurityPolicy.policyFromString(currEndpoint.SecurityPolicyUri) === this.Channel.RequestedSecurityPolicyUri
                            && (
                                currEndpoint.EndpointUrl.toUpperCase() === this.Channel.ServerUrl.toUpperCase() ||
                                endpointUsesIp == channelUsesIp ||
                                channelHost.toLowerCase() == "localhost"
                            )) {
                            gServerCapabilities.ConnectedEndpoint = currEndpoint;
                            // store the certificate in the gServerCapabilities global object; and this channel object
                            gServerCapabilities.ServerCertificate = UaPkiCertificate.fromDER(currEndpoint.ServerCertificate);
                            this.Channel.ServerCertificate = currEndpoint.ServerCertificate;
                            foundDesiredEndpoint = true;
                        }
                        // save the certificate of all endpoints to the trust list, using the thumbprint as the filename; existing file will be clobbered
                        var serverCertFilename = readSetting( "/Advanced/Certificates/CertificateTrustListLocation" ).toString() + "/" + UaPkiCertificate.fromDER( currEndpoint.ServerCertificate ).Thumbprint.toString().substring( UaPkiCertificate.fromDER( currEndpoint.ServerCertificate ).Thumbprint.toString().indexOf( "=", 6 ) + 3 ) + ".der";
                        UaPkiCertificate.fromDER( currEndpoint.ServerCertificate ).toDERFile( serverCertFilename );
                    }
                    if (foundDesiredEndpoint == false) {
                            addError("Server doesn't provide the desired endpoint. Please verify CTT Settings (Project->Settings->Server Test->SecureChannel and Project->Settings->Server Test->ServerUrl)");
                        if( currEndpoint !== undefined ) {
                            gServerCapabilities.ConnectedEndpoint = currEndpoint;
                            // store the certificate in the gServerCapabilities global object; and this channel object
                            gServerCapabilities.ServerCertificate = UaPkiCertificate.fromDER(currEndpoint.ServerCertificate);
                            this.Channel.ServerCertificate = currEndpoint.ServerCertificate;
                        }
                    }
                }
            }
        }
        // client certificate
        if( args.EmptyClientCertificate === false || !isDefined( args.EmptyClientCertificate ) ) {
            if( !isDefined( args.ClientCertificate ) ) this.Channel.ClientCertificate = this.LoadCertificate( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appT, pkiProvider );
            else if( typeof args.ClientCertificate == "string" ) this.Channel.ClientCertificate = this.LoadCertificate( args.ClientCertificate, pkiProvider );
            else this.Channel.ClientCertificate = this.LoadCertificate( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appT, pkiProvider ); // Workaround because CTT returns BadEncodingLimitsExceeded if a random ByteString is specified.
            // client certificate private key
            if( !isDefined( args.ClientCertificatePrivateKey ) ) this.Channel.ClientPrivateKey = this.LoadCertificatePrivateKey( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTPrivateKey, pkiProvider );
            else this.Channel.ClientPrivateKey = this.LoadCertificatePrivateKey( args.ClientCertificatePrivateKey, pkiProvider );
        }
        // suppress messaging
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        // create our connection
        if( isDefined( args.PreHook ) ) args.PreHook();
        var auditEntryId = new UaDateTime.Now().toString() + Math.floor( Math.random() * 1000000 );
        this.Channel.ClientAuditEntryId = auditEntryId;
        this.UaStatus = this.Channel.connect( args.ServerUrl );
        CheckUserStop();
        this.PushAuditRecord( this.UaStatus.isGood(), this.Channel );
        var msg = "OpenSecureChannel( MessageSecurityMode: " + MessageSecurityMode.toString( this.Channel.MessageSecurityMode ) + "; RequestedSecurityPolicyUri: " + SecurityPolicy.policyToString( this.Channel.RequestedSecurityPolicyUri ) + " ); Result = " + this.UaStatus + ( isDefined( args.ServiceResult ) ? " " + args.ServiceResult.toString() : "" );
        var result = this.UaStatus.isGood();
        if( !args.SuppressMessaging ) print( msg );
        if( isDefined( args.ServiceResult ) ) {
            if( !Assert.True( args.ServiceResult.containsStatusCode( this.UaStatus.StatusCode ), this.Name + ".Response is not good; received '" + this.UaStatus + "'. " + args.ServiceResult.toString() ) ) result = false;
        }
        else if( this.UaStatus.isBad() && !args.SuppressErrors ) addError( msg, this.UaStatus );
        if( isDefined( args.PostHook ) ) args.PostHook();
        return( result );
    }

    /* Returns TRUE/FALSE if the Channel (specifed, or *this*) is secured
       Parameters:
           Channel: a UaChannel object (OPTIONAL) */
    this.IsSecure = function( channel ) { 
        if( isDefined( channel ) ) return( channel.RequestedSecurityPolicyUri !== SecurityPolicy.None && channel.MessageSecurityMode !== MessageSecurityMode.None );
        else return( this.Channel.RequestedSecurityPolicyUri !== SecurityPolicy.None && this.Channel.MessageSecurityMode !== MessageSecurityMode.None );
    }
    
    this.LoadCertificate = function( filename, pkiProvider ) {
        var clientCertificate = new UaByteString();
        var certResult = pkiProvider.loadCertificateFromFile( filename, clientCertificate );
        if( certResult.isGood() ) return( clientCertificate );
        else {
            addError( this.Name + "() LoadCertificate failed to load certificate from filename '" + filename + "'." );
            return( null );
        }
    }
    this.LoadCertificatePrivateKey = function( filename, pkiProvider ) {
        var clientPrivateKey  = new UaPkiPrivateKey();
        var certResult = pkiProvider.loadPrivateKeyFromFile( filename, clientPrivateKey );
        if( certResult.isGood() ) return( clientPrivateKey );
        else {
            addError( this.Name + "() LoadCertificatePrivateKey failed to load key from filename '" + filename + "'." );
            return( null );
        }
    }

    this.PushAuditRecord = function( status, channel ){

        var index = 0;
        var count = 11;
        var names = new UaQualifiedNames( count );
        var values = new UaVariants( count );

        var eventType = new UaNodeId( Identifier.AuditOpenSecureChannelEventType );
        names[index].Name = "EventType";
        values[index].setNodeId( eventType );

        index++;
        var auditEntryId = this.Channel.ClientAuditEntryId;
        names[index].Name = "ClientAuditEntryId";
        values[index].setString( auditEntryId );

        index++;
        names[index].Name = "Status";
        values[index].setBoolean( status );

        index++;
        names[index].Name = "Time";
        values[index].setDateTime( UaDateTime.utcNow() );

        index++;
        names[index].Name = "SessionId";
        values[index] = null;

        index++;
        names[index].Name = "UserIdentityToken";
        values[index] = null;

        index++;
        names[index].Name = "ClientCertificate";
        values[index].setByteString( channel.ClientCertificate );

        index++;
        names[index].Name = "RevisedSessionTimeout";
        values[index] = null;

        index++;
        names[index].Name = "SecurityPolicyUri";
        values[index].setUInt32( channel.RequestedSecurityPolicyUri );

        index++;
        names[index].Name = "SecurityPolicyMode";
        values[index].setUInt32( channel.MessageSecurityMode );

        index++;
        names[index].Name = "RequestedLifetime";
        values[index].setUInt32( channel.RequestedLifetime );

        Test.PushAuditRecord(
            {
                AuditEventType: eventType,
                AuditEntryId: auditEntryId,
                PropertyNames: names,
                PropertyValues: values
            }
        );
    }
}