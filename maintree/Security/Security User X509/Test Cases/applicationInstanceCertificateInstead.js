/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Activate a session using an application instance certificate in place of a user certificate */

function securityx509_007() {
    Test.Channel.Execute({ RequestedSecurityPolicyUri: (_endpoint_userx509.SecurityPolicyUri), MessageSecurityMode: _endpoint_userx509.SecurityMode});
    Test.Session = new CreateSessionService({ Channel: Test.Channel });
    var result = false;
    if (!Test.Session.Execute({ EndpointUrl: _endpoint_userx509.EndpointUrl }) ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appT } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
                                              CertificateSetting: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appT } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadIdentityTokenInvalid, StatusCode.BadIdentityTokenRejected, StatusCode.BadCertificateUseNotAllowed] ) } ) ) {
                                          result = true;
    }
    CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                                               ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] ) } );
    Test.Disconnect({ SkipCloseSession: true });
    return( result );
}

Test.Execute( { Procedure: securityx509_007 } );
