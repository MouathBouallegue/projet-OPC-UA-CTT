/* Includes:
    UaX509IdentityToken.New = function( args ) 
*/

/* Returns a new X509 user identity token object already encoded as ExtensionObject.
   Parameters include:
    - PolicyId [required]            - policy id for crypto provider to use
    - CertificateData [optional]     - certificate data to pre-populate into the object
    - CertificateSetting [optional]  - certificate setting to load for pki-provider */
UaX509IdentityToken.New = function( args ) {
    var uidToken = new UaX509IdentityToken();
    if( isDefined( args ) ) {
        // policy id
        if( isDefined( args.PolicyId ) ) uidToken.PolicyId = args.PolicyId;
        // certificate data
        if( isDefined( args.CertificateData ) ) uidToken.CertificateData = args.CertificateData;
        else {
            // prepare a pki provider for loading the certificate
            var pkiProvider = new UaPkiUtility();
            pkiProvider.CertificateTrustListLocation = readSetting( "/Advanced/Certificates/CertificateTrustListLocation" );
            pkiProvider.CertificateRevocationListLocation = readSetting( "/Advanced/Certificates/CertificateRevocationListLocation" );
            pkiProvider.PkiType = PkiType.OpenSSL;

            // settings that outline the certificate-data to embed... set to TRUSTED, by default
            if( !isDefined( args.CertificateSetting ) ) args.CertificateSetting = Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT;
            var userCertificate = new UaByteString();
            var uaStatus = null;
            print( "UserX509 certificate for setting '" + args.Setting + "' requested." );
            uaStatus = pkiProvider.loadCertificateFromFile( args.CertificateSetting, userCertificate );

            if( uaStatus.isBad() ) throw( "Error '" + uaStatus + "' loading UserCertifiate" );
            else uidToken.CertificateData = userCertificate;
        }
    }
    var obj = new UaExtensionObject();
    obj.setX509IdentityToken( uidToken );
    return( obj );
}