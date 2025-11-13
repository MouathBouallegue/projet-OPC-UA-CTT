/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that all referenced Variables are exposed in the OutputData folder
                 of the FunctionalEntity related to the ConnectionEndpoint.
         Step 1: Read the value of OutputVariables variable.
         Step 2: Browse the OutputData folder of the FunctionalEntity related to the ConnectionEndpoint.
         Step 3: Compare the NodeIds read in Step 1 with the NodeIds browsed in Step 2.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasConnectionEndpoint ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                var connectionEndpoints = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints, CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId );
                if( connectionEndpoints.length > 0 ) {
                    // walk through ConnectionEndpoints
                    for( var c=0; c<connectionEndpoints.length; c++ ) {
                        SetAllChildren_recursive( connectionEndpoints[c] );
                        if( isDefined( connectionEndpoints[c].OutputVariables ) ) {
                            // Step 1: Read the value of OutputVariables variable.
                            if( ReadHelper.Execute( { NodesToRead: connectionEndpoints[c].OutputVariables } ) ) {
                                // shall contain one or more NodeIds of variables
                                var outputVariableNodeIds = connectionEndpoints[c].OutputVariables.Value.Value.toNodeIdArray();
                                if( isDefined( outputVariableNodeIds ) && outputVariableNodeIds.length > 0 ) {
                                    TC_Variables.nothingTested = false;
                                    // Step 2: Browse the OutputData folder of the FunctionalEntity related to the ConnectionEndpoint.
                                    if( isDefined( CU_Variables.AllFunctionalEntities[i].OutputData ) ) {
                                        var outputData = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].OutputData, new UaNodeId( Identifier.Organizes ) );
                                        if( outputData.length > 0 ) {
                                            // Step 3: Compare the NodeIds read in Step 1 with the NodeIds browsed in Step 2.
                                            for( var n=0; n<outputVariableNodeIds.length; n++ ) {
                                                var outputVariableNodeParent = GetChildNodesByReferenceTypeId( new MonitoredItem( outputVariableNodeIds[n] ), new UaNodeId( Identifier.Organizes ), false );
                                                if( !Assert.Equal( CU_Variables.AllFunctionalEntities[i].OutputData.NodeId, outputVariableNodeParent.NodeId, "Unexpected parent of OutputVariable provided in OutputVariables variable '" + connectionEndpoints[c].OutputVariables.NodeId + "' at index " + n ) ) TC_Variables.Result = false;
                                            }
                                        }
                                        else {
                                            addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has a ConnectionEndpoint referencing OutputVariables in its OutputVariables variable, but the OutputData folder contains no variables (Organizes references)." );
                                            TC_Variables.Result = false;
                                        }
                                    }
                                    else {
                                        addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has a ConnectionEndpoint referencing OutputVariables in its OutputVariables variable, but has no OutputData folder." );
                                        TC_Variables.Result = false;
                                    }
                                }
                                else {
                                    addError( "Value of OutputVariables variable of ConnectionEndpoint '" + connectionEndpoints[c].NodeId + "' does not contain any NodeIds." );
                                    TC_Variables.Result = false;
                                }
                                
                            }
                        }
                        if( !TC_Variables.Result ) break;
                        if( c == connectionEndpoints.length - 1 ) addLog( "No ConnectionEndpoint of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' exposes the OutputVariables variable. Skipping node." );
                    }
                }
                else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' exposes no ConnectionEndpoints (HasConnectionEndpoint references) in its ConnectionEndpoints folder. Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
    }
    else {
        addError( "Type 'HasConnectionEndpoint' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.Result && TC_Variables.nothingTested ) {
        addSkipped( "No FunctionalEntity having an OutputData folder containing OutputVariables, while having a ConnectionEndpoint exposing the OutputVariables variable found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );