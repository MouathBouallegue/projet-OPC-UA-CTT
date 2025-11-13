/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method and provide a verification variable for
                 verification mode AssetIdentityAndCompatibility with a wrong data type
                 (verification variable of mode AssetCompatibility).
    Step 1: Browse any Asset in Assets Folder
    Step 2: Set VerificationMode to AssetIdentityandCompatibility
    Step 3: Read every present verification variable for VerificationMode AssetIdentityAndCompatibility.
            Change the data type of the value of any supported
            verification variable of VerificationMode AssetCompatibility.
            Use the modified variable value to construct the input argument for the method call in Step 4.
    Step 4: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps
            as ExpectedVerificationVariables and VerificationMode.
    Step 5: Repeat previous steps for any supported verification variable
            of the selected top level Asset.
    Step 6: Repeat previous steps for any top level Asset
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentityAndCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Assets Folder
    // Step 6: Repeat previous steps for any top level Asset
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetIdentityandCompatibility
        // Step 3: Read every present verification variable for VerificationMode AssetIdentityAndCompatibility.
        //         Change the data type of the value of any supported
        //         verification variable of VerificationMode AssetCompatibility.
        //         Use the modified variable value to construct the input argument for the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: TC_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + TC_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        
        // Step 5: Repeat previous steps for any supported verification variable
        //         of the selected top level Asset.
        for( var v=0; v<TC_Variables.ExpectedVerificationVariables.result.length; v++ ) {
            
            // skip variables of VerificationMode AssetIdentity
            if( TC_Variables.ExpectedVerificationVariables.result[v].Key.Name == "SerialNumber" ||
                TC_Variables.ExpectedVerificationVariables.result[v].Key.Name == "ProductInstanceUri" ) continue;
                
            var originalValue = TC_Variables.ExpectedVerificationVariables.result[v].Value.clone();
            // set value to invalid type (no expected variable is of type NodeId)
            TC_Variables.ExpectedVerificationVariables.result[v].Value = UaVariant.New( { Type: BuiltInType.NodeId, Value: new UaNodeId.fromString( "ns=0;s=DUMMYVALUEWITHWRONGTYPE" ) } );
            
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
                 * VerificationStatus = 'Uncertain'
                 * VerificationResult = NotSet(0)
                 * Length of VerificationVariablesErrors array match the length of ExpectedVerificationVariables
                 * VerificationVariablesErrors array is 'Good' or 'Bad_TypeMismatch'
                 * VerificationAdditionalVariablesErrorsArray is not populated */
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.VerificationVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    for( var i=0; i<callResult.VerificationVariablesErrors.length ; i++ ) {
                        if( i == v ) {
                            // StatusCode for the modified ExpectedVerificationVariable shall be Bad_TypeMismatch
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (modified value)" ) ) TC_Variables.result = false;
                        }
                        else {
                            // StatusCode for the ExpectedVerificationVariables after the modified one shall be Good
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.VerificationVariablesErrors[i], "Received unexpected StatusCode for VerificationVariablesErrors[" + i + "] (unmodified value)" ) ) TC_Variables.result = false;
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
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );