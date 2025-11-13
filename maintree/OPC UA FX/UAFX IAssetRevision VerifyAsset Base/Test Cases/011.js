/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the  VerificationMode is AssetCompatibility and
                 values of verification variables MATCH the expected values.
                 The value of at least one additional verification variable is null.
         Step 1: Browse any Asset in the Assets Folder.
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read every present verification variables for VerificationMode AssetCompatibility.
                 Use the variable values to construct the input argument for the method call in Step 5.
         Step 4: Set the value of any variable exposed by the asset (which is not
                 a verification variable) to null and use the modified variable value to
                 construct the input argument for the method call in Step 5.
         Step 5: Call VerifyAsset and provide the Values, BrowseNames or NodeIds from previous
                 steps as ExpectedVerificationVariables, ExpectedAdditionalVerificationVariables and
                 VerificationMode.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Match;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Read the mandatory and any present optional verification variable for 
        //         VerificationMode AssetCompatibility. Use the variable values to construct the
        //         input argument for the method call in Step 5.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 4: Set the value of any variable exposed by the asset (which is not
        //         a verification variable) to null and use the modified variable value to
        //         construct the input argument for the method call in Step 5.
        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i] } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
            TC_Variables.result = false;
            continue;
        }
        // Set value of one additional verification veriable to null
        TC_Variables.ExpectedAdditionalVerificationVariables[0].Value = null;
        
        // Step 5: Call VerifyAsset and provide the modified Values and BrowseNames from previous
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
             * VerificationResult = Match(1) */
            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );