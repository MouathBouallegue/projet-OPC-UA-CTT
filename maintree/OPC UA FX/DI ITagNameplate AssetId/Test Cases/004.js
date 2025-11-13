/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Write the Attribute Value of the Property AssetId for any Asset in the Assets Folder.
    Step 1: Write the Attribute Value of the Property AssetId for any Asset in the Assets Folder
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Step 1: Write the Attribute Value of the Property AssetId for any Asset in the Assets Folder
    if( CU_Variables.AllTopLevelAssets_Write.length > 0 ) {
        for( var a=0; a<CU_Variables.AllTopLevelAssets_Write.length; a++ ) {
            addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets_Write[a].NodeId + "' ===" );
            
            CU_Variables.AllTopLevelAssets_Write[a].AssetId.AttributeId = Attribute.Value;
            UaVariant.Increment( { Item: CU_Variables.AllTopLevelAssets_Write[a].AssetId } );
            if( !WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[a].AssetId } ) ) TC_Variables.result = false;
            
            addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No Asset was found that supports the property AssetId. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );