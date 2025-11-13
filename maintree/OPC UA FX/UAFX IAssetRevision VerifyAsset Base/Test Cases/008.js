/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetCompatibility and
                 the values of verification variables MATCH the expected values.
                 While values of additional verification variables MISMATCH the expected values.
         Step 1: Browse any Asset in the Assets Folder.
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read every present verification variables for VerificationMode AssetCompatibility.
                 Use the variable values to construct the input argument for the method call in Step 5.
         Step 4: Read any present variable from the selected Asset (shall not be an verification variable).
                 Modify the value that the expected verification result is Mismatch.
                 Use the modified variable value to construct the input argument for the method call in Step 5.
         Step 5: Call VerifyAsset and provide the Values, BrowseNames or NodeIds from previous
                 steps as ExpectedVerificationVariables, ExpectedAdditionalVerificationVariables and
                 VerificationMode.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Assets Folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Read every present verification variables for VerificationMode AssetCompatibility.
        //         Use the variable values to construct the input argument for the method call in Step 5.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 4: Read any present variable from the selected Asset (shall not be an verification variable).
        //         Modify the value that the expected verification result is Mismatch.
        //         Use the modified variable value to construct the input argument for the method call in Step 5.
        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i] } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
            TC_Variables.result = false;
            continue;
        }
        // modify first value
        UaVariant.Increment( { Value: TC_Variables.ExpectedAdditionalVerificationVariables[0].Value } );
        
        // Step 5: Call VerifyAsset and provide the Values, BrowseNames or NodeIds from previous
        //         steps as ExpectedVerificationVariables, ExpectedAdditionalVerificationVariables and
        //         VerificationMode.
        var callResult = callVerifyAssetMethod( {
            FxAssetTypeInstance: CU_Variables.AllTopLevelAssets[i],
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ExpectedAdditionalVerificationVariables: TC_Variables.ExpectedAdditionalVerificationVariables,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            /* check results
             * VerificationResult = Mismatch(3)
             * Status reported in the VerificationAdditionalVariablesErrors array is Bad_OutOfRange
             * Length of VerificationAdditionalVariablesErrors array matches the length of ExpectedAdditionalVerificationVariables */
            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), callResult.VerificationAdditionalVariablesErrors[0], "Received unexpected StatusCode for VerificationAdditionalVariablesErrors[0]" ) ) TC_Variables.result = false;
            if( !Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, callResult.VerificationAdditionalVariablesErrors.length, "Length of VerificationAdditionalVariablesErrors array does not match the length of the ExpectedAdditionalVerificationVariables input argument" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );