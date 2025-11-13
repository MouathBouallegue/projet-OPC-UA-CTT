/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetCompatibility.
    Step 1: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetCompatibility.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    // Browse every top level Asset in the Assets Folder
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset ) ) {
            
            TC_Variables.nothingTested = false;
            
            // Step 1: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetCompatibility.
            // mandatory
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].ManufacturerUri ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'ManufacturerUri'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].ProductCode ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'ProductCode'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].MajorAssetVersion ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'MajorAssetVersion'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].MinorAssetVersion ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'MinorAssetVersion'." ); TC_Variables.result = false; }
            
            if( !TC_Variables.result ) break;
            
        }
        else addLog( "Skipping Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' as no VerifyAsset method was found." );
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the VerifyAsset method. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );