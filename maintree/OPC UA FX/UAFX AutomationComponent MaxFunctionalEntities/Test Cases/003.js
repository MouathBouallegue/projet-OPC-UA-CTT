/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the AutomationComponent supports the claimed number of FunctionalEntities.
    Requirements: In the current product configuration exists the maximal number of supported
                  FunctionalEntities.  
          Step 1: Browse the FunctionalEntities Folder exposed by the AutomationComponent.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        // Step 1: Browse the FunctionalEntities Folder exposed by the AutomationComponent.
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities ) ) {
                if( isDefined( CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities ) ) {
                    
                    TC_Variables.nothingTested = false;
                    
                    CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities.AttributeId = Attribute.Value;
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities } ) ) {
                        var maxFunctionalEntities = CU_Variables.Test.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities.Value.Value.toUInt32();
                        var numberOfFEs = CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities.length;
                        if( !Assert.Equal( maxFunctionalEntities, numberOfFEs, "Step 1: Found unexpected number of FunctionalEntities in AC" ) ) TC_Variables.Result = false;
                    }
                    
                }
                else addLog( "Step 1: AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' does not expose 'MaxFunctionalEntities' variable." );
            }
            else {
                addError( "Step 1: AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'ComponentCapabilities' folder." );
                TC_Variables.Result = false;
            }
            addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the AutomationComponents in the AddressSpace expose the 'MaxFunctionalEntities' variable. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'AutomationComponentType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );