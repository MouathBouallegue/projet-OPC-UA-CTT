const CU_NAME = "Security None CreateSession ActivateSession";

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/Helpers.js" );

// Some functions useful to this CU
// this function searches the endpoints found in GETENDPOINTS to searches a specific response 
// entry (as defined by epIndex) for a UserIdentityToken of type UsernamePassword
function findTokenTypeInEndpoints( epIndex, tokenType ) {
    var s = null;
    for( var u=0; u<gServerCapabilities.Endpoints[epIndex].UserIdentityTokens.length; u++ ) {
        if( gServerCapabilities.Endpoints[epIndex].UserIdentityTokens[u].TokenType === tokenType ) {
            s = gServerCapabilities.Endpoints[epIndex];
            break;
        }
    }
    return( s );
}


function showCreateSessOptionalResponses( response ) {
    var s = "Upon creating the session, the return of optional parameters was:\n\tServerNonce: "
    s += ( response.ServerNonce.length >= 32 )? "Yes" : "No";
    s += "\n\tServerCertificate: ";
    s += ( response.ServerCertificate.length > 0 )? "Yes" : "No";
    addLog( s );
}

/* Step one: Get the list of Endpoints from the server.
             We need to find the identityToken for username/password that the server exposes so that 
             we may provide it to the server when we provide our credentials */


// initialize some endpoints that will be useful to scripts
var epSecureChNone  = null;    // secure channel, no security
var epSecureChNone_Anonymous  = null;
var epSecureChNone_UserName  = null;
var userCredentials = null;
var authenticationType = "Anonymous";

if( gServerCapabilities.Endpoints.length === 0 ) {
    if( !Test.Connect( { SkipCreateSession: true } ) ) stopCurrentUnit();
}

for( var e=0; e<gServerCapabilities.Endpoints.length; e++ ) {
    // We are not interested in the HTTP protocol, so filter those out.
    var strEndpoint = gServerCapabilities.Endpoints[e].EndpointUrl;
    if( strEndpoint.substring( 0, 4 ) == "http" ) continue;
    // find an endpoint with no message security
    if( gServerCapabilities.Endpoints[e].SecurityMode === MessageSecurityMode.None ) {
        epSecureChNone_Anonymous = findTokenTypeInEndpoints( e, UserTokenType.Anonymous );
        epSecureChNone_UserName = findTokenTypeInEndpoints( e, UserTokenType.UserName );
    }
}

// we NEED an insecure channel capability for this conformance unit
if (epSecureChNone_Anonymous === null || epSecureChNone_Anonymous === undefined || epSecureChNone_Anonymous.UserIdentityTokens.length === 0) {
    if (epSecureChNone_UserName === null || epSecureChNone_UserName === undefined || epSecureChNone_UserName.UserIdentityTokens.length === 0) {
        addSkipped( "No Anonymous/UserName user identity configured on the unsecure Endpoint. Skipping CU." );
        stopCurrentUnit();
    }
    else {
        addLog( "No Anonymous user identity configured on the unsecure Endpoint. Username/Password will be used." );
        epSecureChNone = epSecureChNone_UserName;
        userCredentials =  new UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName );
        authenticationType = "Username/Password";
    }
}
else {
    epSecureChNone = epSecureChNone_Anonymous;
    userCredentials = new UserCredentials( { policy:UserTokenType.Anonymous } );
}

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );