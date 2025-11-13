/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentity and values of
                 verification variables MISMATCH.
    Step 1: Browse any Asset in the Assets Folder
    Step 2: Set VerificationMode to AssetIdentity
    Step 3: Read every present verification variables for VerificationMode AssetIdentity.
            Select any verification variable (only one) and modify the value.
            Use the modified variable to construct the input argument for the method call in Step 4.
    Step 4: Call VerifyAsset and provide the Values and BrowseNames from previous steps as
            ExpectedVerificationVariables and VerificationMode.
    Step 5: Repeat previous steps for any supported verification variable of
            the selected top level Asset.
    Step 6: Repeat previous steps for any top level Asset
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    // Step 6: Repeat previous steps for any top level Asset
    for( var a=0; a < CU_Variables.AllTopLevelAssets.length; a++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetIdentity
        // Step 3: Read every present verification variables for VerificationMode AssetIdentity.
        //         Select any verification variable (only one) and modify the value.
        //         Use the modified variable to construct the input argument for the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[a], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        
        // Step 5: Repeat previous steps for any supported verification variable of
        //         the selected top level Asset.
        for( var v=0; v<TC_Variables.ExpectedVerificationVariables.result.length; v++ ) {
            var originalValue = TC_Variables.ExpectedVerificationVariables.result[v].Value.clone();
            // Modify one of the ExpectedVerificationVariables
            UaVariant.Increment( { Value: TC_Variables.ExpectedVerificationVariables.result[v].Value } );
            
            // Step 4: Call VerifyAsset and provide the Values and BrowseNames from previous steps as
            //         ExpectedVerificationVariables and VerificationMode.
            var callResult = callVerifyAssetMethod( { 
                FxAssetTypeInstance: CU_Variables.AllTopLevelAssets[a],
                VerificationMode: TC_Variables.VerificationMode,
                ExpectedVerificationResult: TC_Variables.ExpectedVerificationResult,
                ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
                ServiceResult: TC_Variables.ExpectedServiceResult,
                OperationResults: TC_Variables.ExpectedOperationResults
            } );
            if( callResult !== false && callResult.success ) {
                /* check results
                 * VerificationResult = Mismatch(3)
                 * VerificationVariablesErrorsArray shall contain Good, Bad_OutOfRange or Bad_NothingToDo according to the result
                 * VerificationAdditionalVariablesErrorsArray is not populated */
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.VerificationVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    for( var i=0; i<callResult.VerificationVariablesErrors.length ; i++ ) {
                        if( i < v ) {
                            // StatusCode for the ExpectedVerificationVariables prior to the modified one shall be Good
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (prior to modified value)" ) ) TC_Variables.result = false;
                        }
                        if( i == v ) {
                            // StatusCode for the modified ExpectedVerificationVariable shall be Bad_OutOfRange
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (modified value)" ) ) TC_Variables.result = false;
                        }
                        else {
                            // StatusCode for the ExpectedVerificationVariables after the modified one shall be Bad_NothingToDo
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (after modified value)" ) ) TC_Variables.result = false;
                        }
                    }
                }
                else TC_Variables.result = false;
                
                if( !Assert.Equal( 0, callResult.VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
            }
            else TC_Variables.result = false;
            
            // restore originalValue for next Iteration
            TC_Variables.ExpectedVerificationVariables.result[v].Value = originalValue.clone();
            
            if( !TC_Variables.result ) break;
        }
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );