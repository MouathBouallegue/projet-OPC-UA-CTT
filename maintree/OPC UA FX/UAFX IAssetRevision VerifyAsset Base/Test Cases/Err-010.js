/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method and provide the same BrowseName more than once for
                 a supported verification variable of VerificationMode AssetCompatibility.
         Step 1: Browse any Asset in the Assets Folder
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read all supported verification variables for VerificationMode AssetCompatibility.
                 Create a duplicate entry of a verification variable.
                 Use the  BrowseNames to construct the input argument for the method call in Step 4.
         Step 4: Call the VerifyAsset method and provide the modified verification variables from
                 the previous step.
         Step 5: Repeat previous steps for any top level Asset
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    // Step 5: Repeat previous steps for any top level Asset
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Read all supported verification variables for VerificationMode AssetCompatibility.
        //         Create a duplicate entry of a verification variable.
        //         Use the  BrowseNames to construct the input argument for the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: TC_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + TC_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        // replace the BrowseName of the first variable with the one of the second variable
        TC_Variables.ExpectedVerificationVariables.result[0].Key = TC_Variables.ExpectedVerificationVariables.result[1].Key;
        
        // Step 4: Call the VerifyAsset method and provide the modified verification variables from
        //         the previous step.
        var callResult = callVerifyAssetMethod( { 
            FxAssetTypeInstance: TC_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            /* check results
             * VerificationStatus = 'Uncertain'
             * VerificationResult = NotSet(0)
             * Status reported in the VerificationVariablesErrors array is Bad_BrowseNameInvalid or Good
             * VerificationAdditionalVariablesErrorsArray is not populated */
             
            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
            
            if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.VerificationVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                // StatusCode for the first ExpectedVerificationVariable shall be Bad_BrowseNameInvalid
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBrowseNameInvalid ), callResult.VerificationVariablesErrors[0], "Received unexpected StatusCode for VerificationVariablesErrors[0] (modified value)" ) ) TC_Variables.result = false;
                // StatusCode for the other ExpectedVerificationVariables shall be Good
                for( var i=1; i<callResult.VerificationVariablesErrors.length ; i++ ) {
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (unmodified value)" ) ) TC_Variables.result = false;
                }
            }
            else TC_Variables.result = false;
            
            if( !Assert.Equal( 0, callResult.VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        if( !TC_Variables.result ) break;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );