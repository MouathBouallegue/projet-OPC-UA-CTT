/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse every top level Asset in the Assets Folder and check for support of the Property MinorAssetVersion.
    Step 1: Browse every top level Asset in the Assets Folder and check for support of the Property MinorAssetVersion
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Run test for all AutomationComponents found in AddressSpace
    if( CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                
                // Step 1: Browse every top level Asset in the Assets Folder and check for support of the Property MinorAssetVersion
                // iterate through assets
                for( var i=0; i < CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length; i++ ) {
                    if( !isDefined( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MinorAssetVersion ) ) { addError( "Property 'MinorAssetVersion' not found in Asset '" + CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].NodeId + "'." ); TC_Variables.result = false; break; }
                }
            
            }
            else _error.store( "AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'Assets' folder" );
            
            addLog( "=== End of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No AutomationComponent found in AddressSpace. Skipping test." );
        TC_Variables.result = false;
    }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );