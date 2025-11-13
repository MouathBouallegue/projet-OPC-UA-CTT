/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify EstablishConnections Method behavior when the NodeId of the AutomationComponent
                 Instance is provided as AssetToVerify.
         Step 1: Browse any Asset in Asset folder.
         Step 2: Read all supported verification variable for VerificationMode AssetCompatibility.
         Step 3: Use the variable values to construct the AssetVerifications argument. Provide
                 the NodeId of the AutomationComponent instance as AssetToVerify argument.
                 Set VerificationMode to AssetCompatibility.
         Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set. 
*/

function Test_Err_005() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
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
        
        // Step 3: Use the variable values to construct the AssetVerifications argument. Provide
        //         the NodeId of the AutomationComponent instance as AssetToVerify argument.
        //         Set VerificationMode to AssetCompatibility.
        // Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set. 
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent.NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus shall be set to Bad_InvalidArgument.
                 - VerificationResult equals Mismatch.
                 - VerificationVariablesErrors and VerificationAdditionalVariablesErrors are not populated. 
                 */
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationStatus, callResult.AssetVerificationResults[0].VerificationStatus, "Received unexpected StatusCode for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.AssetVerificationResults[0].VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( !Assert.Equal( 0, callResult.AssetVerificationResults[0].VerificationVariablesErrors.length, "Received unexpected length of VerificationVariablesErrors array" ) ) TC_Variables.result = false;
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

Test.Execute( { Procedure: Test_Err_005 } );