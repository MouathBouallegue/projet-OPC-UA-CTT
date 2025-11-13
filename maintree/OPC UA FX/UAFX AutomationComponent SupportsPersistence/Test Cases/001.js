/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify the DataType of the SupportsPersistence variable. 
    Requirements: The SupportsPersistence variable is exposed in the ComponentCapabilities
                  folder and set to TRUE.
          Step 1: Browse the ComponentCapabilities folder of the AutomationComponent.
          Step 2: Read the Value Attribute of SupportsPersistence.
          Step 3: Read the DataType Attribute of the SupportPersistence Variable.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            // Step 1: Browse the ComponentCapabilities folder of the AutomationComponent.
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities ) ) {
                // Check if SupportPersistence is exposed
                if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence ) ) {
                    TC_Variables.nothingTested = false;
                    // Step 2: Read the Value Attribute of SupportsPersistence
                    CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.AttributeId = Attribute.Value;
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence } ) ) {
                        if( !Assert.Equal( BuiltInType.Boolean, CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.Value.DataType, "Step 2: Received unexpected DataType for the value attribute of 'SupportsPersistence'" ) ) TC_Variables.Result = false;
                    }
                    // Step 3: Read the DataType Attribute of the SupportPersistence Variable.
                    CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.AttributeId = Attribute.DataType;
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence } ) ) {
                        if( !Assert.Equal( new UaNodeId( Identifier.Boolean ), CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.Value.Value.toNodeId(), "Step 3: Received unexpected value for the DataType attribute of 'SupportsPersistence'" ) ) TC_Variables.Result = false;
                    }
                }
                else addLog( "AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing 'SupportsPersistence' variable. Skipping AC." );
            }
            else {
                addError( "AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'ComponentCapabilities' folder." );
                TC_Variables.Result = false;
            }
            addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the AutomationComponents in the AddressSpace expose the 'SupportsPersistence' variable. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'AutomationComponentType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );