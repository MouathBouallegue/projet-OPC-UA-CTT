/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method and provide all supported verification variables for
                 VerificationMode AssetCompatibility, except one mandatory.
         Step 1: Browse any Asset in the Assets Folder
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Call VerifyAsset method and provide all supported verification variables,
                 except one mandatory
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Call VerifyAsset method and provide all supported verification variables, except one mandatory
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + CU_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        // create a new KeyValuePair array copying all the found ExpectedVerificationVariables except the first one (which should be a mandatory one)
        TC_Variables.ExpectedVerificationVariables_missingMandatory = new UaKeyValuePairs();
        for( var i=1; i < TC_Variables.ExpectedVerificationVariables.result.length; i++ ) {
            TC_Variables.ExpectedVerificationVariables_missingMandatory[i-1] = TC_Variables.ExpectedVerificationVariables.result[i].clone();
        }

        if( !callVerifyAssetMethod( {
            FxAssetTypeInstance: CU_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables_missingMandatory,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } ) ) TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );