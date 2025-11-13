/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method and provide a BrowseName for an unsupported verification variable of VerificationMode AssetCompatibility.
         Step 1: Browse any Asset in the Assets Folder
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read all supported verification variables for VerificationMode AssetCompatibility.
                 Select an unsupported verification variable and assign any value.
                 Use the supported and unsupported verification variables to construct
                 the input argument for the method call in Step 4.
         Step 4: Call the VerifyAsset method and provide the verification variables from the previous step.
         Step 5: Repeat previous steps for any top level Asset
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ];
    
    
    TC_Variables.OptionalExpectedVerificationVariables = [
        { 
            Key: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "BuildAssetNumber" } ),
            Value: UaVariant.New( { Type: BuiltInType.UInt16, Value: 1234 } )
        },
        { 
            Key: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubBuildAssetNumber" } ),
            Value: UaVariant.New( { Type: BuiltInType.UInt16, Value: 1234 } )
        },
        { 
            Key: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "HardwareRevision" } ),
            Value: UaVariant.New( { Type: BuiltInType.String, Value: "RANDOMVALUE" } )
        },
        { 
            Key: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "SoftwareRevision" } ),
            Value: UaVariant.New( { Type: BuiltInType.String, Value: "RANDOMVALUE" } )
        }
    ];
    
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    
    // Step 1: Browse any Asset in the Assets Folder
    // Step 5: Repeat previous steps for any top level Asset
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 2: Set VerificationMode to AssetCompatibility
        // Step 3: Read all supported verification variables for VerificationMode AssetCompatibility.
        //         Select an unsupported verification variable and assign any value.
        //         Use the supported and unsupported verification variables to construct
        //         the input argument for the method call in Step 4.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: TC_Variables.TestAsset, VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test, as one or more mandatory variables are missing in Asset '" + TC_Variables.TestAsset.NodeId + "' for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            return( false );
        }
        // find an unsupported ExpectedVerificationVariable for VerificationMode AssetCompatibility and add it to the ExpectedVerificationVariables
        for( var i=0; i<TC_Variables.OptionalExpectedVerificationVariables.length; i++ ) {
            var notFoundInExpectedVerificationVariables = true;
            for( var j=0; j<TC_Variables.ExpectedVerificationVariables.result.length; j++ ) {
                if( TC_Variables.OptionalExpectedVerificationVariables[i].Key.Name == TC_Variables.ExpectedVerificationVariables.result[j].Key.Name ) {
                    notFoundInExpectedVerificationVariables = false;
                    break;
                }
            }
            if( notFoundInExpectedVerificationVariables ) {
                TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length] = new UaKeyValuePair();
                TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length-1].Key = TC_Variables.OptionalExpectedVerificationVariables[i].Key;
                TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length-1].Value = TC_Variables.OptionalExpectedVerificationVariables[i].Value;
                break;
            }
            if( i == 3 ) {
                addSkipped( "All optional ExpectedVerificationVariables of VerificationMode AssetCompatibility are supported. At least one unsupported one is needed. Skipping test." );
                return( false );
            }
        }
        
        // Step 4: Call the VerifyAsset method and provide the verification variables from the previous step.
        if( !callVerifyAssetMethod( {
            FxAssetTypeInstance: TC_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } ) ) TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        if( !TC_Variables.result ) break;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );