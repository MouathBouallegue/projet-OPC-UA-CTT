/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that at least one FunctionalEntity references at least one InputVariable.
    Requirements: A ConnectionEndpoint exists.
          Step 1: Browse the AutomationComponent for a FunctionalEntity that has a non empty
                  InputData folder.
          Step 2: Browse the ConnectionEndpoints folder of the FunctionalEntity from Step 1
                  for ConnectionEndpoints that has InputVariables defined.
          Step 3: Read the value of the variable InputVariables variable.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasConnectionEndpoint ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            // Step 1: Browse the AutomationComponent for a FunctionalEntity that has a non empty
            //         InputData folder.
            if( isDefined( CU_Variables.AllFunctionalEntities[i].InputData ) ) {
                var inputData = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].InputData, new UaNodeId( Identifier.Organizes ) );
                if( inputData.length > 0 ) {
                    TC_Variables.nothingTested = false;
                    // Step 2: Browse the ConnectionEndpoints folder of the FunctionalEntity from Step 1
                    //         for ConnectionEndpoints that has InputVariables defined.
                    if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                        var connectionEndpoints = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints, CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId );
                        if( connectionEndpoints.length > 0 ) {
                            // walk through ConnectionEndpoints and find one with InputVariables defined
                            for( var c=0; c<connectionEndpoints.length; c++ ) {
                                SetAllChildren_recursive( connectionEndpoints[c] );
                                if( isDefined( connectionEndpoints[c].InputVariables ) ) {
                                    // Step 3: Read the value of the variable InputVariables variable.
                                    if( ReadHelper.Execute( { NodesToRead: connectionEndpoints[c].InputVariables } ) ) {
                                        // shall contain one or more NodeIds of variables
                                        var inputVariableNodeIds = connectionEndpoints[c].InputVariables.Value.Value.toNodeIdArray();
                                        if( !isDefined( inputVariableNodeIds ) && inputVariableNodeIds.length > 0 ) {
                                            addError( "Value of InputVariables variable of ConnectionEndpoint '" + connectionEndpoints[c].NodeId + "' does not contain one or more NodeIds." );
                                            TC_Variables.Result = false;
                                        }
                                    }
                                    break;
                                }
                                if( c == connectionEndpoints.length - 1 ) {
                                    addError( "No ConnectionEndpoint of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' exposes the InputVariables variable." );
                                    TC_Variables.Result = false;
                                }
                            }
                        }
                        else {
                            addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has InputData Variables but exposes no ConnectionEndpoints (HasConnectionEndpoint references) in its ConnectionEndpoints folder." );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has InputData Variables but no ConnectionEndpoints folder." );
                        TC_Variables.Result = false;
                    }
                }
                else addLog( "InputData folder '" + CU_Variables.AllFunctionalEntities[i].InputData.NodeId + "' contains no InputVariables (Organizes references). Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no InputData folder. Skipping node." );
            if( !TC_Variables.Result || !TC_Variables.nothingTested ) break;
        }
    }
    else {
        addError( "Type 'HasConnectionEndpoint' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.Result && TC_Variables.nothingTested ) {
        addSkipped( "No FunctionalEntity having an InputData folder containing InputVariables found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );