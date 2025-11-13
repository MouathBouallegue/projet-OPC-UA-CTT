/*  Test prepared by Development; compliance@opcfoundation.org
    Description: Send an invalid (too short) client nonce. Receiving a Bad_NonceIdInvlalid. */

function createSession561Err005() {
    if (!isDefined(epSecureEncrypt)) {
        addSkipped(SKIP_NOSECUREENDPOINT);
        return (false);
    }
    var result = true;
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
    Test.Session.Execute({ ServiceResult: new ExpectedAndAcceptedResults(StatusCode.BadNonceInvalid), ClientNonce: UaCryptoProvider.createRandomData(8) });
    if (Test.Session.Response.ResponseHeader.ServiceResult.StatusCode !== StatusCode.BadNonceInvalid) addError("CreateSession.Response.ResponseHeader.ServiceResult SHOULD be BadNonceInvalid because we specified a Nonce that is not 32-characters long. Nonce used in test: " + Test.Session.Request.ClientNonce);
    else result = false;
    // open a new [default] channel
    Test.Disconnect();
    Test.Connect( { SkipCreateSession: true } );
    return (result);
}

Test.Execute( { Procedure: createSession561Err005 } );