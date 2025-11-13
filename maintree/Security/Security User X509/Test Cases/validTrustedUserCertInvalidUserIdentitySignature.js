/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Specify a valid/trusted user certificate and provide an invalid UserIdentitySignature.
    Expectation: The server rejects the activation of the session.
                 In a secure conversation the server can provide the detailed ServiceResult = BadUserSignatureInvalid
                 In a unsecure conversation the server can mask the ServiceResult by either returning BadIdentityTokenInvalid or BadIdentityTokenRejected
*/

function securityx509_017() {
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = false;
    if ( !Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return ( false );
    if ( ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT
        } ),
        UserTokenSignature: UaSignatureData.New( {
            Session: Test.Session,
            RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrT
        } ),
        ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadUserSignatureInvalid, StatusCode.BadIdentityTokenInvalid, StatusCode.BadIdentityTokenRejected] )
    } ) ) {
        result = true;
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return ( result );
}

Test.Execute( { Procedure: securityx509_017 } );
