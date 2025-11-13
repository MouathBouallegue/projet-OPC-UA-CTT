/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentity and values of
                 verification variables MATCH the expected values.
    Step 1: Browse any Asset in the Assets Folder
    Step 2: Set VerificationMode to AssetIdentity
    Step 3: Read every present verification variables for VerificationMode AssetIdentity.
            Use the returned variables to construct the input argument for
            the method call in Step 4.
    Step 4: Call VerifyAsset and provide the Values and BrowseNames from previous steps
            as ExpectedVerificationVariables and VerificationMode.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Match;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetIdentity
        // Step 3: Read every present verification variables for VerificationMode AssetIdentity.
        //         Use the returned variables to construct the input argument for
        //         the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        
        // Step 4: Call VerifyAsset and provide the Values and BrowseNames from previous steps
        //         as ExpectedVerificationVariables and VerificationMode.
        var callResult = callVerifyAssetMethod( { 
            FxAssetTypeInstance: CU_Variables.AllTopLevelAssets[i],
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationResult: TC_Variables.ExpectedVerificationResult,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            /* check results
             * VerificationResult = Match(1)
             * VerificationAdditionalVariablesErrorsArray is not populated */
            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
            if( !Assert.Equal( 0, callResult.VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );