/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse every Asset in the Assets Folder and check for support of the Property ComponentName.
    Step 1: Browse every Asset in the Assets Folder and check for support of the Property ComponentName
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Step 1: Browse every Asset in the Assets Folder and check for support of the Property ComponentName
    // iterate through assets
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( !isDefined( CU_Variables.AllTopLevelAssets[i].ComponentName ) ) { addError( "Property 'ComponentName' not found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." ); TC_Variables.result = false; break; }
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );