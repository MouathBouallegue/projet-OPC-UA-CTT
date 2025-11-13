const CU_NAME = "Security User X509";

var _endpoint_userx509_token = null;


include( "./library/ServiceBased/Helpers.js" );


// check the x509 user policy exists at the server
function x509policyExists() {
    _endpoint_userx509_token = UaEndpointDescription.FindTokenType({ Endpoint: gServerCapabilities.ConnectedEndpoint, TokenType: UserTokenType.Certificate });
    if (_endpoint_userx509_token == null) {
        for (var e = 0; e < gServerCapabilities.Endpoints.length; e++) {    // iterate thru each endpoint (currently cached)
            uaed = UaEndpointDescription.FindTokenType({ Endpoint: gServerCapabilities.Endpoints[e], TokenType: UserTokenType.Certificate });
            if (uaed !== null) {
                _endpoint_userx509_token = uaed;
                _endpoint_userx509 = gServerCapabilities.Endpoints[e];
                return (true);
            }
        }//for e..
        addSkipped("No X509 User policy found in the the Server's list of endpoints.");
        return (false);
    }
    _endpoint_userx509 = gServerCapabilities.ConnectedEndpoint;
    return (true)
}


// make sure the settings are good
if( !Assert.GreaterThan( 0, Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT.length, "UserX509 setting '/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrT' is not configured" ) ) stopCurrentUnit();
else {
    // Connect to the server
    if( Test.Connect( { SkipCreateSession: true } ) && x509policyExists() ) {
        Test.Disconnect( { SkipCloseSession: true } );
        Test.Channel.Execute( { RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri, MessageSecurityMode: _endpoint_userx509.SecurityMode } );
        Test.Session = new CreateSessionService( { Channel: Test.Channel } );
        if( Test.Session.Execute( { EndpointUrl: _endpoint_userx509.EndpointUrl } ) ) {
            CloseSessionHelper.Execute( {
                Session: Test.Session.Session,
                ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] )
            } );
        }
        else {
            addError( "Failed to create session. Aborting CU." );
            stopCurrentUnit();
        }
        Test.Disconnect( { SkipCloseSession: true } );
        //

        print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );
    }
    else {
        stopCurrentUnit();
    }
}
