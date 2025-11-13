/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Write the Attribute Value of the Property ComponentName for every Asset in the Assets Folder. 
    Step 1: Write the Attribute Value of the Property ComponentName for every Asset in the Assets Folder
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    // iterate through assets
    for( var i=0; i < CU_Variables.AllTopLevelAssets_Write.length; i++ ) {
        if( isDefined( CU_Variables.AllTopLevelAssets_Write[i].ComponentName ) ) {
            
            TC_Variables.nothingTested = false;
            
            // Step 1: Write the Attribute Value of the Property ComponentName for every Asset in the Assets Folder
            CU_Variables.AllTopLevelAssets_Write[i].ComponentName.AttributeId = Attribute.Value;
            UaVariant.Increment( { Item: CU_Variables.AllTopLevelAssets_Write[i].ComponentName } );
            if( !WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[i].ComponentName } ) ) {
                TC_Variables.result = false;
                break;
            }
            
        }
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the property ComponentName. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );