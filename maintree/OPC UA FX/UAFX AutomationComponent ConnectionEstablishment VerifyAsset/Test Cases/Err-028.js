/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify behavior of EstablishConnections if the VerificationMode is AssetCompatibility
                 and the expected verification result for the provided verification variables
                 is MISMATCH. The verification result for the additional verification variables
                 is MATCH.
         Step 1: Browse any Asset in the Asset folder.
         Step 2: Read all supported AssetCompatibility ExpectedVerificationVariables.
         Step 3: Read any present variable from the selected Asset (shall not be an ExpectedVerificationVariable).
         Step 4: Modify the value of any verificiation variable that the expected verification
                 result is Mismatch. Use the modified verification variable and the unmodified
                 additional verification variable to construct the AssetVerifications argument.
         Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set.
*/

function Test_Err_028() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported AssetCompatibility ExpectedVerificationVariables.
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
        
        // Step 4: Modify the value of any verificiation variable that the expected verification
        //         result is Mismatch. Use the modified verification variable and the unmodified
        //         additional verification variable to construct the AssetVerifications argument.
        UaVariant.Increment( { Value: TC_Variables.ExpectedVerificationVariables.result[0].Value } );
                 
        // Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ExpectedAdditionalVerificationVariables: TC_Variables.ExpectedAdditionalVerificationVariables,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus reports Uncertain.
                 - VerificationResult is Mismatch.
                 - The status reported in the VerificationVariablesErrors array is 'Good' and 'Bad_OutOfRange' for the modified variable.
                 - The length of VerificationVariablesErrors array matches the length of ExpectedlVerificationVariables.
                 - The VerificationAdditionalVariablesErrors array is not populated.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    // StatusCode for the modified ExpectedVerificationVariable shall be Bad_OutOfRange
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), vVariablesErrors[0], "Received unexpected StatusCode for VerificationVariablesErrors[0] (modified value)" ) ) TC_Variables.result = false;
                            
                    for( var e=1; e<vVariablesErrors.length ; e++ ) {
                        // StatusCode for the ExpectedVerificationVariables other than the modified one shall be Good
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (unmodified value)" ) ) TC_Variables.result = false;
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

Test.Execute( { Procedure: Test_Err_028 } );