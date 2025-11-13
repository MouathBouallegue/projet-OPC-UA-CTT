/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify behavior of EstablishConnections if the VerificationMode is AssetCompatibility
                 and the expected verification result for the provided verification variables
                 is MATCH. The verification result for the additional verification variables
                 is MISMATCH.
         Step 1: Browse any Asset in the Asset folder.
         Step 2: Read all supported ExpectedVerificationVariable for VerificationMode AssetCompatibility.
         Step 3: Read any present variable from the selected Asset (shall not be an ExpectedVerificationVariable).
         Step 4: Modify the value of the additional verification variable that the expected
                 verification result is Mismatch. Use verification variables and the modified
                 additional verification variable to construct the AssetVerifications argument.
                 Set the VerificationMode to AssetCompatibility.
         Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set.
*/

function Test_Err_022() {
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
        
        // Step 2: Read all supported ExpectedVerificationVariable for VerificationMode AssetCompatibility.
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
        // Step 4: Modify the value of the additional verification variable that the expected
        //         verification result is Mismatch. Use verification variables and the modified
        //         additional verification variable to construct the AssetVerifications argument.
        //         Set the VerificationMode to AssetCompatibility.
        UaVariant.Increment( { Value: TC_Variables.ExpectedAdditionalVerificationVariables[0].Value } );
        
        
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
                 - VerificationStatus is Uncertain.
                 - VerificationResult is Mismatch.
                 - The VerificationVariablesErrors array is not populated.
                 - The status reported in the VerificationAdditionalVariablesErrors array is 'Bad_OutOfRange' for the modified variable.
                 - The length of VerificationAdditionalVariablesErrors array matches the length of ExpectedAdditionalVerificationVariables.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( !Assert.Equal( 0, vVariablesErrors.length, "Received unexpected length of VerificationVariablesErrors array" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, vAdditionalVariablesErrors.length, "Length of VerificationAdditionalVariablesErrors array does not match the length of the ExpectedAdditionalVerificationVariables input argument" ) ) {
                    
                    // StatusCode for the modified ExpectedAdditionalVerificationVariable shall be Bad_OutOfRange
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), vAdditionalVariablesErrors[0], "Received unexpected StatusCode for VerificationAdditionalVariablesErrors[0] (modified value)" ) ) TC_Variables.result = false;
                    
                }
                else TC_Variables.result = false;
                
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

Test.Execute( { Procedure: Test_Err_022 } );