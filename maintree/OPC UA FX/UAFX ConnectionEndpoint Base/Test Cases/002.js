/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that each top level FuntionalEntity exposes or can expose at least
                 one ConnectionEndpoint.
         Step 1: Browse the ConnectionEndpoint Folder of every top level FunctionalEntity.
         Step 2: Call EstablishConnections to create a dynamic instance of a subtype from
                 ConnectionEndpointType.
         Step 3: Browse the ConnectionEndpoints Folder of the FunctionalEntity used in Step 2
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.ConnectionEndpointTypeNodeAvailable = false;
    TC_Variables.FunctionalEntityExposingConnectionEndpointsFolder_Index = -1;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        
        // Step 1: Browse the ConnectionEndpoint Folder of every top level FunctionalEntity.
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                TC_Variables.FunctionalEntityExposingConnectionEndpointsFolder_Index = i;
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
        
        if( TC_Variables.FunctionalEntityExposingConnectionEndpointsFolder_Index != -1 ) {
            var index = TC_Variables.FunctionalEntityExposingConnectionEndpointsFolder_Index;
            if( !TC_Variables.ConnectionEndpointTypeNodeAvailable ) {
                
                // Step 2: Call EstablishConnections to create a dynamic instance of a subtype from ConnectionEndpointType
                var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                    AutomationComponent: CU_Variables.AllFunctionalEntities[index].ParentAutomationComponent,
                    FunctionalEntityNodeId: CU_Variables.AllFunctionalEntities[index].NodeId,
                    OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.Uncertain ) ]
                } );
                
                if( callResult !== false && callResult.success ) {
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].FunctionalEntityNodeResult, "Step 2: Received unexpected StatusCode for FunctionalEntityNodeResult" ) ) TC_Variables.Result = false;
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Step 2: Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                    
                    refreshBaseVariablesModelMapByNodeId( CU_Variables.AllFunctionalEntities[index].ParentAutomationComponent.NodeId, CU_Variables.SessionThread );
                    
                    // Step 3: Browse the ConnectionEndpoints Folder of the FunctionalEntity used in Step 2
                    var childNodes = GetChildNodes( CU_Variables.AllFunctionalEntities[index].ConnectionEndpoints );
                    // check for node of ConnectionEndpointType or a SubType
                    for( var t=0; t<childNodes.length; t++ ) {
                        if( isNodeOfTypeOrSubType( childNodes[t], CU_Variables.Test.BaseObjectType.ConnectionEndpointType ) ) {
                            TC_Variables.ConnectionEndpointTypeNodeAvailable = true;
                            break;
                        }
                    }
                    if( TC_Variables.ConnectionEndpointTypeNodeAvailable ) {
                        addLog( "Step 3: FunctionalEntity " + CU_Variables.AllFunctionalEntities[index].NodeId + " is exposing a node of ConnectionEndpointType or subtype after creating one using EstablishConnections." );
                    }
                    else {
                        addError( "Step 3: FunctionalEntity " + CU_Variables.AllFunctionalEntities[index].NodeId + " does not expose a node of ConnectionEndpointType or subtype after successfully calling EstablishConnections to create one." );
                        TC_Variables.Result = false;
                    }
                    
                }
                else TC_Variables.Result = false;
                
            }
            else addLog( "Step 1: A FunctionalEntity exposing a node of ConnectionEndpointType or subtype was found in server. Skipping following steps." );
        }
        else {
            addSkipped( "No FunctionalEntity found in server, which exposes the optional ConnectionEndpoints folder. Skipping test." );
            TC_Variables.Result = false;
        }
        
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );