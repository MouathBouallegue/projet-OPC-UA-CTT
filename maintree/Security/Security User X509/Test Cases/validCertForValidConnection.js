/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Specify a valid/trusted user certificate and server-specified policyId. */

function securityx509_001() {
    addLog( "Make sure UserX509 certificate is TRUSTED. See setting '/Advanced/Certificates/UserCertificate'" );
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = true;
    if( !Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return( false );
    ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } )
        } ),
        UserTokenSignature: UaSignatureData.New( {
            Session: Test.Session,
            RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri
        } )
    } )
    if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.StatusCode != StatusCode.Good ) {
        result = false;
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}
  
Test.Execute( { Procedure: securityx509_001 } );