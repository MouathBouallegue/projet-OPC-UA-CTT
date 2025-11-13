/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify behavior of EstablishConnections if the VerificationMode is AssetIdentityAndCompatibility
                 and the expected verification result for the provided verification variables
                 (from VerificationMode AssetIdentity) is MISMATCH.
         Step 1: Browse any Asset in Asset folder.
         Step 2: Read the mandatory and any present optional AssetIdentityAndCompatibility
                 ExpectedVerificationVariable.
         Step 3: Select any verification variable from VerificationMode AssetIdentity (SerialNumber
                 or ProductInstanceUri) and modify the value such that the ExpectedVerificationResult
                 is Mismatch. Use the  modified and unodified verification variables to
                 construct the AssetVerifications argument. Set the VerificationMode to
                 AssetIdentityAndCompatibility.
         Step 4: Call EstablishConnections method with the CommandMask set to VerifyAsset.
                 All other command bits are not set. 
*/


function Test_Err_026() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentityAndCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read the mandatory and any present optional AssetIdentityAndCompatibility
        //         ExpectedVerificationVariable.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Select any verification variable from VerificationMode AssetIdentity (SerialNumber
        //         or ProductInstanceUri) and modify the value such that the ExpectedVerificationResult
        //         is Mismatch. Use the  modified and unodified verification variables to
        //         construct the AssetVerifications argument. Set the VerificationMode to
        //         AssetIdentityAndCompatibility.
        
        // Modify the last variable of the ExpectedVerificationVariables (has to be either SerialNumber or ProductInstanceUri which is of VerificationMode AssetIdentity)
        UaVariant.Increment( { Value: TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length-1].Value } );
        
        // Step 4: Call EstablishConnections method with the CommandMask set to VerifyAsset.
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
                 - VerificationStatus is Uncertain.
                 - VerificationResult is Mismatch.
                 - The Status reported in the VerificationVariablesErrors array is 'Good' and 'Bad_OutOfRange' for the modified variable.
                 - The VerificationAdditionalVariablesErrors array is not populated.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    for( var e=0; e<vVariablesErrors.length - 1; e++ ) {
                        // StatusCode for the ExpectedVerificationVariables after the modified one shall be Good
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "]" ) ) TC_Variables.result = false;
                    }
                    
                    // StatusCode for the modified ExpectedVerificationVariable shall be Bad_OutOfRange
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), vVariablesErrors[TC_Variables.ExpectedVerificationVariables.result.length-1], "Received unexpected StatusCode for VerificationVariablesErrors[" + TC_Variables.ExpectedVerificationVariables.result.length-1 + "] (modified value)" ) ) TC_Variables.result = false;
                    
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

Test.Execute( { Procedure: Test_Err_026 } );