/*  Test 3; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Call GetEndpoints to locate a secure endpoint that does not allow for anonymous logon. Establish a session via an insecure channel.
    Expectation: Connection permitted.
    IMPORTANT: This script will exit gracefully if no endpoints are available that do not support anonymous. */

function noneAnonymous003() {
    // is the global variable "epSecureEncrypt" null? if so then we can't run
    if ( !isDefined( epSecureEncryptWithoutAnonymous ) ) {
        addSkipped( "No endpoints found that do NOT support anonymous user identity token. All secure endpoints seem to allow for Anonymous. Aborting test." );
        return ( false );
    }
    if( Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncryptWithoutAnonymous.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncryptWithoutAnonymous.SecurityMode,
            ServerUrl: epSecureEncryptWithoutAnonymous.EndpointUrl
        }, SkipActivateSession: true
    } ) ) {
        if( !ActivateSessionHelper.Execute( {
            Session: Test.Session,
            UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                Session: Test.Session.Session,
                UserCredentials: new UserCredentials( { Policy: UserTokenType.Anonymous } )
            } ),
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenRejected, StatusCode.BadIdentityTokenInvalid )
        } ) ) result = false;
        Test.Disconnect();
    }
    return ( result );
}

Test.Execute( { Procedure: noneAnonymous003 } );