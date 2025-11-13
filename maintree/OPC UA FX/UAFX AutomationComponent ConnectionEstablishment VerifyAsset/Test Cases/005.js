/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify behavior of EstablishConnections if the VerificationMode is AssetIdentity
                 and the expected verification result for the provided verification variables
                 and additional verification variables is MATCH. 
         Step 1: Browse any Asset in the Asset folder.
         Step 2: Read all supported verification variables for mode AssetIdentity.
         Step 3: Read any present variable from the selected Asset (shall not be an ExpectedVerificationVariable).
         Step 4: Use the variable values to construct the AssetVerifications argument. Set
                 the VerificationMode to AssetIdentity.
         Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Match;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    
    // Step 1: Browse any Asset in the Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variables for mode AssetIdentity.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Read any present variable from the selected Asset (shall not be an ExpectedVerificationVariable).
        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i] } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 4: Use the variable values to construct the AssetVerifications argument. Set
        //         the VerificationMode to AssetIdentity.
        // Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ExpectedAdditionalVerificationVariables: TC_Variables.ExpectedAdditionalVerificationVariables
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - VerificationStatus is Good.
                 - VerificationResult is Match.
                 - VerificationVariablesErrors array is not populated or is the same size as the ExpectedVerificationVariables array and all entries are 'Good'.
                 - The VerificationAdditionalVariablesErrors array is not populated or is the same size as the ExpectedAdditionalVerificationVariables array and all entries are 'Good'.
                 */
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationStatus, callResult.AssetVerificationResults[0].VerificationStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.AssetVerificationResults[0].VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( callResult.AssetVerificationResults[0].VerificationVariablesErrors.length > 0 ) {
                    if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.AssetVerificationResults[0].VerificationVariablesErrors.length, "VerificationVariablesErrors array is populated, but is not of the same length as the provided ExpectedVerificationVariables" ) ){
                        for( var r=0; r<callResult.AssetVerificationResults[0].VerificationVariablesErrors.length; r++ ) {
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.AssetVerificationResults[0].VerificationVariablesErrors[r], "Received unexpected value for VerificationVariablesErrors[" + r + "]" ) ) TC_Variables.result = false;
                        }
                    }
                    else TC_Variables.result = false;
                }
                
                if( callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length > 0 ) {
                    if( Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length, "VerificationAdditionalVariablesErrors array is populated, but is not of the same length as the provided ExpectedAdditionalVerificationVariables" ) ){
                        for( var r=0; r<callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length; r++ ) {
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors[r], "Received unexpected value for VerificationAdditionalVariablesErrors[" + r + "]" ) ) TC_Variables.result = false;
                        }
                    }
                    else TC_Variables.result = false;
                }
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

Test.Execute( { Procedure: Test_005 } );