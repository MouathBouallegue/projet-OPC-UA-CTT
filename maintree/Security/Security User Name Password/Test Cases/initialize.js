const CU_NAME = "Security User Name Password";

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/Helpers.js" );

const EMPTY_PASSWORD = "";
const EMPTY_USERNAME = "";
const EMPTY_ENCRYALG = "";
const BAD_PASSWORD = "abcd1234";
const BAD_USERNAME = "barneyRubbleUACTT";
const BAD_POLICYID = "abc123";
const BAD_ENCRYALG = "abc123";

/* Validate our CTT settings first, we need to be sure that we have ALL of the information
   needed for this CU, such as:
             Username
             Password */

var USERNAME = readSetting( "/Server Test/Session/LoginNameGranted1" ).toString();
if( USERNAME === undefined || USERNAME === null || USERNAME.length === 0 ) {
    addError( "Aborting conformance unit because the login credentials are not configured within the CTT settings under 'Server Test/Session'." );
    stopCurrentUnit();
}
var PASSWORD = readSetting( "/Server Test/Session/LoginPasswordGranted1" ).toString();
if( PASSWORD === undefined || PASSWORD === null || PASSWORD.length === 0 ) {
    addWarning( "Password is not configured, or is intentionally left empty. Please verify settings in 'Server Test/Session'." );
}

var LOGINDENIEDUSERNAME = readSetting( "/Server Test/Session/LoginNameAccessDenied" ).toString();
if( LOGINDENIEDUSERNAME === undefined || LOGINDENIEDUSERNAME === null || LOGINDENIEDUSERNAME.length === 0 ) {
    addWarning( "Password for a user with no access is not configured, or is intentionally left empty. Please verify settings in 'Server Test/Session'." );
}

var LOGINDENIEDPASSWORD = readSetting( "/Server Test/Session/LoginPasswordAccessDenied" ).toString();
if( LOGINDENIEDPASSWORD === undefined || LOGINDENIEDPASSWORD === null || LOGINDENIEDPASSWORD.length === 0 ) {
    addWarning( "Password for a user with no access is not configured, or is intentionally left empty. Please verify settings in 'Server Test/Session'." );
}


// initialize some endpoints that will be useful to scripts
var epSecureChNone  = null;    // secure channel, no security
var epSecureEncrypt = null;    // secure channel, message encryption
var epGeneralTesting= null;    // this is the endpoint we use for all general test cases

// Connect to the server
if( gServerCapabilities.Endpoints.length === 0 ) {
    if( !Test.Connect( { SkipCreateSession: true } ) ) stopCurrentUnit();
    else Test.Disconnect( { SkipCloseSession: true } );
}
if ( gServerCapabilities.Endpoints.length > 0 ) {
    epSecureChNone = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.None, TokenType: UserTokenType.UserName, FilterHTTPS: true } );
    epSecureEncrypt = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.SignAndEncrypt, TokenType: UserTokenType.UserName, FilterHTTPS: true, MostSecure: true } );

    // we NEED an insecure channel capability for this conformance unit
    if ( !isDefined( epSecureChNone ) ) addWarning( "No insecure endpoints detected. Some tests will be skipped." );
    else {
        if ( epSecureChNone.UserIdentityTokens.length === 0 ) {
            addWarning( "No UserIdentityTokens configured on (non-secure) Endpoint: " + epSecureChNone.EndpointUrl + ". Those tests will be skipped." );
        }
        else {
            epGeneralTesting = epSecureChNone;
        }
    }

    // we also NEED a secure channel capability for some tests within this conformance unit
    if ( !isDefined( epSecureEncrypt ) ) {
        epSecureEncrypt = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.Sign, TokenType: UserTokenType.UserName, FilterHTTPS: true, MostSecure: true } );
        if ( !isDefined( epSecureEncrypt ) ) {
            addWarning( "No Secure endpoints detected. Some tests will be skipped." );
        }
        else {
            epGeneralTesting = epSecureEncrypt;
        }
    }
    else {
        epGeneralTesting = epSecureEncrypt;
    }
    if ( !isDefined( epSecureChNone ) && !isDefined( epSecureEncrypt ) ) {
        var message = "UserIdentityToken 'UserName' not found in GetEndpoints.\nUserName/Password is REQUIRED behavior, even for a Nano Server (the smallest of all Servers).";
        message += "\nEndpoints received:\n";
        for( var i=0; i<gServerCapabilities.Endpoints.length; i++ ) {
            message += "\t[" + i + "] SecurityMode: " + gServerCapabilities.Endpoints[i].SecurityMode + "; UserIdentityTokens #" + gServerCapabilities.Endpoints[i].UserIdentityTokens.length;
            for( var t=0; t<gServerCapabilities.Endpoints[i].UserIdentityTokens.length; t++ ) {
                message += "\n\t\t[" + t + "] = " + gServerCapabilities.Endpoints[i].UserIdentityTokens[t];
            }//for t...
        }//for i...
        addError( message );
        stopCurrentUnit();
    }
    else {
        if( isDefined( epGeneralTesting ) ) {
            Test.Channel.Execute({ RequestedSecurityPolicyUri: epGeneralTesting.SecurityPolicyUri, MessageSecurityMode: epGeneralTesting.SecurityMode });
            Test.Session = new CreateSessionService({ Channel: Test.Channel });
            if (!Test.Session.Execute({ EndpointUrl: epGeneralTesting.EndpointUrl })) stopCurrentUnit();
              else Test.Disconnect( {SkipCloseSession: false } );
        }
        else {
            epGeneralTesting = null;
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );
