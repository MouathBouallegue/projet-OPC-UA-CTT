/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Activate a session using an invalid certificate */

function securityx509_009() {
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = false;
    if (!Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTSincorrect } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
                                              CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTSincorrect } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenRejected ) } ) ) {
        result = true;
    }
    CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                    ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] ) } );
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: securityx509_009 } );
