/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse all available top level instances of FunctionalEntityType and verify
                  that at least one exposes an instance of ConnectionEndpointType.
    Requirements: Preconfigured ConnectionEndpoint exists or ConnectionEndpoint was created
                  by EstablishConnections Method. Note: It is understood that only instances
                  of subtypes from ConnectionEndpointType can exist.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.ConnectionEndpointTypeNodeAvailable = false;
    
    for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
        if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
            var childNodes = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints );
            // check for node of ConnectionEndpointType or a SubType
            for( var t=0; t<childNodes.length; t++ ) {
                if( isNodeOfTypeOrSubType( childNodes[t], CU_Variables.Test.BaseObjectType.ConnectionEndpointType ) ) {
                    TC_Variables.ConnectionEndpointTypeNodeAvailable = true;
                    break;
                }
            }
            if( TC_Variables.ConnectionEndpointTypeNodeAvailable ) break;
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no node of type ConnectionEndpointType (or a subtype) in the ConnectionEndpoints folder. Skipping node." );
        }
        else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder. Skipping node." );
    }
    
    if( !TC_Variables.ConnectionEndpointTypeNodeAvailable ) {
        addError( "No FunctionalEntity exposing a node of ConnectionEndpointType or subtype found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );