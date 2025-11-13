/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Open an unsecure SecureChannel and create a Session using SecurityPolicy#None.
    Prerequirement: The server does not provide an endpoint for SecurityPolicy#None.
    Expectation: The server rejects the creation of the session. ServiceResult = Bad_SecurityPolicyRejected.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    // If the server provides an endpoint for SecurityPolicy#None, then we have to skip this test case
    if( isDefined( gServerCapabilities.Endpoints ) && gServerCapabilities.Endpoints.length > 0 ) {
        TC_Variables.EndpointSecurityPolicyNone = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.None, FilterHTTPS: true } );
    }
    if( !isDefined( TC_Variables.EndpointSecurityPolicyNone ) ) {
        TC_Variables.Channel = new OpenSecureChannelService();
        if( TC_Variables.Channel.Execute( { RequestedSecurityPolicyUri: SecurityPolicy.None, MessageSecurityMode: MessageSecurityMode.None } ) ) {
            TC_Variables.Session = new CreateSessionService( { Channel: TC_Variables.Channel } );
            if( !TC_Variables.Session.Execute( { ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityPolicyRejected ) } ) ) {
                TC_Variables.Result = false;
            }
            if( TC_Variables.Session.Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.Good ) {
                CloseSessionHelper.Execute( { Session: TC_Variables.Session.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
            }
            CloseSecureChannelHelper.Execute( { Channel: TC_Variables.Channel.Channel } );
        }
        else {
            addSkipped( "Unable to open an unsecure SecureChannel. Abort test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "This test case requires that the server does not provide an endpoint for SecurityPolicy#None. An unsecure endpoint has been found, therefore skipping this test case." );
    }
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: test } );
