/* Includes:
    UaUserIdentityToken.FindSecurityPolicyUri()
    UaUserIdentityToken.FromUserCredentials( userCredential )
    UaUserIdentityToken.GetPolicyId( args )
    UserAccessLevel enumeration
    UserAccessLevel.toString( byteValue )
    UserAccessLevel.toEnum( byteValue )
*/
UserAccessLevel = {
    None:         0,
    CurrentRead:  1,
    CurrentWrite: 2, 
    HistoryRead:  4,
    HistoryWrite: 8,
    Reserved4:    16,
    Reserved5:    32,
    Reserved6:    64,
    Reserved7:    128 };
UserAccessLevel.toString = function( byteValue ) {
    var s = "";
    for( var i in UserAccessLevel ) {
        if( ! ( typeof( UserAccessLevel[i] ) === "function" ) ) {
            if( UserAccessLevel[i] & byteValue ) s += s.length > 0? "+" + i : i;
        }
    }
    return( s );
}

/* Returns a UserIdentityToken object, based on the UserCredentials specified. (see /library/Base/identity.js) */
UaUserIdentityToken.FromUserCredentials = function( args ) {
    if( !isDefined( args ) ) throw( "UaUserIdentityToken.FromUserCredentials() args not specified." );
    if( !isDefined( args.Session ) ) throw( "UaUserIdentityToken.FromUserCredentials() Session not specified." );
    if( !isDefined( args.UserCredentials ) ) throw( "UaUserIdentityToken.FromUserCredentials() UserCredentials not specified." );
    if( !isDefined( args.CertificateSetting ) ) args.CertificateSetting = Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT;
    if( !isDefined( args.SuppressWarnings ) ) args.SuppressWarnings = false;
    var userIdToken = null;
    switch ( args.UserCredentials.Policy ) {
        case UserTokenType.Anonymous: 
            userIdToken = buildAnonymousIdentityToken( args.Session, { PolicyId: args.PolicyId }, args.SuppressWarnings );
            break;
        case UserTokenType.UserName:
            var uname = args.UserCredentials.UserName;
            var upass = args.UserCredentials.Password;
            var noNnc = isDefined( args.UserCredentials.NoNonceAppended )? args.UserCredentials.NoNonceAppended : false;
            var session = isDefined( args.Session.Session )? args.Session.Session : args.Session;
            userIdToken = buildUserNameIdentityToken( session, uname, upass, noNnc, undefined, args.SuppressWarnings );
            // prepare any overrides that may be necessary for the token, e.g. encryption, policyUri.
            var tmp = userIdToken.toUserNameIdentityToken();
            if( isDefined( args.EncryptionAlgorithm ) ) tmp.EncryptionAlgorithm = args.EncryptionAlgorithm;
            if( isDefined( args.PolicyId ) ) tmp.PolicyId = args.PolicyId;
            userIdToken = new UaExtensionObject();
            userIdToken.setUserNameIdentityToken( tmp );
            break;
        case UserTokenType.Certificate:
            userIdToken = buildUserX509IdentityToken( args.Session.Session, args.CertificateSetting, args.PolicyId, args.SuppressWarnings );
            break;
        case UserTokenType.IssuedToken:
            throw( "UserTokenType.IssuedToken NOT YET SUPPORTED in the UACTT." );
            break;
    }
    return( userIdToken );
}
// Returns the PolicyId from a UserIdentityToken object (ExtensionObject)
UaUserIdentityToken.GetPolicyId = function( userIdentityToken ) {
    if( userIdentityToken === undefined || userIdentityToken === null ) return( "not specified" );
    // make sure an extension object
    if( userIdentityToken.setAnonymousIdentityToken === undefined ) return( "not a UserIdentityToken" );
    // is this anonymous?
    var anonIds = [ Identifier.AnonymousIdentityToken, Identifier.AnonymousIdentityToken_Encoding_DefaultXml, Identifier.AnonymousIdentityToken_Encoding_DefaultBinary ];
    for( var i=0; i<anonIds.length; i++ ) {
        if( userIdentityToken.TypeId.NodeId.equals( new UaNodeId( anonIds[i] ) ) ) {
            var anon = userIdentityToken.toAnonymousIdentityToken();
            return( anon.PolicyId );
        }
    }
    // username?
    var userIds = [ Identifier.UserNameIdentityToken, Identifier.UserNameIdentityToken_Encoding_DefaultXml, Identifier.UserNameIdentityToken_Encoding_DefaultBinary ];
    for( var i=0; i<userIds.length; i++ ) {
        if( userIdentityToken.TypeId.NodeId.equals( new UaNodeId( userIds[i] ) ) ) {
            var user = userIdentityToken.toUserNameIdentityToken();
            return( user.PolicyId );
        }
    }
    // x509?
    var x509Ids = [ Identifier.X509IdentityToken, Identifier.X509IdentityToken_Encoding_DefaultXml, Identifier.X509IdentityToken_Encoding_DefaultBinary ];
    for( var i=0; i<x509Ids.length; i++ ) {
        if( userIdentityToken.TypeId.NodeId.equals( new UaNodeId( x509Ids[i] ) ) ) {
            var x509 = userIdentityToken.toX509IdentityToken();
            return( x509.PolicyId );
        }
    }
    return( "unknown??" );
}

// searches through an array of UserIdentityTokens for the policy of a specific type of token
// args:
//  UserIdentityTokens
//  UserTokenType
UaUserIdentityToken.FindSecurityPolicyUri = function( args ) {
    if( args == undefined || args == null ) return( null );
    if( args.UserTokenType == undefined || args.UserTokenType == null ) return( null );
    if( args.UserIdentityTokens == undefined || args.UserIdentityTokens == null || args.UserIdentityTokens.length == undefined || args.UserIdentityTokens.length == null || args.UserIdentityTokens.length == 0 ) return( null );
    if( args.UserTokenType < UserTokenType.Anonymous || args.UserTokenType > UserTokenType.IssuedToken ) return( null );
    for( var i=0; i<args.UserIdentityTokens.length; i++ ) {
        if( args.UserIdentityTokens[i].TokenType == args.UserTokenType ) return( args.UserIdentityTokens[i].SecurityPolicyUri );
    }//for i...
    return( null );
}