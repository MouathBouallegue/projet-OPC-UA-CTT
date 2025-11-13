/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the DataType of the MaxConnections variable. 
         Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
         Step 2: Read the Value Attribute of MaxConnections.
         Step 3: Read the DataType Attribute of the of MaxConnections Variable.
         Step 4: Repeat previous steps for every instance of the AutomationComponentType
                 exposed in the FxRoot folder.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        // Step 4: Repeat previous steps for every instance of the AutomationComponentType
        //         exposed in the FxRoot folder.
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            // Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities ) ) {
                if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections ) ) {
                    
                    // Step 2: Read the Value Attribute of MaxConnections
                    CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections.AttributeId = Attribute.Value;
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections } ) ) {
                        if( !Assert.Equal( BuiltInType.UInt32, CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections.Value.DataType, "Step 2: Received unexpected DataType for the value attribute of 'MaxConnections'" ) ) TC_Variables.Result = false;
                    }
                    // Step 3: Read the DataType Attribute of the MaxConnections Variable.
                    CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections.AttributeId = Attribute.DataType;
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections } ) ) {
                        if( !Assert.Equal( new UaNodeId( Identifier.UInt32 ), CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections.Value.Value.toNodeId(), "Step 3: Received unexpected value for the DataType attribute of 'MaxConnections'" ) ) TC_Variables.Result = false;
                    }
                    
                }
                else {
                    addError( "Step 1: AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' does not expose 'MaxConnections' variable." );
                    TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 1: AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'ComponentCapabilities' folder." );
                TC_Variables.Result = false;
            }
            addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No instance of type 'AutomationComponentType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );