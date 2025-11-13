/*  Test prepared Ing.-Büro Allmendinger; info@allmendinger.de
    Description: Activate a session using an issued, trusted X509 user certificate of a ca not trusted but known. */

function securityx509_013() {
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = true;
    if( !Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return( false );
    ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrT
        } ),
        UserTokenSignature: UaSignatureData.New( {
            Session: Test.Session,
            RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrT
        } ),
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good ] )
    } )
    if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.StatusCode != StatusCode.Good ) {
        result = false;
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: securityx509_013 } );