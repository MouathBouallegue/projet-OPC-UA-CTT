/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentity and values of
                 verification variables and additional verification variables
                 MATCH the expected values.
    Step 1: Browse any Asset in the Assets Folder
    Step 2: Set VerificationMode to AssetIdentity
    Step 3: Read every present verification variables for VerificationMode AssetIdentity.
            Use the variable values to construct the input argument for the method call in Step 5.
    Step 4: Read any present variable from the selected Asset (which is not a verification variable).
            Use the variable value to construct the input argument for the method call in Step 5.
    Step 5: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps as
            ExpectedVerificationVariables, ExpectedAdditionalVerificationVariables and
            VerificationMode.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Match;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    for( var a=0; a < CU_Variables.AllTopLevelAssets.length; a++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetIdentity
        // Step 3: Read every present verification variables for VerificationMode AssetIdentity.
        //         Use the variable values to construct the input argument for the method call in Step 5.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[a], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        
        // Step 4: Read any present variable from the selected Asset (which is not a verification variable).
        //         Use the variable value to construct the input argument for the method call in Step 5.
        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[a] } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "'." );
            return( false );
        }
        
        // Step 5: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps as
        //         ExpectedVerificationVariables, ExpectedAdditionalVerificationVariables and
        //         VerificationMode.
        var callResult = callVerifyAssetMethod( { 
            FxAssetTypeInstance: CU_Variables.AllTopLevelAssets[a],
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationResult: TC_Variables.ExpectedVerificationResult,
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
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );