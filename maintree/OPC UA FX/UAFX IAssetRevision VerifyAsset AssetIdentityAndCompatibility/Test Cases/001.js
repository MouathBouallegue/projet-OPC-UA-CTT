/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetIdentityAndCompatibility.
    Step 1: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetIdentityAndCompatibility
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;

    // iterate through assets
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        // Step 1: Verify that the Asset exposes all supported ExpectedVerificationVariables for VerificationMode AssetIdentityAndCompatibility
        if( isDefined( CU_Variables.AllTopLevelAssets[i].VerifyAsset ) ) { 
            // mandatory
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].ManufacturerUri ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'ManufacturerUri'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].ProductCode ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'ProductCode'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].MajorAssetVersion ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'MajorAssetVersion'." ); TC_Variables.result = false; }
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].MinorAssetVersion ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does not expose the mandatory expected verification variable 'MinorAssetVersion'." ); TC_Variables.result = false; }
            
            // check if SerialNumber or ProductInstanceUri is available (one is needed)
            if( !isDefined( CU_Variables.AllTopLevelAssets[i].SerialNumber ) &&
                !isDefined( CU_Variables.AllTopLevelAssets[i].ProductInstanceUri ) ) { addError( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' does neither expose 'SerialNumber' nor 'ProductInstanceUri'. At least one is needed." ); TC_Variables.result = false; }
                
            if( !TC_Variables.result ) break;
        }
        else {
            addError( "VerifyAsset method not found in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'." ); 
        }
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );