/*  Test 2; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Call GetEndpoints to locate an secure endpoint that allows for anonymous logon. Establish a session via an insecure channel.
    Expectation: Connection permitted.
        IMPORTANT: This script uses the Login Name and Password defined in the CTT Settings. */

Test.Execute( { Procedure: function test() {
    // is the global variable "epSecureChNone" null? if so then we can't run
    if( epSecureEncrypt === null ) { addSkipped( "A secure channel is not available for use with an Anonymous UserIdentityToken." ); return( false ); }
    var result = true;
    if( Test.Connect( { OpenSecureChannel: { RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
                                             MessageSecurityMode: epSecureEncrypt.SecurityMode, ServerUrl: epSecureEncrypt.EndpointUrl }, SkipActivateSession: true } ) ) {
        if( !ActivateSessionHelper.Execute( { Session: Test.Session,
                                              UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                                  Session: Test.Session.Session,
                                                  SignatureAlgorithm: UaUserIdentityToken.FindSecurityPolicyUri( {
                                                      UserTokenType: UserTokenType.Anonymous, 
                                                      UserIdentityTokens: epSecureEncrypt.UserIdentityTokens } ),
                                                  UserCredentials: new UserCredentials( { Policy: UserTokenType.Anonymous } ) } ) } ) ) result = false;
        else Test.Disconnect();
    }
    return( result );
} } );