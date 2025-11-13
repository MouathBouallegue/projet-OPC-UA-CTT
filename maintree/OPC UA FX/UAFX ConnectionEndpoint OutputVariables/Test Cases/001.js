/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that at least one FunctionalEntity references at least one OutputVariable.
    Requirements: A ConnectionEndpoint exists.
          Step 1: Browse the AutomationComponent for a FunctionalEntity that has a non empty
                  OutputData folder.
          Step 2: Browse the ConnectionEndpoints folder of the FunctionalEntity from Step 1
                  for ConnectionEndpoints that has OutputVariables defined.
          Step 3: Read the value of the variable OutputVariables variable.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasConnectionEndpoint ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            // Step 1: Browse the AutomationComponent for a FunctionalEntity that has a non empty
            //         OutputData folder.
            if( isDefined( CU_Variables.AllFunctionalEntities[i].OutputData ) ) {
                var outputData = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].OutputData, new UaNodeId( Identifier.Organizes ) );
                if( outputData.length > 0 ) {
                    TC_Variables.nothingTested = false;
                    // Step 2: Browse the ConnectionEndpoints folder of the FunctionalEntity from Step 1
                    //         for ConnectionEndpoints that has OutputVariables defined.
                    if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                        var connectionEndpoints = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints, CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId );
                        if( connectionEndpoints.length > 0 ) {
                            // walk through ConnectionEndpoints and find one with OutputVariables defined
                            for( var c=0; c<connectionEndpoints.length; c++ ) {
                                SetAllChildren_recursive( connectionEndpoints[c] );
                                if( isDefined( connectionEndpoints[c].OutputVariables ) ) {
                                    // Step 3: Read the value of the variable OutputVariables variable.
                                    if( ReadHelper.Execute( { NodesToRead: connectionEndpoints[c].OutputVariables } ) ) {
                                        // shall contain one or more NodeIds of variables
                                        var outputVariableNodeIds = connectionEndpoints[c].OutputVariables.Value.Value.toNodeIdArray();
                                        if( !isDefined( outputVariableNodeIds ) && outputVariableNodeIds.length > 0 ) {
                                            addError( "Value of OutputVariables variable of ConnectionEndpoint '" + connectionEndpoints[c].NodeId + "' does not contain one or more NodeIds." );
                                            TC_Variables.Result = false;
                                        }
                                    }
                                    break;
                                }
                                if( c == connectionEndpoints.length - 1 ) {
                                    addError( "No ConnectionEndpoint of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' exposes the OutputVariables variable." );
                                    TC_Variables.Result = false;
                                }
                            }
                        }
                        else {
                            addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has OutputData Variables but exposes no ConnectionEndpoints (HasConnectionEndpoint references) in its ConnectionEndpoints folder." );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has OutputData Variables but no ConnectionEndpoints folder." );
                        TC_Variables.Result = false;
                    }
                }
                else addLog( "OutputData folder '" + CU_Variables.AllFunctionalEntities[i].OutputData.NodeId + "' contains no OutputVariables (Organizes references). Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no OutputData folder. Skipping node." );
            if( !TC_Variables.Result || !TC_Variables.nothingTested ) break;
        }
    }
    else {
        addError( "Type 'HasConnectionEndpoint' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.Result && TC_Variables.nothingTested ) {
        addSkipped( "No FunctionalEntity having an OutputData folder containing OutputVariables found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );