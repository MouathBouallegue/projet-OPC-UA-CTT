/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Access the URL provided in the Variable ConformanceName with any Web browser.
    Requirements: The product must be listed on the OPC Foundation Website.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].ConformanceName ) ) {
                TC_Variables.nothingTested = false;
                CU_Variables.Test.AutomationComponents[ac].ConformanceName.AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].ConformanceName } ) ) {
                    notImplemented( "Please check manually if the URL:\n" + 
                        CU_Variables.Test.AutomationComponents[ac].ConformanceName.Value.Value.toString() + "\n" +
                        "provided in the 'ConformanceName' variable of AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "'\n" +
                        "is leading to the products listing on the OPC Foundation Website."
                    );
                }
            }
            else addLog( "AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' does not expose the optional 'ConformanceName' variable. Skipping AC." );
            addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the AutomationComponents in the AddressSpace expose the 'ConformanceName' variable. Skipping test." );
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