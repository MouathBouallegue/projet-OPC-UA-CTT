/*  activateSession - helper object for simplifying calls to ActivateSession
    Parameters:
        session            - the SESSION object that maintains the session with UA Server 
        userCredentials    - (OPTIONAL) the user credentials necessary to activate the session ('UserCredentials' object)
        expectedResults    - (OPTIONAL) 'ExpectedAndAcceptedResults' objects
        expectErrorNotFail - (OPTIONAL) True = expect ERROR; False = expect FAILURE */
        
include( "library/Base/identity.js" );        

function ActivateSessionService() {
    this.Name = "ActivateSession";  // Name of this service
    this.Request = null;            // ActivateSession request
    this.Response = null;           // ActivateSession response
    this.Result = null;             // Result of the CreateSession call

    /* ActivateSession.Execute() invokes the CreateSession service.
       Parameters (all are optional; if missing then defaults are assumed, which mostly come from SETTINGS): 
           ClientSignature: 
           ClientSoftwareCertificates:
           EncryptionAlgorithm: 
           LocaleIds: 
           NoNonceAppended: 
           OperationResults: 
           Password: 
           PreHook
           PolicyId: 
           PostHook: 
           Session: (REQUIRED)
           UserName: 
           UserIdentityToken: 
           UserTokenSignature: 
           ServiceResult: 
           SkipCheckSessionId: */
    this.Execute = function( args ) {
        // prepare the request
        this.Request = new UaActivateSessionRequest();
        this.Request.RequestHeader = UaRequestHeader.New( { Session: args.Session.Session, ReturnDiagnostics: args.ReturnDiagnostics } );
        if( !isDefined( args ) )         throw( "ActivateSession.Execute() args not specified" );
        if( !isDefined( args.Session ) ) throw( "ActivateSession.Execute() session not specified" );
        if( !isDefined( args.SuppressMessaging ) )   args.SuppressMessaging = false;
        if( !isDefined( args.SkipCheckSessionId ) ) args.SkipCheckSessionId = false;
        if( isDefined( args.LocaleIds ) ) this.Request.LocaleIds == args.LocaleIds;
        else this.Request.LocaleIds[0] = "en";
        
        if( args.ClientSignature === undefined ) {
            // prepare client signatue - only if security is used
            if ( args.Session.Channel.IsSecure() ) {
                var algorithms = SecurityAlgorithms.getAlgorithms(args.Session.Channel.Channel.RequestedSecurityPolicyUri);
                this.Request.ClientSignature.Algorithm = algorithms.AsymmetricSignatureAlgorithm;
                var data = args.Session.Channel.Channel.ServerCertificate.clone();
                data.append( args.Session.Session.ServerNonce );
                // sign the data
                var cryptoProvider = new UaCryptoProvider( args.Session.Channel.Channel.RequestedSecurityPolicyUri );
                // call asymmetricSign to get the required size of the buffer for the signature
                uaStatus = cryptoProvider.asymmetricSign( data, args.Session.Channel.Channel.ClientPrivateKey, this.Request.ClientSignature.Signature );
                // now resize the Signature ByteString and allocate the required buffer for the signature (this is done by assigning the length to itself)
                var sigLength = this.Request.ClientSignature.Signature.length;
                this.Request.ClientSignature.Signature.length = 1;
                this.Request.ClientSignature.Signature.length = sigLength;
                // call asymmetricSign to actually get the Signature returned in the Signature parameter
                uaStatus = cryptoProvider.asymmetricSign( data, args.Session.Channel.Channel.ClientPrivateKey, this.Request.ClientSignature.Signature );
                if( uaStatus.isBad() ) addError( "ActivateSession() asymmetricSign status " + uaStatus, uaStatus );
            }
        }
        else {
            if (args.ClientSignature !== null) {
                this.Request.ClientSignature = args.ClientSignature;
                print("ClientSignature has been specified with " + this.Request.ClientSignature);
            }
            else {
                print("We are leaving the ClientSignature uninitialized. ClientSignature=" + this.Request.ClientSignature);
            }
        }

        // User identity token.
        if( isDefined( args.UserIdentityToken ) ) {
            try{
                this.Request.UserIdentityToken = args.UserIdentityToken;
                if( this.Request.UserIdentityToken.TypeId.NodeId.equals( new UaNodeId( Identifier.X509IdentityToken_Encoding_DefaultBinary ) ) ) {
                    var c = args.UserIdentityToken.toX509IdentityToken();
                    // create a signature, but only if not already specified
                    if ( isDefined( args.UserTokenSignature ) ) this.Request.UserTokenSignature = args.UserTokenSignature;
                    else if ( !isDefined( args.OmitSignature ) || !args.OmitSignature ) {
                        var u = UaSignatureData.New( { Algorithm: SecurityPolicy.policyToString( args.Session.Channel.Channel.RequestedSecurityPolicyUri ), Session: args.Session } );
                        this.Request.UserTokenSignature = u;
                    }
                }
            }
            catch( ex ) {
                throw( "ActivateSession.UserIdentityToken could not be set: '" + ex + "'." );
            }
        }
        else this.Request.UserIdentityToken = UaUserIdentityToken.FromUserCredentials( { 
            Session: args.Session, 
            Endpoints: args.Endpoints,
            UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1 ) } );
    
        // client software certificates
        if( isDefined( args.ClientSoftwareCertificates ) ) {
            if( !isDefined( args.ClientSoftwareCertificates.length ) ) args.ClientSoftwareCertificates = [ args.ClientSoftwareCertificates ];
            for( var i=0; i<args.ClientSoftwareCertificates.length; i++ ) this.Request.ClientSoftwareCertificates[i] = args.ClientSoftwareCertificates;[i]
        }
    
        // register this service as tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: "ActivateSession", Available: true, Tested: true } ) } );

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // prepare the response; process any pre-hooks, and invoke...
        this.Response = new UaActivateSessionResponse();
        if( isDefined( args.PreHook ) ) args.PreHook();
        var auditEntryId = new UaDateTime.Now().toString() + Math.floor( Math.random() * 1000000 );
        this.Request.RequestHeader.AuditEntryId = auditEntryId;
        this.Result = args.Session.Session.activateSession( this.Request, this.Response );
        this.PushAuditRecord( args.Session.Session, this.Request, this.Response );
        var success = UaResponseHeader.IsValid( {
            Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging,
            ServiceInfo: "LocaleIds #" + this.Request.LocaleIds.length +
                "; UserIdentityToken: " + UaUserIdentityToken.GetPolicyId( this.Request.UserIdentityToken ) +
                " ( ClientSignature=" + this.Request.ClientSignature.Algorithm + ", UserTokenSignature=" + this.Request.UserTokenSignature.Algorithm + " )"
        } );
        if( success && this.Response.ResponseHeader.ServiceResult.isGood() ) {
            success = this.ValidateHeader( args );
            // now that we have a session, let's gather some information about the Server. This routine will only be invoked once.
            gServerCapabilities.GetServerCapabilties( args.Session.Session );
        }
        else {
            // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
            Assert.LessThan( 1, this.Response.ServerNonce.length, "ActivateSession.Response.ServerNonce is not needed when a ServiceFault is returned." );
            Assert.Equal( 0, this.Response.Results.length, "ActivateSession.Response.Results are not needed when a ServiceFault is returned." );
        }
        if( this.Response.ResponseHeader.ServiceResult.isGood() ) args.Session.Session.Connected = true;
        // if the call failed then register that 
        if( !success ) ServiceRegister.SetFailed( { Name: "ActivateSession" } )
        return( success );
    }

    this.checkSessionName = function( SessionObject ) {
        var result = true;
        if( SessionObject.Request === null ) return( true ); // abort; this is likely a transferred session
        if( SessionObject !== null && SessionObject !== "" ) {
            var sessionName = SessionObject.Request.SessionName;
            addLog( "Read the BrowseName on the SessionId node (for this session). Node Id: " + SessionObject.Session.SessionId );
            var sessionItem = MonitoredItem.fromNodeIds( [ SessionObject.Session.SessionId ], Attribute.BrowseName )[0];
            var sessionNodeClass = sessionItem.clone();
            sessionNodeClass.AttributeId = Attribute.NodeClass;
            var read = new ReadService( { Session: SessionObject.Session } );
            var opResults = [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ),
                              new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) ];
            if ( read.Execute( { NodesToRead: [ sessionItem, sessionNodeClass ], TimestampsToReturn:TimestampsToReturn.Server, OperationResults: opResults } ) ) {
                if( read.Response.Results[0].StatusCode.isGood() ) {
                    var qnValue = read.Response.Results[0].Value.toQualifiedName().Name;
                    if( read.Response.Results[0].StatusCode.isGood() ) {
                        if( sessionName.length == 0 && qnValue.length == 0 ) {
                            addError( "Server did not create a SessionName for the Client." );
                            result = false;
                        }
                    }
                    if( read.Response.Results[1].StatusCode.isGood() ) if( !Assert.Equal( NodeClass.Object, read.Response.Results[1].Value.toInt32(), "NodeClass of the session node is not Object" ) ) result = false;
                }
                else _warning.store( "Session diagnostics not available; probably not supported." );
            }
            else {
                addError( "When reading the BrowseName of a NodeId matching the current session, the value returned should match the SessionName established in the CreateSession call.\n" +
                          "CreateSession.SessionName: " + sessionName + "; Read.Results[0].Value: " + qnValue );
                result = false;
            }
            // clean-up
            read = null;
        }
        else addLog( "Session name is empty, per the Request: '" + SessionObject.Session.Request.SessionName + "'" );
        return( result );
    }

    this.ValidateHeader = function( args ) {
        var result = true;
        if( !args.SkipCheckSessionId ) if( !this.checkSessionName( args.Session ) ) result = false; // check the SessionId is visible in the address space
        if( this.Response.ResponseHeader.ServiceResult.isBad() ) return( false );                   // no need to check if the overall call failed
        else {
            // Check the server nonce.
            var nonceRequired = args.Session.Channel.IsSecure();
            if( nonceRequired && !Assert.True( Nonce.IsValid( this.Response.ServerNonce ), "ActivateSession.Response.ServerNonce must be 32-characters long. Length: " + this.Response.ServerNonce ) ) result = false;
            if( Nonce.Contains( this.Response.ServerNonce ) ) { // Check if nonce is unique.
                addError( "ActivateSession.Response.ServerNonce repeated value '" + serverNonce + "'.\nEach ServerNonce MUST be unique." );
                result = false;
            }
            // check results; related to SoftwareCertificates which shouldn't be used (May, 2015)
            if( this.Response.Results.length !== this.Request.ClientSoftwareCertificates.length ) {
                addError( "The number of results does not match the number of ClientSoftwareCertificates. " + "ClientSoftwareCertificates.length = " + Request.ClientSoftwareCertificates.length + " Results.length = " + Response.Results.length );
                result = false;
            }
            // operation results; if we have expected results then compare them to our actual results
            if( isDefined( args.OperationResults ) ) {
                if( !Assert.Equal( args.OperationResults.length, this.Response.Results.length, "ActivateSession.Response.Results length does not match expectations." ) ) result = false;
                else {
                    for( var i=0; i<this.Response.Results.length; i++ ) {
                        if( !args.OperationResults.containsStatusCode( this.Response.Results[i].StatusCode ) ) {
                            addError( "ActivateSession.Response.Results[" + i + "] received '" + this.Respones.Results[i].StatusCode + "'.\n" + args.OperationResults[i].toString() );
                            result = false;
                        }
                    }
                }
            }
            else {
                for( i=0; i<this.Response.Results.length; i++ ) {                            // check each result
                    if( this.Response.Results[i].isNotGood() ) {                             // status code is good?
                        addError( "ActivationSession.Response.Results[" + i + "] is not good. ", Response.Results[i]);
                        result = false;
                    }
                }
            }
        }
        return( result );
    }

    this.GetUniqueAuditEntryId = function( session, request ){
        var newEntry = session.getUniqueAuditEntry();
        request.RequestHeader.AuditEntryId = newEntry;
    }

    this.PushAuditRecord = function( session, request, response ){

        var count = 6;

        var index = 0;
        var names = new UaQualifiedNames( count );
        var values = new UaVariants( count );

        var eventType = new UaNodeId( Identifier.AuditActivateSessionEventType );
        names[ index ].Name = "EventType";
        values[ index ].setNodeId( eventType );

        index++;
        // There does seem to be a way to get an audit entry id
        var auditEntryId = request.RequestHeader.AuditEntryId;
        names[ index ].Name = "ClientAuditEntryId";
        values[ index ].setString( auditEntryId );

        index++;
        names[ index ].Name = "Status";
        values[index].setBoolean(response.ResponseHeader.ServiceResult.isGood() );

        index++;
        names[ index ].Name = "Time";
        values[ index ].setDateTime( UaDateTime.utcNow() );

        index++;
        names[ index ].Name = "SessionId";
        values[ index ].setNodeId( session.SessionId );

        index++;
        names[ index ].Name = "UserIdentityToken";
        values[index].setString( UaUserIdentityToken.GetPolicyId( request.UserIdentityToken ) );

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