include( "./library/Base/safeInvoke.js" );
include( "./library/Information/_Base/NodeContainsSubStructure.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );
include( "./library/ServiceBased/Helpers.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

const CU_NAME = "\n\n\n***** CONFORMANCE UNIT 'Base Info Core Structure' TESTING ";
// initialize some endpoints that will be useful to scripts
var epSecureChNone = null;    // secure channel, no security
var epSecureEncrypt = null;    // secure channel, message encryption
var epGeneralTesting = null;    // this is the endpoint we use for all general test cases

var CU_Variables = new Object();
CU_Variables.LocalCacheMapService = new BuildLocalCacheMapService();
CU_Variables.LocalModelMap = CU_Variables.LocalCacheMapService.GetModelMap();

// Connect to the server
if (gServerCapabilities.Endpoints.length === 0) {
    if (!Test.Connect({ SkipCreateSession: true })) stopCurrentUnit();
    else Test.Disconnect({ SkipCloseSession: true });
}
if (gServerCapabilities.Endpoints.length > 0) {
    epSecureChNone = UaEndpointDescription.Find({ Endpoints: gServerCapabilities.Endpoints, SecurityMode: MessageSecurityMode.None, FilterHTTPS: true });
    epSecureEncrypt = UaEndpointDescription.Find({ Endpoints: gServerCapabilities.Endpoints, TokenType: UserTokenType.UserName, FilterHTTPS: true, MostSecure: true });

    if (!isDefined(epSecureChNone)) print("No insecure endpoints detected.");
    else {
        if (epSecureChNone.UserIdentityTokens.length === 0) {
            addWarning("No UserIdentityTokens configured on (non-secure) Endpoint: " + epSecureChNone.EndpointUrl + ". In this case we shouldn't find a SessionSecurityDiagnostics Object in the SessionDiagnostics Objects why this validation will fail.");
        }
        else {
            epGeneralTesting = epSecureChNone;
        }
    }

    if (!isDefined(epSecureEncrypt)) print("No Secure endpoints detected. If the server doesn't support encryption the SessionSecurityDiagnostics need to be available over a unsecure channel.");
    else {
        if (epSecureEncrypt.UserIdentityTokens.length === 0) {
            addWarning("No UserIdentityTokens configured on (secure) Endpoint: " + epSecureEncrypt.EndpointUrl + ".");
        }
        else {
            epGeneralTesting = epSecureEncrypt;
        }
    }
    if (!isDefined(epGeneralTesting)) {
        var message = "UserIdentityToken 'UserName' not found in GetEndpoints.\nUserName/Password is REQUIRED behavior, even for a Nano Server (the smallest of all Servers).";
        message += "\nEndpoints received:\n";
        for (var i = 0; i < gServerCapabilities.Endpoints.length; i++) {
            message += "\t[" + i + "] SecurityMode: " + gServerCapabilities.Endpoints[i].SecurityMode + "; UserIdentityTokens #" + gServerCapabilities.Endpoints[i].UserIdentityTokens.length;
            for (var t = 0; t < gServerCapabilities.Endpoints[i].UserIdentityTokens.length; t++) {
                message += "\n\t\t[" + t + "] = " + gServerCapabilities.Endpoints[i].UserIdentityTokens[t];
            }//for t...
        }//for i...
        addError(message);
        stopCurrentUnit();
    }
    //if (Test.Session.Session.Connected) Test.Disconnect();
    if (Test.Connect({
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: epGeneralTesting.SecurityPolicyUri,
            MessageSecurityMode: epGeneralTesting.SecurityMode
        },
        SkipActivateSession: true
    })) {
        ActivateSessionHelper.Execute({
            Session: Test.Session,
            UserIdentityToken: UaUserIdentityToken.FromUserCredentials({
                Session: Test.Session,
                UserCredentials: UserCredentials.createFromSettings(PresetCredentials.AccessGranted1, UserTokenType.UserName)
            })
        });
        InstanciateHelpers({ Session: Test.Session.Session, DiscoverySession: Test.DiscoverySession });
        var baseInfoCoreStructureSessionThread = new SessionThread();
        baseInfoCoreStructureSessionThread.Start( { Session: Test.Session } );
    }
    else stopCurrentUnit();
}
else stopCurrentUnit();

print( CU_NAME + " BEGINS ******\n" );