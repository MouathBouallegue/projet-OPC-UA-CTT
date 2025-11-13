/*  Test prepared by compliance@opcfoundation.org
    Description: Over a non-secure channel; call ActivateSession() specifying an empty ClientSignature. */

function activateSession562err007() {
    // Check whether non-secure channel exists. If not, return.
    if( gServerCapabilities.Endpoints.length > 0 ) {
        var epSecureChNoneAnonymous = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.None, TokenType: UserTokenType.Anonymous, FilterHTTPS: true, MostSecure: false } );
        if( !isDefined( epSecureChNoneAnonymous ) ) {
            addSkipped( "No insecure endpoint permitting the UserTokenType Anonymous detected." );
            return ( false );
        }
    }
    var result = true;
    Test.Disconnect();
    Test.Channel.Execute({ RequestedSecurityPolicyUri: SecurityPolicy.None, MessageSecurityMode: MessageSecurityMode.None });
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    if( !Test.Session.Execute( { EndpointUrl: epSecureChNoneAnonymous.EndpointUrl } ) ) {
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
            ServiceResult: new ExpectedAndAcceptedResults(StatusCode.Good)
        }))) {
            print( "Connection attempt was successful as expected." );
        }
        else result = false;
    }
    CloseSessionHelper.Execute( { Session: Test.Session, ExpectedAndAcceptedResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] ) } );
    Test.Disconnect();
    Test.Connect( { SkipCreateSession: true } );
    return (result);
}

Test.Execute( { Procedure: activateSession562err007 } );
