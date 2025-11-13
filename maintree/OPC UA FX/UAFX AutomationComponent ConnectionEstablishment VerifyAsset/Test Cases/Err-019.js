/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify EstablishConnections Method behavior when the BrowseName of a supported
                 verification variable for VerificationMode AssetIdentity is provided twice.
         Step 1: Browse any Asset in the Asset folder.
         Step 2: Read all supported verification variables for VerificationMode AssetIdentity.
         Step 3: Replace the BrowseName of one verification variable with the BrowseName
                 of another supported verification variable (duplicate). Use the unmodified
                 variables and the variable with the modified BrowseNames to construct
                 the AssetVerifications argument. Set VerificationMode to AssetIdentity.
         Step 4: Call the EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set. 
*/

function Test_Err_019() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variables for VerificationMode AssetIdentity.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Replace the BrowseName of one verification variable with the BrowseName
        //         of another supported verification variable (duplicate). Use the unmodified
        //         variables and the variable with the modified BrowseNames to construct
        //         the AssetVerifications argument. Set VerificationMode to AssetIdentity.
        TC_Variables.ExpectedVerificationVariables.result[1].Key = TC_Variables.ExpectedVerificationVariables.result[0].Key;
                
        
        // Step 4: Call the EstablishConnections method with the CommandMask set to VerifyAssetCmd.
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
                 - The VerificationStatus shall be set to Uncertain.
                 - VerificationResult is 'NotSet'.
                 - The Status reported in the VerificationVariablesErrors array is 'Good' or 'Bad_BrowseNameInvalid' for the modified verification variable.
                 - The length of VerificationVariablesErrors array match the length of ExpectedVerificationVariables.
                 - The VerificationAdditionalVariablesErrors array is not populated.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    for( var e=0; e<vVariablesErrors.length; e++ ) {
                        if( e == 1 ) {
                            // StatusCode for the second (duplicated) ExpectedVerificationVariables shall be Bad_BrowseNameInvalid
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBrowseNameInvalid ), vVariablesErrors[vVariablesErrors.length-1], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (duplicated variable)" ) ) TC_Variables.result = false;
                        }
                        else {
                            // StatusCode for the other ExpectedVerificationVariables shall be Good
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (non-duplicated variable)" ) ) TC_Variables.result = false;
                        }
                    }
                    
                }
                else TC_Variables.result = false;
                
                if( !Assert.Equal( 0, vAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
                
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

Test.Execute( { Procedure: Test_Err_019 } );