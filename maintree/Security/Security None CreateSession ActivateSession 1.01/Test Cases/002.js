/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Client specifies an expired certificate during connection even with no security! */

Test.Execute( {
    Procedure: function test() {
        if( !isDefined( insecureEp ) ) { addSkipped( "No insecure endpoint found, can't execute test case." ); }
        var result = true;
        Test.Connect( {
            OpenSecureChannel: {
                RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( insecureEp.SecurityPolicyUri ),
                MessageSecurityMode: insecureEp.SecurityMode,
                ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTE,
                ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTEPrivateKey,
                ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed, StatusCode.Good )
            },
            SkipCreateSession: true
        } );
        if( Test.Channel.UaStatus.StatusCode == StatusCode.BadSecurityChecksFailed ) {
            result = false;
            addError( "When using SecurityPolicy None the server is not allowed to validate the sent certificate but needs to accept the connection for backward compatibility." );
        }

        // did the server return a certificate?
        if( Test.Channel.Channel.ServerCertificate.length > 0 ) addLog( "Server return a Certificate which is not necessary, but acceptable for backward compatibility." );
        Test.Disconnect( { SkipCloseSession: true } );
        return ( result );
    }
} );