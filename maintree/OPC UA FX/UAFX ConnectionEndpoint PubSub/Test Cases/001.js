/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse all available instances of FunctionalEntityType and verify that at
                  least one instance of a PubSubConnectionEndpointType is exposed in the
                  ConnectionEndpoints folder.
    Requirements: Pre-configured PubSub ConnectionEndpoint exists or PubSubConnectionEndpoint
                  was created by EstablishConnections Method. 
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
        if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
            TC_Variables.nothingTested = false;
            var hasAPubSubConnectionEndpointTypeNode = false;
            var childNodes = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints );
            // check for node of PubSubConnectionEndpointType
            for( var t=0; t<childNodes.length; t++ ) {
                var typeDefinition = GetTypeDefinitionOfNode( childNodes[t] );
                if( typeDefinition.equals( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.NodeId ) ) {
                    hasAPubSubConnectionEndpointTypeNode = true;
                    break;
                }
            }
            if( !hasAPubSubConnectionEndpointTypeNode ) addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no node of type PubSubConnectionEndpointType in the ConnectionEndpoints folder." );
        }
        else addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder." );
    }
    
    if( TC_Variables.nothingTested ) {
        addError( "No FunctionalEntity with a ConnectionEndpoints folder found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );