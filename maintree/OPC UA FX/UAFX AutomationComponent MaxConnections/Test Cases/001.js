/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the MaxConnections Variable is exposed by the AutomationComponent.
         Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
         Step 2: Repeat Step 1 for every instance of the AutomationComponentType exposed
                 in the FxRoot folder.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        // Step 2: Repeat Step 1 for every instance of the AutomationComponentType exposed
        //         in the FxRoot folder.
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            // Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities ) ) {
                if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxConnections ) ) {
                    addLog( "Step 1: 'MaxConnections' variable found for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "'." );
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

Test.Execute( { Procedure: Test_001 } );