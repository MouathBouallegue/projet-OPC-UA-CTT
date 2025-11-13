/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check for every top level FunctionalEntity in the FunctionalEntities Folder
                 that the Verify Method supports all InputArguments and OutputArguments.
         Step 1: Browse the Verify node of any FunctionalEntity in the FunctionalEntity Folder.
         Step 2: Read the values of the InputArguments Property.
         Step 3: Read the values of the OutputArguments Property.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    // Browse every top level FunctionalEntity
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        // iterate through FunctionalEntity
        for( var i=0; i < CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the Verify node of any FunctionalEntity in the FunctionalEntity Folder.
            if( isDefined( CU_Variables.AllFunctionalEntities[i].Verify ) ) {
                
                TC_Variables.nothingTested = false;
                
                if( !isDefined( CU_Variables.AllFunctionalEntities[i].Verify.InputArguments ) ) { addError( "No InputArguments property found for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "'." ); TC_Variables.result = false; break; }
                if( !isDefined( CU_Variables.AllFunctionalEntities[i].Verify.OutputArguments ) ) { addError( "No OutputArguments property found for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "'." ); TC_Variables.result = false; break; }
                
                // Step 2: Read the values of the InputArguments Property.
                CU_Variables.AllFunctionalEntities[i].Verify.InputArguments.AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllFunctionalEntities[i].Verify.InputArguments } ) ) {
                    var InputArgumentsValue = CU_Variables.AllFunctionalEntities[i].Verify.InputArguments.Value.Value;
                    if( !InputArgumentsValue.isEmpty() ) {
                        // check every element for InputArguments
                        if( !isDefined( InputArgumentsValue.toExtensionObjectArray()[0] ) ||
                            !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                            !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                            InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "ExpectedVerificationVariables" ) 
                        {
                            addError( "Element 'ExpectedVerificationVariables' not found at index 0 of the InputArguments property for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "'." );
                            TC_Variables.result = false; 
                        }
                        else {
                            if( !Assert.Equal( 1, InputArgumentsValue.toExtensionObjectArray()[0].toArgument().ValueRank, "Element 'ExpectedVerificationVariables' of the InputArguments property of Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "' has unexpected ValueRank." ) ) TC_Variables.Result = false;
                        }
                    }
                    else addError( "Reading the value of the InputArguments property for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "' returned an empty value." );
                }
                
                // Step 3: Read the values of the OutputArguments Property.
                CU_Variables.AllFunctionalEntities[i].Verify.OutputArguments.AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllFunctionalEntities[i].Verify.OutputArguments } ) ) {
                    var OutputArgumentsValue = CU_Variables.AllFunctionalEntities[i].Verify.OutputArguments.Value.Value;
                    if( !OutputArgumentsValue.isEmpty() ) {
                        // check every element for OutputArguments
                        if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0] ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                            OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "VerificationResult" ) { addError( "Element 'VerificationResult' not found at index 0 of the OutputArguments property for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "'." ); TC_Variables.result = false; }
                        if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1] ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1].toArgument() ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name ) ||
                            OutputArgumentsValue.toExtensionObjectArray()[1].toArgument().Name != "VerificationVariablesErrors" )
                        {
                            addError( "Element 'VerificationVariablesErrors' not found at index 1 of the OuputArguments property for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "'." );
                            TC_Variables.result = false; 
                        }
                        else {
                            if( !Assert.Equal( 1, OutputArgumentsValue.toExtensionObjectArray()[1].toArgument().ValueRank, "Element 'VerificationVariablesErrors' of the OutputArguments property of Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "' has unexpected ValueRank." ) ) TC_Variables.Result = false;
                        }
                    }
                    else addError( "Reading the value of the OutputArguments property for Verify method '" + CU_Variables.AllFunctionalEntities[i].Verify.NodeId + "' returned an empty value." );
                }
                if( !TC_Variables.result ) break;
            }
            else addLog( "Verify method not found in FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i][i].NodeId + "'." );
        }
    }
    else {
        addError( "No FunctionalEntities found in the configured AutomationComponentInstance. Aborting test." );
        TC_Variables.result = false;
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No FunctionalEntities found that support the Verify method. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );