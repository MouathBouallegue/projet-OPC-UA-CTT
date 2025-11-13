/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Using SecurityPolicy None/anonymous, create a session while specifying a not-trusted certificate.
    Expectation: Server accepts the connection because it ignores the certificate.
    */

function test() {
    var result = true;
    if( epSecureChNone === null ) {
        addSkipped( "An unsecure channel is not available. Skipping test." );
        return ( false );
    }
    Test.Disconnect();
    if( !Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureChNone.SecurityPolicyUri ),
            MessageSecurityMode: epSecureChNone.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appU,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appUPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
            ProvideCertificate: true
        },
        CreateSession: {
            CertificateFile: "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appU",
            ForceClientCertificate: true,
            ClientNonce: Nonce.Next( 32 )
        },
        SkipCreateSession: false
    } ) ) {
        result = false;
    }

    Test.Disconnect();
    Test.Connect( { SkipCreateSession: true } );
    return ( result );
}

Test.Execute( { Procedure: test } );