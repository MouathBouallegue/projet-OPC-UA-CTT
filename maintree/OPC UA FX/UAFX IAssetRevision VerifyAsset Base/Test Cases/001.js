/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse every top level Asset in the Assets Folder and check for support of the VerifyAsset method.
    Step 1: Browse every top level Asset in the Assets Folder and check for support of the VerifyAsset method.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Step 1: Browse every top level Asset in the Assets Folder and check for support of the VerifyAsset method.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( !isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset ) ) { 
            addError( "VerifyAsset method not found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." );
            TC_Variables.result = false;
        }
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );