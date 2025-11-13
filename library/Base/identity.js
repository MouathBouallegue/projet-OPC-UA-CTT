include( "./library/Base/Objects/securityalgorithms.js" );

var UserCertificateSetting = {
    // not sure why this was using different bits in a byte
    // due to the additional fields we need changed this to normal numbering
    Trusted:                0,
    Untrusted:              1,
    NotYetValid:            2,
    Expired:                3,
    Issued:                 4,
    Revoked:                5,
    RevokedNotTrusted:      6,
    IncorrectlySigned:      7,
    IssuersIssued:          8,
    IssuersIssuedNotTrusted:9,
    IssuerUnknown:          10,
    ApplicationInstanceCertificate: 11
};
UserCertificateSetting.toString = function( byteValue ) {
    switch( byteValue ) {
        case UserCertificateSetting.Trusted: return "UserCertificateSetting.Trusted";
        case UserCertificateSetting.Untrusted: return "UserCertificateSetting.Untrusted";
        case UserCertificateSetting.NotYetValid: return "UserCertificateSetting.NotYetValid";
        case UserCertificateSetting.Expired: return "UserCertificateSetting.Expired";
        case UserCertificateSetting.Issued: return "UserCertificateSetting.Issued";
        case UserCertificateSetting.Revoked: return "UserCertificateSetting.Revoked";
        case UserCertificateSetting.RevokedNotTrusted: return "UserCertificateSetting.RevokedNotTrusted";
        case UserCertificateSetting.IncorrectlySigned: return "UserCertificateSetting.IncorrectlySigned";
        case UserCertificateSetting.IssuersIssued: return "UserCertificateSetting.IssuersIssued";
        case UserCertificateSetting.IssuersIssuedNotTrusted: return "UserCertificateSetting.IssuersIssuedNotTrusted";
        case UserCertificateSetting.IssuerUnknown: return "UserCertificateSetting.IssuerUnknown";
        case UserCertificateSetting.ApplicationInstanceCertificate: return "UserCertificateSetting.ApplicationInstanceCertificate";
        case UserCertificateSetting.OtherPrivateKey: return "UserCertificateSetting.OtherPrivateKey";
    }
    return( "Invalid UserCertificateSetting!" );
}

var PresetCredentials = { 
    "AccessGranted1":0,
    "AccessGranted2":1,
    "AccessDenied":2,
    "X509":3 };

function UserCredentials( params ) {
    var tmpPolicy;
    if( isDefined( params.Policy ) ) tmpPolicy = params.Policy;
    else if( isDefined( params.policy ) ) tmpPolicy = params.policy;
    this.Policy = tmpPolicy || UserTokenType.Anonymous;
    if ( this.Policy == UserTokenType.UserName) {
        this.UserName = isDefined( params.UserName )? params.UserName : params.username || "";
        this.Password = isDefined( params.Password )? params.Password : params.password || "";
    }
}; //function UserCredentials( params )

// presetCredentials -> PresetCredentials enum
UserCredentials.createFromSettings = function( presetCredentials, typeOverride ) {
    var params = {};
    var type = ( typeOverride === undefined || typeOverride === null)? parseInt( readSetting( "/Server Test/Session/UserAuthenticationPolicy" ) ) : typeOverride;
    switch ( type ) {
        case UserTokenType.Anonymous:
            break;
        case UserTokenType.UserName:
            switch ( presetCredentials ) {
                case PresetCredentials.AccessGranted1:
                    usernameSetting = "/Server Test/Session/LoginNameGranted1";
                    passwordSetting = "/Server Test/Session/LoginPasswordGranted1"
                    break;
                case PresetCredentials.AccessGranted2:
                    usernameSetting = "/Server Test/Session/LoginNameGranted2";
                    passwordSetting = "/Server Test/Session/LoginPasswordGranted2"
                    break;
                case PresetCredentials.AccessDenied:
                    usernameSetting = "/Server Test/Session/LoginNameAccessDenied";
                    passwordSetting = "/Server Test/Session/LoginPasswordAccessDenied"
                    break;
                default: throw( "UserCredentials.createFromSettings() invalid 'presetCredential' specified. Choose 'AccessGranted1', 'AccessGranted2', or 'AccessDenied'." );
            }
            var username = readSetting( usernameSetting );
            if ( username == null || username == undefined ) {
                addWarning( "UserCredentials.createFromSettings() - username not set!" );
                username = "";
            }
            else username = username.toString();
            var password = readSetting( passwordSetting );
            if ( password == null || password == undefined ) {
                addWarning( "UserCredentials.createFromSettings() - password not set!" );
                password = "";
            }
            else password = password.toString();
            params = { policy:type, username:username, password:password };
            break;
        case UserTokenType.Certificate:
            params = { policy:2 };
            break;
        case UserTokenType.IssuedToken:
            params = { policy:3 };
            break;
    }
    return new UserCredentials( params );
}; // UserCredentials.createFromSettings = function( presetCredentials, typeOverride )

function needAnonymousToken( securityPolicyUri, session ) {
    // This function checks if the server requires an anonymous identity token for 
    // anonymous access. It is needed because the server may not require one when
    // the only access policy is anonymous. In these cases the client can't reply with
    // any token.
    // securityPolicyUri - the URI of the security policy
    for( var i=0; i<gServerCapabilities.Endpoints.length; i++ ) { // iterate thru each endpoint
        var description = gServerCapabilities.Endpoints[i];
        if ( description.SecurityPolicyUri == securityPolicyUri ) return ( description.UserIdentityTokens.length != 0 );
    } // for i
    return true;
}; // function needAnonymousToken( securityPolicyUri )

function getUserTokenPolicy( securityPolicyUri, tokenType, session, policyId, messageSecurityMode ) {
    // This function returns the user token policy, given the security policy of the
    // endpoint and the authentication token type. It only considers UA-TCP endpoints (the ones
    // used by the CTT). If a token policy cannot be found for the given token type, null
    // is returned.
    // securityPolicyUri - the URI of the security policy
    // tokenType - UserTokenType
    if( !isDefined( session ) ) throw( "identity.js::getUserTokenPolicy: no Session defined. Back-track and find out why." );

    if( isDefined( gServerCapabilities.ConnectedEndpoint ) && ( gServerCapabilities.ConnectedEndpoint.SecurityPolicyUri == securityPolicyUri ) && ( !isDefined( messageSecurityMode ) || gServerCapabilities.ConnectedEndpoint.SecurityMode == messageSecurityMode ) ) {
        // now iterate thru all user endpoint tokens and search for the matching type
        for (var j = 0; j < gServerCapabilities.ConnectedEndpoint.UserIdentityTokens.length; j++) {
            var token = gServerCapabilities.ConnectedEndpoint.UserIdentityTokens[j];
            if (token.TokenType == tokenType) {
                if( isDefined( policyId ) && token.PolicyId != policyId ) continue;
                // also store a copy of this in the ServerCapabilities global object/variabl.
                gServerCapabilities.ConnectedIdentityToken = token;
                return token;
            }// if token...
        }// for j=
    }
    for (var i = 0; i < gServerCapabilities.Endpoints.length; i++) {
        var description = gServerCapabilities.Endpoints[i];
        if( description.SecurityPolicyUri == securityPolicyUri &&
            description.SecurityMode == messageSecurityMode &&
            ( description.TransportProfileUri === "http://opcfoundation.org/UA-Profile/Transport/uatcp-uasc-uabinary" ||
              description.TransportProfileUri === "http://opcfoundation.org/UA-Profile/Transport/https-uabinary" ) ) {
            // store a copy of the endpoint in the "ServerCapabilities" global object/variable.
            gServerCapabilities.ConnectedEndpoint = description;
            // now iterate thru all user endpoint tokens and search for the matching type
            for( var j=0; j<description.UserIdentityTokens.length; j++) {
                var token = description.UserIdentityTokens[j];
                if ( token.TokenType == tokenType ) {
                    // also store a copy of this in the ServerCapabilities global object/variabl.
                    gServerCapabilities.ConnectedIdentityToken = token;
                    return token;
                }// if token...
            }// for j=
        }// if description...
    }// for i=
    return null;
}; // function getUserTokenPolicy( securityPolicyUri, tokenType )

/**
 * Creates a UserIdentityToken of type Anonymous.
 *
 * @param { UaSession } session - (Required) An instance of the session object the UserIdentityToken should be built for.
 * @param { String } [overrides] - (Optional) Overwrites like the overrides.PolicyId which is assigned to the token.PolicyId
 * @param { Boolean } [suppressWarnings] - (Optional) Flag that indicates whether a warning should be printed if the policy is not available in the current endpoint. Default is false.
 *
 * @returns Anonymous UserIdentityToken
 */
function buildAnonymousIdentityToken( session, overrides, suppressWarnings ) {
    var obj = new UaExtensionObject();
    var securityPolicyUri = "";
    var messageSecurityMode = 0;
    if( isDefined( session.Channel ) && isDefined( session.Channel.RequestedSecurityPolicyUri ) ) {
        securityPolicyUri = SecurityPolicy.policyToString( session.Channel.RequestedSecurityPolicyUri );
        messageSecurityMode = session.Channel.MessageSecurityMode;
    }
    else if( isDefined( gServerCapabilities.ConnectedEndpoint ) ) {
        securityPolicyUri = gServerCapabilities.ConnectedEndpoint.SecurityPolicyUri;
        messageSecurityMode = gServerCapabilities.ConnectedEndpoint.SecurityMode;
    }
    else {
        var policy = parseInt( readSetting( "/Server Test/Secure Channel/RequestedSecurityPolicyUri" ) );
        var mode = parseInt( readSetting( "/Server Test/Secure Channel/MessageSecurityMode" ) );
        securityPolicyUri = SecurityPolicy.policyToString( policy );
        messageSecurityMode = mode;
    }
    // Does the server require an anonymous token or does it accept an empty one?
    if( isDefined( overrides ) && isDefined( overrides.PolicyId ) ) {
        var token = new UaAnonymousIdentityToken();
        token.PolicyId = overrides.PolicyId;
        obj.setAnonymousIdentityToken( token );
    }
    else if ( needAnonymousToken( securityPolicyUri, session ) ) {
        // Get the anonymous policy description.
        var policy = getUserTokenPolicy( securityPolicyUri, UserTokenType.Anonymous, session, null, messageSecurityMode );
        if ( policy == null ) {
            if( !suppressWarnings ) addWarning( "buildAnonymousIdentityToken - anonymous token policy unavailable" );
            var token = new UaAnonymousIdentityToken();
            token.PolicyId = "Anonymous";
            obj.setAnonymousIdentityToken( token );            
        }
        else {
            var token = new UaAnonymousIdentityToken();
            token.PolicyId = policy.PolicyId;
            obj.setAnonymousIdentityToken( token );
        }
    }
    return obj;
}// function buildAnonymousIdentityToken( overrides )


/**
 * Creates a UserIdentityToken of type X509.
 *
 * @param { UaSession } session - (Required) An instance of the session object the UserIdentityToken should be built for.
 * @param { String } setting - (Required) Controlls which certificate settings to use
 * @param { String } [policyId] - (Optional) The policyId of the desired UserTokenPolicy. When not being provided, the first match will be used.
 * @param { Boolean } [suppressWarnings] - (Optional) Flag that indicates whether a warning should be printed if the policy is not available in the current endpoint. Default is false.
 *
 * @returns X509 UserIdentityToken with the specified details.
 */
function buildUserX509IdentityToken( session, setting, policyId, suppressWarnings ) {
    // check parameters
    if( !isDefined( session ) ) throw( "Session not specified in buildUserX509IdentityToken" );
    if( !isDefined( setting ) ) setting = Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT;

    var obj = new UaExtensionObject();
    var channelSecurityPolicy = "";
    var messageSecurityMode = 0;
    if( isDefined( session.Channel ) && isDefined( session.Channel.RequestedSecurityPolicyUri ) ) {
        channelSecurityPolicy = SecurityPolicy.policyToString( session.Channel.RequestedSecurityPolicyUri );
        messageSecurityMode = session.Channel.MessageSecurityMode;
    }
    else if( isDefined( gServerCapabilities.ConnectedEndpoint ) ) {
        channelSecurityPolicy = gServerCapabilities.ConnectedEndpoint.SecurityPolicyUri;
        messageSecurityMode = gServerCapabilities.ConnectedEndpoint.SecurityMode;
    }
    else {
        var policy = parseInt( readSetting( "/Server Test/Secure Channel/RequestedSecurityPolicyUri" ) );
        var mode = parseInt( readSetting( "/Server Test/Secure Channel/MessageSecurityMode" ) );
        channelSecurityPolicy = SecurityPolicy.policyToString( policy );
        messageSecurityMode = mode;
    }

    // get the x509 certificate loaded and validated
    // begin with a PKI provider
    var pkiProvider = new UaPkiUtility();
    pkiProvider.CertificateTrustListLocation = readSetting( "/Advanced/Certificates/CertificateTrustListLocation" );
    pkiProvider.CertificateRevocationListLocation = readSetting( "/Advanced/Certificates/CertificateRevocationListLocation" );
    pkiProvider.PkiType = PkiType.OpenSSL;
    // load the certificate
    var tokenpolicy = getUserTokenPolicy( channelSecurityPolicy, UserTokenType.Certificate, session, policyId, messageSecurityMode );
    var token = new UaX509IdentityToken();
    if ( tokenpolicy == null ) {
        if( !suppressWarnings ) addWarning( "buildUserX509IdentityToken - X509 token policy unavailable" );
        token.PolicyId = "Certificate";
        obj.setX509IdentityToken( token );       
    }
    else {
        var userCertificate = new UaByteString();
        var uaStatus = null;
        print( "UserX509 certificate for '" + setting.toString() + "' requested." );
        uaStatus = pkiProvider.loadCertificateFromFile( setting, userCertificate );
        if( uaStatus.isBad() ) throw( "Error '" + uaStatus + "' loading UserCertifiate" );
        token.CertificateData = userCertificate;
        token.PolicyId = tokenpolicy.PolicyId;
        // override the policyId?
        if( isDefined( policyId ) ) token.PolicyId = policyId;
        obj.setX509IdentityToken( token );
    }

    return obj;
}// function buildUserX509IdentityToken( session )


/**
 * Creates a UserIdentityToken of type UserNamePassword
 *
 * @param { UaSession } session - (Required) An instance of the session object the UserIdentityToken should be built for.
 * @param { String } username - (Required) The username to be used.
 * @param { String } password - (Required) The password as plain text.
 * @param { Boolean } [doNotAppendNonce] - (Optional) Boolean which identifies whether the server nonce should be appended or not. Default is false.
 * @param { String } [policyId] - (Optional) The PolicyId of the desired UserTokenPolicy. When not being provided, the first match will be used.
 * @param { Boolean } [suppressWarnings] - (Optional) Flag that indicates whether a warning should be printed if the policy is not available in the current endpoint. Default is false.
 *
 * @returns UserIdentityToken with the specified details.
 */
function buildUserNameIdentityToken( session, username, password, doNotAppendNonce, policyId, suppressWarnings ) {
    var obj = new UaExtensionObject();
    var channelSecurityPolicy = "";
    var messageSecurityMode = 0;
    if( isDefined( session.Channel ) && isDefined( session.Channel.RequestedSecurityPolicyUri ) ) {
        channelSecurityPolicy = SecurityPolicy.policyToString( session.Channel.RequestedSecurityPolicyUri );
        messageSecurityMode = session.Channel.MessageSecurityMode;
    }
    else if( isDefined( gServerCapabilities.ConnectedEndpoint ) ) {
        channelSecurityPolicy = gServerCapabilities.ConnectedEndpoint.SecurityPolicyUri;
        messageSecurityMode = gServerCapabilities.ConnectedEndpoint.SecurityMode;
    }
    else {
        var policy = parseInt( readSetting( "/Server Test/Secure Channel/RequestedSecurityPolicyUri" ) );
        var mode = parseInt( readSetting( "/Server Test/Secure Channel/MessageSecurityMode" ) );
        channelSecurityPolicy = SecurityPolicy.policyToString( policy );
        messageSecurityMode = mode;
    }

    // Get the username policy description.
    var tokenPolicy = getUserTokenPolicy( channelSecurityPolicy, UserTokenType.UserName, session, policyId, messageSecurityMode );
    if ( tokenPolicy == null ) {
        if ( !suppressWarnings ) addWarning( "buildUserNameIdentityToken - username token policy unavailable" );
        var token = new UaUserNameIdentityToken();
        var encodedPassword = new UaByteString();
        token.PolicyId = "UserName";
        token.UserName = username;
    }
    else {
        var token = new UaUserNameIdentityToken();
        var encodedPassword = new UaByteString();
        token.PolicyId = tokenPolicy.PolicyId;
        token.UserName = username;

        // Get the security policy for encrypting the password.
        var tokenSecurityPolicy = tokenPolicy.SecurityPolicyUri;
        if ( tokenSecurityPolicy.length == 0 ) {
            // No explicity security policy for encrypting the password. Use the channel's security
            // policy.
            tokenSecurityPolicy = channelSecurityPolicy;
        }
        if ( tokenSecurityPolicy == SecurityPolicy.policyToString( SecurityPolicy.None ) ) {
            print( "buildUserNameIdentityToken - password not encrypted!" );
            encodedPassword.setUtf8FromString( password );
            token.Password = encodedPassword;
        }
        else {
            var plainPassword = new UaByteString();
            var encryptedPassword = new UaByteString();
            var serverNonce = session.ServerNonce;

            // Set the length of the encoded password.
            encodedPassword.setUInt32( password.length + serverNonce.length );

            // Encode the password.
            plainPassword.setUtf8FromString( password );
            encodedPassword.append( plainPassword );

            // Append the server nonce.
            if( doNotAppendNonce === undefined || doNotAppendNonce === null || doNotAppendNonce == false ) {
                if( serverNonce !== undefined && serverNonce !== null && serverNonce.length > 0 ) { 
                    encodedPassword.append( serverNonce );
                }
            }

            addLog( "Requesting user credentials: username='" + username + "'; password='" + password + "'; securityPolicyUri='" + tokenSecurityPolicy + "'; token.PolicyId='" + tokenPolicy.PolicyId + "'; nonceAppended=" + (doNotAppendNonce !== undefined && doNotAppendNonce !== null && doNotAppendNonce === true ? "No": "Yes" ) );
            // Encrypt the encoded password.
            var cryptoProvider = new UaCryptoProvider( SecurityPolicy.policyFromString( tokenSecurityPolicy ) );
            var status = cryptoProvider.asymmetricEncrypt( encodedPassword, gServerCapabilities.ServerCertificate.toDER(), encryptedPassword );
            if ( status.isBad() ) {
                addError( "buildUserNameIdentityToken - error encrypting the password! Status: " + status, status );
            }
            else {
                var algorithms = SecurityAlgorithms.getAlgorithms( SecurityPolicy.policyFromString( tokenSecurityPolicy ) );
                token.Password = encryptedPassword;
                token.EncryptionAlgorithm = algorithms.AsymmetricEncryptionAlgorithm;
            }
        }
    }

    obj.setUserNameIdentityToken( token );
    return obj;
} // function buildUserNameIdentityToken( session, username, password, doNotAppendNonce )