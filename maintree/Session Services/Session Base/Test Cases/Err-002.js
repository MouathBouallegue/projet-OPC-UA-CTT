/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify invalid information so as to check the contents of the DiagnosticInfo parameter. Send a ClientNonce that is less than 32 bytes.
        Server should populate the diagnostic info with pertinent information that outlines the cause of a failure. Service result is Bad_InvalidNonce. */

function createSession561Err002() {
    if( !isDefined( epSecureEncrypt ) ) {
        addSkipped( SKIP_NOSECUREENDPOINT );
        return( false );
    }
    // establish a secure connection to the server
    Test.Disconnect();
    Test.Channel.Execute({ RequestedSecurityPolicyUri: epSecureEncrypt.SecurityPolicyUri, MessageSecurityMode: epSecureEncrypt.SecurityMode });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epSecureEncrypt.EndpointUrl })) {
        addError("Can't connect the secure channel to the server, therefore no sessions can be established. Aborting.");
        addError("TIP: Check the UACTT is a trusted application! The certificate is defined in setting: 'Settings/Certificates/ApplicationInstanceCertificates/ctt_appT'.");
        return (false);
    }
    CloseSessionHelper.Execute({ Session: Test.Session });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    Test.Session.Execute({ ServiceResult: new ExpectedAndAcceptedResults(StatusCode.BadNonceInvalid), ClientNonce: "1234567890123456", ReturnDiagnostics: 0xfff });
    // close the secure channel/session
    CloseSessionHelper.Execute({ Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults(StatusCode.BadSessionIdInvalid) });

    // open a new [default] channel
    Test.Disconnect();
    Test.Connect( { SkipCreateSession: true } );
    return( result );
}

Test.Execute( { Procedure: createSession561Err002 } );