/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Activate a session using not-yet-valid X509 user certificate. */

function securityx509_004() {
    Test.Channel.Execute( { RequestedSecurityPolicyUri: ( _endpoint_userx509.SecurityPolicyUri ), MessageSecurityMode: _endpoint_userx509.SecurityMode } );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    var result = false;
    var disabledInSettings = Settings.Advanced.CertificateOverrides.TimeInvalid;
    if( !Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) return( false );
    ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTV
        } ),
        UserTokenSignature: UaSignatureData.New( {
            Session: Test.Session,
            RequestedSecurityPolicyUri: _endpoint_userx509_token.SecurityPolicyUri,
            CertificateSetting: Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTV
        } ),
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenRejected, StatusCode.Good )
    } )
    if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.StatusCode == StatusCode.Good ) {
        if( disabledInSettings != 0 ) {
            addWarning( "DisableCertificateTimeInvalid is set in the CTT Settings. The connection was granted by the server which is the correct behaviour with this setting set.\nMake sure that the server is configured to suppress errors caused by invalid time periods.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = true;
        }
        else {
            result = false;
            addError( "DisableCertificateTimeInvalid is not set in the CTT Settings but the connection was granted by the server.\nMake sure that the server is configured to suppress errors caused by invalid time periods and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
        }
    }
    if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadIdentityTokenRejected ) {
        if( disabledInSettings != 0 ) {
            addError( "DisableCertificateTimeInvalid is set in the CTT Settings but the server rejected the connection.\nMake sure that the server is configured to suppress errors caused by invalid time periods and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = false;
        }
        else {
            result = true;
        }
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: securityx509_004 } );