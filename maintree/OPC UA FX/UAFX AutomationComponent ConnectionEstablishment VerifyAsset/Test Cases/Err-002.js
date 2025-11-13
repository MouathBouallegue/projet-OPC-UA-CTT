/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify EstablishConnections Method behavior when a verification variable
                 with an unknown BrowseName is provided.
         Step 1: Browse any Asset in Asset folder.
         Step 2: Read all supported verification variable for VerificationMode AssetCompatibility.
         Step 3: Use the variable values to construct the AssetVerifications argument. Modify
                 the BrowseName of any supported verification variable (e.g. MajorAssetVersion,
                 ManufacturerUri, etc.). Set VerificationMode to AssetCompatibility.
         Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set. 
*/

function Test_Err_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variable for VerificationMode AssetCompatibility.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Use the variable values to construct the AssetVerifications argument. Modify
        //         the BrowseName of any supported verification variable (e.g. MajorAssetVersion,
        //         ManufacturerUri, etc.). Set VerificationMode to AssetCompatibility.
        TC_Variables.ExpectedVerificationVariables.result[0].Key.Name = "modified_browsename";
        
        // Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus reports Bad_InvalidArgument.
                 - VerificationResult equals NotSet.
                 - The VerificationVariablesErrors array reports 'Good' or Bad_BrowseNameInvalid for the modified verification variable. 
                 - VerificationAdditionalVariablesErrors arrays is not populated.
                 */
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationStatus, callResult.AssetVerificationResults[0].VerificationStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.AssetVerificationResults[0].VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBrowseNameInvalid ), callResult.AssetVerificationResults[0].VerificationVariablesErrors[0], "Received unexpected StatusCode for VerificationVariablesErrors[0]" ) ) TC_Variables.result = false;
                if( callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length > 0 ) {
                    if( Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length, "VerificationAdditionalVariablesErrors array is populated, but is not of the same length as the provided ExpectedAdditionalVerificationVariables" ) ){
                        for( var r=0; r<callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length; r++ ) {
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors[r], "Received unexpected value for VerificationAdditionalVariablesErrors[" + r + "]" ) ) TC_Variables.result = false;
                        }
                    }
                    else TC_Variables.result = false;
                }
                if( !Assert.Equal( 0, callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
            }
            else {
                addError( "Returned AssetVerificationResults OutputArgument is empty." );
                TC_Variables.result = false;
            }
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_Err_002 } );