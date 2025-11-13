/*  Test prepared by compliance@opcfoundation.org
    Description: Over a non-secure channel; call ActivateSession() specifying an empty ClientSignature. */

function noneAnonymousErr001() {
    // Check whether non-secure channel exists. If not, return.
    if (epSecureChNone === null) {
        addSkipped("An insecure channel is not available.");
        return (false);
    }
    var result = true;
    Test.Disconnect();
    Test.Channel.Execute({ RequestedSecurityPolicyUri: SecurityPolicy.None, MessageSecurityMode: MessageSecurityMode.None, ServerUrl: epSecureChNone.EndpointUrl });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epSecureChNone.EndpointUrl })) {
        addError("Can't connect the channel to the server, therefore no sessions can be established. Aborting.");
        return (false);
    }
    else {
        // now generate a ClientSignature
        var CreatedClientSignature = new UaSignatureData();
        // as it is supposed to be ignored anyhow we calculate everything based on our own certificates
        var algorithms = SecurityAlgorithms.getAlgorithms(SecurityPolicy.Basic256Sha256);
        CreatedClientSignature.Algorithm = algorithms.AsymmetricSignatureAlgorithm;
        var data = Test.Session.Channel.Channel.ClientCertificate.clone();
        data.append(Test.Session.Session.ServerNonce);
        // sign the data
        var cryptoProvider = new UaCryptoProvider(SecurityPolicy.Basic256Sha256);
        CreatedClientSignature.Signature.length = cryptoProvider.MaximumAsymmetricKeyLength
        uaStatus = cryptoProvider.asymmetricSign(data, Test.Session.Channel.Channel.ClientPrivateKey, CreatedClientSignature.Signature);
        if (uaStatus.isBad()) addError("ActivateSession() asymmetricSign status " + uaStatus, uaStatus);
        // we expect the call to succeed
        if ((ActivateSessionHelper.Execute({
            Session: Test.Session,
            UserIdentityToken: UaUserIdentityToken.FromUserCredentials({
                Session: Test.Session,
                UserCredentials: new UserCredentials({
                    policy: UserTokenType.Anonymous
                })
            }),
            ClientSignature: CreatedClientSignature,
            ServiceResult: new ExpectedAndAcceptedResults(StatusCode.Good)
        }))) {
            CloseSessionHelper.Execute({ Session: Test.Session });
        }
        else result = false;
    }

    Test.Disconnect();
    return (result);
}

Test.Execute({ Procedure: noneAnonymousErr001 });
