/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method and provide an additional verification variable
                 with a wrong data type.
         Step 1: Browse any Asset in Assets Folder
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read any present variable from the selected Asset (which is not a verification variable).
                 Change the data type of this additional verification variable.
                 Use the modified variable value to construct the input argument for
                 the method call in Step 4.
         Step 4: Call VerifyAsset method and provide the modified additional verification variables
                 from the previous step.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Assets Folder
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Read any present variable from the selected Asset (which is not a verification variable).
        //         Change the data type of this additional verification variable.
        //         Use the modified variable value to construct the input argument for
        //         the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + CU_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }

        TC_Variables.ExpectedAdditionalVerificationVariables = readSupportedAdditionalExpectedVerificationVariables( { Asset: CU_Variables.TestAsset } );
        if( TC_Variables.ExpectedAdditionalVerificationVariables.length == 0 ) {
            addError( "Could not complete test, as no ExpectedAdditionalVerificationVariables could be found in Asset '" + CU_Variables.TestAsset.NodeId + "'." );
            return( false );
        }
        // set first value to wrong type
        if( TC_Variables.ExpectedAdditionalVerificationVariables[0].Value.DataType != Identifier.String ) {
            TC_Variables.ExpectedAdditionalVerificationVariables[0].Value = UaVariant.New( { Type: BuiltInType.String, Value: "DUMMYVALUEWITHWRONGTYPE" } );
        }
        else {
            TC_Variables.ExpectedAdditionalVerificationVariables[0].Value = UaVariant.New( { Type: BuiltInType.Int32, Value: 1234 } );
        }
        
        // Step 4: Call VerifyAsset method and provide the modified additional verification variables
        //         from the previous step.
        var callResult = callVerifyAssetMethod( {
            FxAssetTypeInstance: CU_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ExpectedAdditionalVerificationVariables: TC_Variables.ExpectedAdditionalVerificationVariables,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            /* check results
             * VerificationStatus = 'Uncertain'
             * VerificationResult = NotSet(0)
             * Status reported in the VerificationAdditionalVariablesErrors array is Bad_TypeMismatch
             * Length of VerificationVariablesErrors array matches the length of ExpectedVerificationVariables */

            if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
            
            if( Assert.Equal( TC_Variables.ExpectedAdditionalVerificationVariables.length, callResult.VerificationAdditionalVariablesErrors.length, "Length of VerificationAdditionalVariablesErrors array does not match the length of the ExpectedAdditionalVerificationVariables input argument" ) ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ), callResult.VerificationAdditionalVariablesErrors[0], "Received unexpected StatusCode for VerificationAdditionalVariablesErrors[0]" ) ) TC_Variables.result = false;
            }
            else TC_Variables.result = false;
            
            if( !Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, callResult.VerificationVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) TC_Variables.result = false;
        }
        else TC_Variables.result = false
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );