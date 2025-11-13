const CU_NAME = "Security None Application Certificates";

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );

function findAnonymousInEndpoints( epIndex ) {
    var s;
    for( var u=0; u<gServerCapabilities.Endpoints[epIndex].UserIdentityTokens.length; u++ ) {
        if( gServerCapabilities.Endpoints[epIndex].UserIdentityTokens[u].TokenType === UserTokenType.Anonymous ) {
            s = gServerCapabilities.Endpoints[epIndex];
            break;
        }
    }
    return( s );
}


// initialize some endpoints that will be useful to scripts
var epSecureChNone  = null;    // secure channel, no security
var epSecureEncrypt = null;    // secure channel, message encryption
var epSecureEncryptWithoutAnonymous = null;
var epCount = 0;

// find endpoints on the same server but different ports by discovery and add them to server capabilities
var foundEndpoints = [];
Test.Connect();
if( FindServersHelper.Execute() && FindServersHelper.Response.Servers.length > 0 ) {
    for( var i=0; i<FindServersHelper.Response.Servers[0].DiscoveryUrls.length; i++ ) {
        GetEndpointsHelper.Execute2( { EndpointUrl: FindServersHelper.Response.Servers[0].DiscoveryUrls[i] } );
        if( isDefined( GetEndpointsHelper.Response.Endpoints ) ) {
            for( var j=0; j<GetEndpointsHelper.Response.Endpoints.length; j++ ) {
                foundEndpoints.push( GetEndpointsHelper.Response.Endpoints[j] );
            }
        }
    }
}
else addWarning( "Failed to call FindServers. Endpoints on a port other than the one set in the Server URL in the CTT settings might not be taken into account for testing in this conformance unit." );
if( foundEndpoints.length > 0 ) gServerCapabilities.Endpoints = foundEndpoints;
if( gServerCapabilities.Endpoints.length === 0 ) gServerCapabilities.GetServerCapabilties( Test.Session );
Test.Disconnect();

for ( var e = 0; e < gServerCapabilities.Endpoints.length; e++ ) {
    var tmpEndpoint = null;
    // We are not interested in the HTTP protocol, so filter those out.
    var strEndpoint = gServerCapabilities.Endpoints[e].EndpointUrl;
    if( strEndpoint.substring( 0, 4 ) == "http" ) continue;
    // find an endpoint with no message security 
    if( gServerCapabilities.Endpoints[e].SecurityMode === MessageSecurityMode.None ) {
        epSecureChNone = findAnonymousInEndpoints( e );
        if( isDefined( epSecureChNone ) ) epCount += epSecureChNone.UserIdentityTokens.length;
    }
    // find a secure endpoint, with username/password
    if ( gServerCapabilities.Endpoints[e].SecurityMode === MessageSecurityMode.SignAndEncrypt ) {
        tmpEndpoint = findAnonymousInEndpoints( e );
        if ( isDefined( tmpEndpoint ) ) {
            epCount += tmpEndpoint.UserIdentityTokens.length;
            epSecureEncrypt = gServerCapabilities.Endpoints[e];
        }
        else epSecureEncryptWithoutAnonymous = gServerCapabilities.Endpoints[e];
    }
}
// check that we have an endpoing we can use
if( epCount === 0 ) addSkipped( "No Anonymous user identity tokens found for Endpoint: " +  readSetting( "/Server Test/Server URL" ).toString()  + ". Aborting test." );

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );