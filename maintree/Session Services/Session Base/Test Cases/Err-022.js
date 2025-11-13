/*  Test prepared by compliance@opcfoundation.org
    Description: Over a secure channel; call ActivateSession() specifying an empty ClientSignature. */

function activateSession562err022() {
    // Check whether secure channel exists. If not, return.
    if (epSecureEncrypt === null) {
        addSkipped("A secure channel is not available.");
        return (false);
    }
    var result = true;
    Test.Disconnect();
    Test.Channel.Execute({ RequestedSecurityPolicyUri: epSecureEncrypt.SecurityPolicyUri, MessageSecurityMode: epSecureEncrypt.SecurityMode });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if (!Test.Session.Execute({ EndpointUrl: epSecureEncrypt.EndpointUrl })) {
        addError("Can't connect the channel to the server, therefore no sessions can be established. Aborting.");
        return (false);
    }
    else {
        // we expect the call to succeed
        if ((ActivateSessionHelper.Execute({
            Session: Test.Session,
            UserIdentityToken: UaUserIdentityToken.FromUserCredentials({
                Session: Test.Session,
                UserCredentials: new UserCredentials({
                    policy: UserTokenType.Anonymous
                })
            }),
            ClientSignature: null,
            ServiceResult: new ExpectedAndAcceptedResults(StatusCode.BadApplicationSignatureInvalid)
        }))) {
            CloseSessionHelper.Execute({ Session: Test.Session });
        }
        else result = false;
    }

    Test.Disconnect();
    Test.Connect( { SkipCreateSession: true } );
    return (result);
}

Test.Execute({ Procedure: activateSession562err022 });
