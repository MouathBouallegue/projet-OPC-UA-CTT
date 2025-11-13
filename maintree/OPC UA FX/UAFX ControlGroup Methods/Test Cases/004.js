/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify for every instance of the ControlGroupType that ReassignControl Method
                  supports the required InputArguments and OutputArguments.
    Requirements: An instance of the ControlGroupType is present and ReleaseControl is supported.
          Step 1: Browse the ReassignControl node of any FunctionalEntity in the FunctionalEntityFolder.
          Step 2: Read the values of the InputArguments Property.
          Step 3: Read the values of the OutputArguments Property.
          Step 4: Repeat previous steps for all instances of the ControlGroupType.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Step 4: Repeat previous steps for all instances of the ControlGroupType.
        for( var i=0; i < CU_Variables.ControlGroupType_Instances.length; i++ ) {
            
            // Step 1: Browse the ReassignControl node of any FunctionalEntity in the FunctionalEntityFolder.
            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl ) ) {
                
                TC_Variables.nothingTested = false;
                
                if( !isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl.InputArguments ) ) { addError( "No InputArguments property found for ReassignControl method '" + ControlGroupType_Instances[i].ReassignControl.NodeId + "'." ); TC_Variables.result = false; break; }
                if( !isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl.OutputArguments ) ) { addError( "No OutputArguments property found for ReassignControl method '" + ControlGroupType_Instances[i].ReassignControl.NodeId + "'." ); TC_Variables.result = false; break; }
                
                // Step 2: Read the values of the InputArguments Property.
                CU_Variables.ControlGroupType_Instances[i].ReassignControl.InputArguments.AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ReassignControl.InputArguments } ) ) {
                    var InputArgumentsValue = CU_Variables.ControlGroupType_Instances[i].ReassignControl.InputArguments.Value.Value;
                    if( !InputArgumentsValue.isEmpty() ) {
                        // check every element for InputArguments
                        if( !isDefined( InputArgumentsValue.toExtensionObjectArray()[0] ) ||
                            !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                            !isDefined( InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                            InputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "LockContext" ) { addError( "Element 'LockContext' not found at index 0 of the InputArguments property for ReassignControl method '" + CU_Variables.ControlGroupType_Instances[i].ReassignControl.NodeId + "'." ); TC_Variables.result = false; }
                    }
                    else addError( "Reading the value of the InputArguments property for ReassignControl method '" + CU_Variables.ControlGroupType_Instances[i].ReassignControl.NodeId + "' returned an empty value." );
                }
                
                // Step 3: Read the values of the OutputArguments Property.
                CU_Variables.ControlGroupType_Instances[i].ReassignControl.OutputArguments.AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ReassignControl.OutputArguments } ) ) {
                    var OutputArgumentsValue = CU_Variables.ControlGroupType_Instances[i].ReassignControl.OutputArguments.Value.Value;
                    if( !OutputArgumentsValue.isEmpty() ) {
                        // check every element for OutputArguments
                        if( !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0] ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument() ) ||
                            !isDefined( OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name ) ||
                            OutputArgumentsValue.toExtensionObjectArray()[0].toArgument().Name != "LockStatus" ) { addError( "Element 'LockStatus' not found at index 0 of the OutputArguments property for ReassignControl method '" + CU_Variables.ControlGroupType_Instances[i].ReassignControl.NodeId + "'." ); TC_Variables.result = false; }
                    }
                    else addError( "Reading the value of the OutputArguments property for ReassignControl method '" + CU_Variables.ControlGroupType_Instances[i].ReassignControl.NodeId + "' returned an empty value." );
                }
                if( !TC_Variables.result ) break;
            }
            else addLog( "ReassignControl method not found in ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'." );
        }
        if( TC_Variables.nothingTested ) { 
            addSkipped( "No ControlGroupType instance found that supports the ReassignControl method. Skipping test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No ControlGroupType instances found in the address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_004 } );