/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check the ListStoredVariables Method for a top level FunctionalEntity ConfigurationData.
         Step 1: Browse a sub-Folder of the ConfigurationDataFolder for volatile (AccessLevelEx
                 NonVolatile bit = FALSE) variables with an Organizes reference.
         Step 2: Read the Values of the Variables from Step 1.
         Step 3: Call the SetStoredVariables Method and provide the  NodeId of the Variables
                 from Step 1 as input argument VariablesToStore.
         Step 4: Call the ListStoredVariables Method.
         Step 5: Repeat previous steps 1-4 with the maximum number of supported VariablesToStore.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( CU_Variables.AllConfigurationDataFoldersWithSubFolders.length > 0 ) {
        for( var i=0; i<CU_Variables.AllConfigurationDataFoldersWithSubFolders.length; i++ ) {
            // Step 1: Browse a sub-Folder of the ConfigurationDataFolder for volatile (AccessLevelEx
            //         NonVolatile bit = FALSE) variables with an Organizes reference.
            var volatileVariables = [];
            for( var s=0; s<CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].SubFolders.length; s++ ) {
                volatileVariables = GetAllVolatileVariables( CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].SubFolders[s] );
                if( volatileVariables.length > 0 ) break;
            }
            if( volatileVariables.length > 0 ) {
                TC_Variables.nothingTested = false;
                // Step 2: Read the Values of the Variables from Step 1.
                for( var v=0; v<volatileVariables.length; v++ ) volatileVariables[v].AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: volatileVariables } ) ) {
                    // Step 3: Call the SetStoredVariables Method and provide the NodeId of the Variables
                    //         from Step 1 as input argument VariablesToStore.
                    var variablesToStore = [];
                    for( var v=0; v<volatileVariables.length; v++ ) variablesToStore.push( volatileVariables[v].NodeId );
                    addLog( "Calling SetStoredVariables method of ConfigurationData folder '" + CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].NodeId + "' with VariablesToStore [ " + variablesToStore + " ]" );
                    var callResult = callSetStoredVariablesMethod( CU_Variables.AllConfigurationDataFoldersWithSubFolders[i], variablesToStore );
                    if( callResult.success ) {
                        for( var j in callResult.Results ) if( !Assert.StatusCodeIs( callResult.Results[j].StatusCode, StatusCode.Good, "Step 3: Received StatusCode in OutputArgument 'Results[" + j + "]' is not good." ) ) TC_Variables.Result = false;
                        // Step 4: Call the ListStoredVariables Method.
                        var callResult = callListStoredVariablesMethod( CU_Variables.AllConfigurationDataFoldersWithSubFolders[i] );
                        if( callResult.success ) {
                            for( var a=0; callResult.StoredVariables.length; a++ ) {
                                if( !Assert.Equal( volatileVariables[a].Value.Value, callResult.StoredVariables[a].Value, "Step 4: Value of variable " + volatileVariables[a].NodeId + " does not match the Value returned by the ListStoredVariables method" ) ) TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Step 4: Failed to call ListStoredVariables method on ConfigurationData folder '" + CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].NodeId + "'." );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Step 3: Failed to call SetStoredVariables method on ConfigurationData folder '" + CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].NodeId + "'." );
                        TC_Variables.Result = false;
                    }
                }
            }
            else addLog( "None of the sub-folders of ConfigurationData folder '" + CU_Variables.AllConfigurationDataFoldersWithSubFolders[i].NodeId + "' expose at least one volatile variable. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the sub-folders of the ConfigurationData folders found in AddressSpace expose at least one volatile variable. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No ConfigurationData folder exposing a sub-folder found in AddressSpace." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );