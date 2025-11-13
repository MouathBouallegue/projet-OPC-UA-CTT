/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Call GetEndpoints and verify that each provided PolicyId for UserIdentificationTokens is unique.
    Expectation: The names of the PolicyIds are vendor-specific but each of them has to be unique within the server.
*/

function securityUserNamePassword015() {
    var result = true;
    var foundTokens = [];
    if ( !isDefined( gServerCapabilities.Endpoints ) ) {
        Test.Connect( { SkipCreateSession: true } );
        Test.Disconnect( { SkipCloseSession: true } );
    }
    if ( !isDefined( gServerCapabilities.Endpoints ) ) {
        addSkipped( "Unable to get a list of Endpoints. Abort test." );
        return ( false );
    }
    for ( var i = 0; i < gServerCapabilities.Endpoints.length; i++ ) {
        for ( var s = 0; s < gServerCapabilities.Endpoints[i].UserIdentityTokens.length; s++ ) {
            foundTokens.push( gServerCapabilities.Endpoints[i].UserIdentityTokens[s] );
            if ( foundTokens[i].PolicyId == "" || foundTokens[i].PolicyId == null ) {
                _warning.store("PolicyId is NULL. This is not recommended!");
                foundTokens[i].PolicyId = "[OpcUa Null String]";
            }
        }
    }
    var testedPolicies = [];
    for ( var i = 0; i < foundTokens.length; i++ ) {
        var skipPolicy = false;
        for ( var t = 0; t < testedPolicies.length; t++ ) {
            if ( testedPolicies[t] == foundTokens[i].PolicyId ) {
                skipPolicy = true;
                break;
            }
        }
        if ( skipPolicy ) continue;
        for ( var s = 0; s < foundTokens.length; s++ ) {
            if ( i == s ) continue;
            if ( foundTokens[i].PolicyId == foundTokens[s].PolicyId ) {
                if ( foundTokens[i].TokenType != foundTokens[s].TokenType ) {
                    addError( "The PolicyId: " + foundTokens[i].PolicyId + ", is used for multiple UserIdentityTokens. The PolicyId has to be unique within the server.\nDifference found: TokenTypes: " + foundTokens[i].TokenType + ", and: " + foundTokens[s].TokenType );
                    result = false;
                }
                if ( foundTokens[i].IssuedTokenType != foundTokens[s].IssuedTokenType ) {
                    addError( "The PolicyId: " + foundTokens[i].PolicyId + ", is used for multiple UserIdentityTokens. The PolicyId has to be unique within the server.\nDifference found: IssuedTokenType: " + foundTokens[i].IssuedTokenType + ", and: " + foundTokens[s].IssuedTokenType );
                    result = false;
                }
                if ( foundTokens[i].IssuerEndpointUrl != foundTokens[s].IssuerEndpointUrl ) {
                    addError( "The PolicyId: " + foundTokens[i].PolicyId + ", is used for multiple UserIdentityTokens. The PolicyId has to be unique within the server.\nDifference found: IssuerEndpointUrl: " + foundTokens[i].IssuerEndpointUrl + ", and: " + foundTokens[s].IssuerEndpointUrl );
                    result = false;
                }
                if ( foundTokens[i].SecurityPolicyUri != foundTokens[s].SecurityPolicyUri ) {
                    addError( "The PolicyId: " + foundTokens[i].PolicyId + ", is used for multiple UserIdentityTokens. The PolicyId has to be unique within the server.\nDifference found: SecurityUri: " + foundTokens[i].SecurityPolicyUri + ", and: " + foundTokens[s].SecurityPolicyUri );
                    result = false;
                }
            }
        }
        testedPolicies.push( foundTokens[i].PolicyId );
    }
    print( "Policies tested: " + testedPolicies );
    return ( result );
}

Test.Execute( { Procedure: securityUserNamePassword015 } );

