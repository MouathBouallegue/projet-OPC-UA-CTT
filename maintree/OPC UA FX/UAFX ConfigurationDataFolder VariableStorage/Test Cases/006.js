/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check the ListStoredVariables Method for a top level FunctionalEntity ConfigurationData.
         Step 1: Browse the ConfigurationData folder for any volatile (AccessLevelEx NonVolatile
                 bit = FALSE) variables with an Organizes reference.
         Step 2: Read the Values of the Variables from Step 1.
         Step 3: Call the SetStoredVariables Method and provide the  NodeId of the Variables
                 from Step 1 as input argument VariablesToStore.
         Step 4: Call the ListStoredVariables Method.
         Step 5: Repeat previous steps 1-4 with the maximum number of supported VariablesToStore.
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                TC_Variables.nothingTested = false;
                // Step 1: Browse the ConfigurationData folder for any volatile (AccessLevelEx NonVolatile
                //         bit = FALSE) variables with an Organizes reference.
                var volatileVariables = GetAllVolatileVariables( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                if( volatileVariables.length > 0 ) {
                    // Read the Values of the Variables from Step 1.
                    for( var v=0; v<volatileVariables.length; v++ ) volatileVariables[v].AttributeId = Attribute.Value;
                    if( ReadHelper.Execute( { NodesToRead: volatileVariables } ) ) {
                        // Step 3: Call the SetStoredVariables Method and provide the NodeId
                        //         of the Variables from Step 1 as input argument VariablesToStore.
                        var variablesToStore = [];
                        for( var v=0; v<volatileVariables.length; v++ ) variablesToStore.push( volatileVariables[v].NodeId );
                        var callResult = callSetStoredVariablesMethod( CU_Variables.AllFunctionalEntities[i].ConfigurationData, variablesToStore );
                        if( callResult.success ) {
                            for( var j in callResult.Results ) if( !Assert.StatusCodeIs( callResult.Results[j].StatusCode, StatusCode.Good, "Step 3: Received StatusCode in OutputArgument 'Results[" + j + "]' is not good." ) ) TC_Variables.Result = false;
                            // Step 4: Call the ListStoredVariables Method.
                            var callResult = callListStoredVariablesMethod( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                            if( callResult.success ) {
                                for( var a=0; callResult.StoredVariables.length; a++ ) {
                                    if( !Assert.Equal( volatileVariables[a].Value.Value, callResult.StoredVariables[a].Value, "Step 4: Value of variable " + volatileVariables[a].NodeId + " does not match the Value returned by the ListStoredVariables method" ) ) TC_Variables.Result = false;
                                }
                            }
                            else {
                                addError( "Step 4: Failed to call ListStoredVariables method on ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Step 3: Failed to call SetStoredVariables method on ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "'." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no volatile variables." );
                    TC_Variables.Result = false;
                }
                // break after one FunctionalEntity with ConfigurationData folder has been found
                break;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the FunctionalEntities found in AddressSpace exposes the ConfigurationData folder. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );