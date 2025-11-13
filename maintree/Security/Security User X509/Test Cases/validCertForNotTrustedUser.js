/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Activate a session using untrusted X509 user certificate. */

function securityx509_002() {
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = true;
    if( !Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return( false );
    ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrU
        } ),
        UserTokenSignature: UaSignatureData.New( {
            Session: Test.Session,
            RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrU
        } ),
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenRejected )
    } )
    if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.StatusCode != StatusCode.BadIdentityTokenRejected ) {
        result = false;
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: securityx509_002 } );