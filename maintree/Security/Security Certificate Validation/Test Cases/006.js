/*  Test 6; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description:
        Attempt a secure session and send a revoked certificate.
    Expectation: 
        ServiceResult = Bad_CertificateRevoked
    This test script is no longer available. Please use the updated test script 038.
*/

function certificateValidation006() {
    // do we have a revoked certificate to work with?
    var revokedCert = Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTR;
    if( revokedCert === undefined || revokedCert === null || revokedCert === "" ) {
        addSkipped( "Revoked Certificate not configured within the settings." );
        return( false );
    }
    if( epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available." );
        return( false );
    }

    g_channel = new UaChannel();
    Test.Session.Session = new UaSession( g_channel );
    Test.Session.Session.DefaultTimeoutHint = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ) );
    var channelOverrides = new SecureChannelOverrides( {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode
        } );
    if( !connectChannel( g_channel, readSetting( "/Server Test/Server URL" ).toString(), channelOverrides ) ) {
        addError( "Can't connect the insecure channel to the server, therefore no sessions can be established. Aborting." );
        return( false );
    }
    else {
        // create the session
        var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed );
        var overrides = new CreateSessionOverrides( { CertificateFile: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTR } );
        Assert.True( createSession( Test.Session.Session, expectedResults, overrides ), "Did NOT expect the session to open because we sent a REVOKED ClientCertificate.\nMake sure Server is configured to use the CTT CA (file: /pki/ca/certs/ctt_ca1T.der) and revocation list (file: /pki/ca/crl/ctt_ca1T.crl)\n" );

        // close the session, we don't care if it passes/fails
        expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
        expectedResults.addExpectedResult( StatusCode.BadSessionClosed );
        expectedResults.addExpectedResult( StatusCode.Good );
        closeSession( Test.Session.Session, expectedResults );
    }

    // clean-up
    Test.Session.Session = null;
    g_channel = null;
}

safelyInvoke( certificateValidation006 );