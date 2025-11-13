/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify EstablishConnections Method behavior when an additional verification
                 variable with an invalid NodeId is provided.
         Step 1: Browse any Asset in Asset folder.
         Step 2: Read all supported verification variables for VerificationMode AssetCompatibility.
         Step 3: Read any present variable from the selected Asset (shall not be an verification
                 variable).
         Step 4: Set the NodeId of the additional verification variable to null. Use the
                 unmodified verification variable and the modified additional verification
                 variable to construct the AssetVerifications argument for the method call
                 in Step 4.
         Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set. 
*/

function Test_Err_014() {
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
        
        // Step 2: Read all supported verification variables for VerificationMode AssetCompatibility.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Read any present variable from the selected Asset (shall not be an verification variable).
        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i] } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 4: Set the NodeId of the additional verification variable to null. Use the
        //         unmodified verification variable and the modified additional verification
        //         variable to construct the AssetVerifications argument for the method call
        //         in Step 4.
        // Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set. 
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ExpectedAdditionalVerificationVariables: TC_Variables.ExpectedAdditionalVerificationVariables,
            SetFirstAdditionalVariableKeyToNull: true,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus shall be set to Bad_InvalidArgument.
                 - VerificationResult equals 'Mismatch'.
                 - The status reported in VerificationVariablesErrors array is 'Good'.
                 - The length of VerificationVariablesErrors array match the length of ExpectedVerificationVariables.
                 - The Status reported in the VerificationVariablesErrors array is 'Bad_TypeMismatch'.
                 - The length of VerificationAdditionalVariablesErrors array match the length of ExpectedAdditionalVerificationVariables.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    for( var e=0; e<vVariablesErrors.length ; e++ ) {
                        // StatusCode for the ExpectedVerificationVariables shall be Good
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "]" ) ) TC_Variables.result = false;
                    }
                    
                }
                else TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, vAdditionalVariablesErrors.length, "Length of VerificationAdditionalVariablesErrors array does not match the length of the ExpectedAdditionalVerificationVariables input argument" ) ) {
                    
                    // StatusCode for the modified ExpectedAdditionalVerificationVariable shall be Bad_TypeMismatch
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ), vAdditionalVariablesErrors[0], "Received unexpected StatusCode for VerificationAdditionalVariablesErrors[0] (modified value)" ) ) TC_Variables.result = false;
                    
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

Test.Execute( { Procedure: Test_Err_014 } );