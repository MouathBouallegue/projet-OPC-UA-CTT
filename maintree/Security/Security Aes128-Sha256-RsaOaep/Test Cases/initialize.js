const CU_NAME = "Security Aes128-Sha256-RsaOaep";
const SECURITY_POLICYURI_AES128SHA256RSAOAEP = "http://opcfoundation.org/UA/SecurityPolicy#Aes128_Sha256_RsaOaep"

include("./library/Base/safeInvoke.js");
include("./library/Base/array.js");
include("./library/Base/serverCapabilities.js");

// Some functions useful to this CU
function findUsernameInEndpoints(endpoint) {
    var s = false;
    for (var u = 0; u < endpoint.UserIdentityTokens.length; u++) {
        if (endpoint.UserIdentityTokens[u].TokenType === UserTokenType.UserName) {
            s = true;
            break;
        }
    }
    return (s);
}

function findAnonymousInEndpoints(endpoint) {
    var s = false;
    for (var u = 0; u < endpoint.UserIdentityTokens.length; u++) {
        if (endpoint.UserIdentityTokens[u].TokenType === UserTokenType.Anonymous) {
            s = true;
            break;
        }
    }
    return (s);
}


if (gServerCapabilities.Endpoints.length === 0) {
    if (!Test.Connect()) stopCurrentUnit();
    else Test.Disconnect();
}

// initialize some endpoints that will be useful to scripts
var epSecureSign = null;    // secure channel, no security
var epSecureEncrypt = null; // secure channel, message encryption

for (var e = 0; e < gServerCapabilities.Endpoints.length; e++) {
    // We are not interested in the HTTP protocol, so filter those out.
    var strEndpoint = gServerCapabilities.Endpoints[e].EndpointUrl;
    if (strEndpoint.substring(0, 4) == "http") continue;
    var ep = gServerCapabilities.Endpoints[e];
    if (ep.SecurityPolicyUri === SECURITY_POLICYURI_AES128SHA256RSAOAEP) {
        // find a secure endpoint, using Sign&Encrypt
        if (ep.SecurityMode === MessageSecurityMode.SignAndEncrypt) epSecureEncrypt = ep;
        // find a secure endpoint, using Sign only
        if (ep.SecurityMode === MessageSecurityMode.Sign) epSecureSign = ep;
    }
}

// we NEED a secure channel 256RSA256 for this CU!
if (epSecureEncrypt === null && epSecureSign === null) {
    addSkipped("Secure endpoint using Aes128-Sha256-RsaOaep not found!");
    stopCurrentUnit();
}
else {
    if (ArrayContains(gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/NanoEmbeddedDevice2017") ||
        ArrayContains(gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/MicroEmbeddedDevice2017") ||
        ArrayContains(gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/NanoEmbeddedDevice") ||
        ArrayContains(gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/MicroEmbeddedDevice")) {
        Test.PostTestFunctions.push(postTestDelay);
    }
}

function postTestDelay() {
    UaDateTime.CountDown({ Seconds: Settings.Advanced.TestTool.PostTestDelay, Message: "before invoking next script..." });
}

print("\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n");