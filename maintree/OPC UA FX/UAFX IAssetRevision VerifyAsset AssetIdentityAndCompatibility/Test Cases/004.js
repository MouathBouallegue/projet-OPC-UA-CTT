/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentityAndCompatibility
                 and values of verification variables MISMATCH (verification variable of mode identity).
    Step 1: Browse any Asset in Assets Folder
    Step 2: Set VerificationMode to AssetIdentityAndCompatibility
    Step 3: Read every present verification variable. Select any verification variable from
            VerificationMode AssetIdentity and modify the value such that the verification result is Mismatch.
            Use this modified value to construct the input argument of the method call in Step 4.
    Step 4: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps
            as ExpectedVerificationVariables and VerificationMode.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.Mismatch;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentityAndCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Assets Folder
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetIdentityAndCompatibility
        // Step 3: Read every present verification variable. Select any verification variable from
        //         VerificationMode AssetIdentity and modify the value such that the verification result is Mismatch.
        //         Use this modified value to construct the input argument of the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: TC_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + TC_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        
        // Modify the last variable of the ExpectedVerificationVariables (has to be either SerialNumber or ProductInstanceUri which is of VerificationMode AssetIdentity)
        UaVariant.Increment( { Value: TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length-1].Value } );
        
        // Step 4: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps
        //         as ExpectedVerificationVariables and VerificationMode.
        var callResult = callVerifyAssetMethod( { 
            FxAssetTypeInstance: TC_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationResult: TC_Variables.ExpectedVerificationResult,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            /* check results
             * VerificationStatus = 'Good'
             * VerificationResult = Mismatch(3)
             * VerificationVariablesErrorsArray shall contain Good or Bad_OutOfRange
             * VerificationAdditionalVariablesErrorsArray is not populated */
            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
            
            if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.VerificationVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                // StatusCode for the ExpectedVerificationVariables shall be Good or Bad_OutOfRange (last value)
                for( var i=0; i<callResult.VerificationVariablesErrors.length ; i++ ) {
                    if( i == callResult.VerificationVariablesErrors.length - 1 ) {
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (modified value)" ) ) TC_Variables.result = false;
                    }
                    else {
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "]" ) ) TC_Variables.result = false;
                    }
                }
            }
            else TC_Variables.result = false;
            
            if( !Assert.Equal( 0, callResult.VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );