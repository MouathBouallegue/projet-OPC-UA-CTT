/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check for every Asset in the AssetFolder that VerifyAsset Method supports all mandatory and implemented optional Input and Output Arguments.
    Step 1: Browse the VerifyAsset node of any Asset in the AssetFolder.
    Step 2: Read the values of the InputArguments Property
    Step 3: Read the values of the OutputArguments Property
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    // Browse every top level Asset in the Assets Folder
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        
        // Step 1: Browse the VerifyAsset node of any Asset in the AssetFolder.
        if( isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset ) ) {
            
            TC_Variables.nothingTested = false;
            
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset.InputArguments ) ) { addError( "No InputArguments property found for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; break; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset.OutputArguments ) ) { addError( "No OutputArguments property found for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; break; }
            
            // Step 2: Read the values of the InputArguments Property
            CU_Variables.AllTopLevelAssets[i].VerifyAsset.InputArguments.AttributeId = Attribute.Value;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].VerifyAsset.InputArguments } ) ) {
                var InputArgumentsValue = CU_Variables.AllTopLevelAssets[i].VerifyAsset.InputArguments.Value.Value;
                if( !InputArgumentsValue.isEmpty() ) {
                    // check every element for InputArguments
                    if( !isDefined( InputArgumentsValue.toExtensionObjectArray()[0] ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                        InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "VerificationMode" ) { addError( "Element 'VerificationMode' not found at index 0 of the InputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                    if( !isDefined( InputArgumentsValue.toExtensionObjectArray()[1] ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[1].toArgument() ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name ) ||
                        InputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name != "ExpectedVerificationVariables" ) { addError( "Element 'ExpectedVerificationVariables' not found at index 1 of the InputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                    if( !isDefined( InputArgumentsValue.toExtensionObjectArray()[2] ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[2].toArgument() ) ||
                        !isDefined( InputArgumentsValue.toExtensionObjectArray()[2].toArgument().Name ) ||
                        InputArgumentsValue.toExtensionObjectArray()[2].toArgument().Name != "ExpectedAdditionalVerificationVariables" ) { addError( "Element 'ExpectedAdditionalVerificationVariables' not found at index 2 of the InputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                }
                else addError( "Reading the value of the InputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "' returned an empty value." );
            }
            
            // Step 3: Read the values of the OutputArguments Property
            CU_Variables.AllTopLevelAssets[i].VerifyAsset.OutputArguments.AttributeId = Attribute.Value;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].VerifyAsset.OutputArguments } ) ) {
                var OutputArgumentsValue = CU_Variables.AllTopLevelAssets[i].VerifyAsset.OutputArguments.Value.Value;
                if( !OutputArgumentsValue.isEmpty() ) {
                    // check every element for OutputArguments
                    if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0] ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                        OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "VerificationResult" ) { addError( "Element 'VerificationResult' not found at index 0 of the OutputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                    if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1] ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1].toArgument() ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name ) ||
                        OutputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name != "VerificationVariablesErrors" ) { addError( "Element 'VerificationVariablesErrors' not found at index 1 of the OutputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                    if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[2] ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[2].toArgument() ) ||
                        !isDefined( OutputArgumentsValue.toExtensionObjectArray()[2].toArgument().Name ) ||
                        OutputArgumentsValue.toExtensionObjectArray()[2].toArgument().Name != "VerificationAdditionalVariablesErrors" ) { addError( "Element 'VerificationAdditionalVariablesErrors' not found at index 2 of the OutputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "'." ); TC_Variables.result = false; }
                }
                else addError( "Reading the value of the OutputArguments property for VerifyAsset method '" + CU_Variables.AllTopLevelAssets[i].VerifyAsset.NodeId + "' returned an empty value." );
            }
            if( !TC_Variables.result ) break;
        }
        else addLog( "VerifyAsset method not found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the VerifyAsset method. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );