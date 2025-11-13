/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections Method behavior when VerificationMode Identity
                  is requested but not supported.
    Requirements: VerificationMode Identy is not supported
          Step 1: Browse any Asset in the Asset folder.
          Step 2: Read all supported verification variables for VerificationMode AssetCompatibility
                  and VerificationMode AssetIdentity (SerialNumber and ProductInstanceUri).
          Step 3: Use the variable values to construct the AssetVerifications argument. Set
                  VerificationMode to AssetIdentity.
          Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                  All other command bits are not set. 
*/

function Test_Err_010() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    if( Settings.OPC_UA_FX.VerificationMode_Identity_supported ) {
        addSkipped( "VerificationMode AssetIdentity is configured supported in the settings. Skipping test." );
        return( false );
    }
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.BadNotSupported );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variables for VerificationMode AssetCompatibility
        //         and VerificationMode AssetIdentity (SerialNumber and ProductInstanceUri).
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Use the variable values to construct the AssetVerifications argument. Set
        //         VerificationMode to AssetIdentity.
        // Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set. 
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: AssetVerificationMode.AssetIdentity,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus shall be set to Bad_NotSupported.
                 - VerificationResult equals Mismatch.
                 - VerificationVariablesErrors and VerificationAdditionalVariablesErrors arrays are not populated. 
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

Test.Execute( { Procedure: Test_Err_010 } );