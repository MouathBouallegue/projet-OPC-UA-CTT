const CU_NAME = "Security Certificate Validation";
include( "./library/Base/safeInvoke.js" );

var epSecureChNone, epSecureEncrypt;        // endpoints to use within this CU
    
function initSecurityNone() {
    if( !Test.Connect( { SkipCreateSession: true } ) ) stopCurrentUnit();    // make sure we can connect to the server
    else Test.Disconnect( { SkipCloseSession: true } );                      // if connection success, then close the connection.

    epSecureChNone  = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.None, FilterHTTPS: true } );
    epSecureEncrypt = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, FilterHTTPS: true, MostSecure: true } );

    if( epSecureChNone  === null ) addSkipped( "No insecure endpoints available." );
    if( epSecureEncrypt === null ) addSkipped( "No secure endpoints available." );

    print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );
}

initSecurityNone();