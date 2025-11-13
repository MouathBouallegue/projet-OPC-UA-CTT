const CU_NAME = "Security None CreateSession ActivateSession 1.01";

include( "./library/ServiceBased/Helpers.js" );

// test the connection and then check the endpoints to make sure an insecure channel is possible
if( Test.Connect( { SkipCreateSession: true } ) ) {
    // we need to make sure that we have an insecure endpoint to be able to use:
    var insecureEp = UaEndpointDescription.FindSecurityMode( { MessageSecurityMode: MessageSecurityMode.None, Endpoints: gServerCapabilities.Endpoints } );
    if( insecureEp == null ) {
        notSupported( "No insecure endpoints found. Skipping conformance unit testing." );
        stopCurrentUnit();
    }
    else print( "Found insecure endpoint: " + insecureEp.EndpointUrl + "; SecurityMode: " + insecureEp.SecurityMode + "; SecurityPolicyUri: " + insecureEp.SecurityPolicyUri );
    // close the channel; we won't need it
    Test.Disconnect( { SkipCloseSession: true } );
}
else stopCurrentUnit();


print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );