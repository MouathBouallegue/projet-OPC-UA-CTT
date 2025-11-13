/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify EstablishConnections Method behavior when a verification variable
                 for VerificationMode AssetIdentity with a wrong data type is provided.
         Step 1: Browse any Asset in Asset folder.
         Step 2: Read all supported verification variables for VerificationMode AssetIdentity.
         Step 3: Change the data type of the value of any mandatory verification variable.
                 Use the unmodified and modified variables to construct the AssetVerifications
                 argument. Set VerificationMode to AssetIdentity.
         Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                 All other command bits are not set. 
*/

function Test_Err_017() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variables for VerificationMode AssetIdentity.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        for( var v=0; v<TC_Variables.ExpectedVerificationVariables.result.length; v++ ) {
            var originalValue = TC_Variables.ExpectedVerificationVariables.result[v].Value.clone();
            // Step 3: Change the data type of the value of any mandatory verification variable.
            //         Use the unmodified and modified variables to construct the AssetVerifications
            //         argument. Set VerificationMode to AssetIdentity.
            if( TC_Variables.ExpectedVerificationVariables.result[v].Value.DataType == BuiltInType.Boolean ) {
                TC_Variables.ExpectedVerificationVariables.result[v].Value = new UaVariant();
                TC_Variables.ExpectedVerificationVariables.result[v].Value.setDouble( 1 );
            }
            else {
                TC_Variables.ExpectedVerificationVariables.result[v].Value = new UaVariant();
                TC_Variables.ExpectedVerificationVariables.result[v].Value.setBoolean( true );
            }
        
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
                     - The VerificationStatus shall be set to Uncertain.
                     - The Status reported in the VerificationVariablesErrors array is 'Good' or 'Bad_TypeMismatch' for the modified verification variable.
                     - The length of VerificationVariablesErrors array matches the length of ExpectedVerificationVariables.
                     - The VerificationAdditionalVariablesErrors array is not populated.
                     */
                    var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                    var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                    var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                    var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                    
                    if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                    
                    if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                        for( var e=0; e<vVariablesErrors.length ; e++ ) {
                            if( e == v ) {
                                // StatusCode for the modified ExpectedVerificationVariable shall be Bad_TypeMismatch
                                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (modified value)" ) ) TC_Variables.result = false;
                            }
                            else {
                                // StatusCode for the ExpectedVerificationVariables other than the modified one shall be Good
                                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (unmodified value)" ) ) TC_Variables.result = false;
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
        
            // restore originalValue for next Iteration
            TC_Variables.ExpectedVerificationVariables.result[v].Value = originalValue.clone();
            
            if( !TC_Variables.result ) break;
        }
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_Err_017 } );