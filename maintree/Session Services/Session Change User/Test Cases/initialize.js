include( "./library/Base/assertions.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/Helpers.js" );

const CUNAME = "Session Change User";

if( !Test.Connect( { SkipCreateSession: true } ) ) stopCurrentUnit();
// check the Max # of channels first.
if (gServerCapabilities.MaxSecureChannels === 1) {
    addSkipped("Only one channel supported (see setting /Server Test/Capabilities/Max SecureChannels) therefore skipping test.");
    stopCurrentUnit();
}
// check multiple usernames are defined
if (readSetting("/Server Test/Session/LoginNameGranted1").toString().length == 0 &&
    readSetting("/Server Test/Session/LoginNameGranted2").toString().length == 0) {
    addError("No usernames are configured in Settings: /Server Test/Session. The Server indicates support for Username/Password UserIdentityToken's in the EndpointDescription(s).");
    stopCurrentUnit();
}

endpointUsername = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, TokenType: UserTokenType.UserName, FilterHTTPS: true } );
if ( !isDefined( endpointUsername ) ) {
    addSkipped("No endpoints found that support username/password authentication.");
    stopCurrentUnit();
}

print( "\n\n\n***** CONFORMANCE UNIT '" + CUNAME + "' TEST SCRIPTS STARTING *****\n" );