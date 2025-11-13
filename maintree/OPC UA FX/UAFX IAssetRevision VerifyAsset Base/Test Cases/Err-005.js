/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the VerifyAsset Method for VerificationMode Identity.
         Step 1: Call the VerifyAsset Method for VerificationMode Identity
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadNotSupported ) ];
    
    if( Settings.OPC_UA_FX.VerificationMode_Identity_supported ) {
        addSkipped( "VerificationMode AssetIdentity is configured supported in the settings. Skipping test." );
        return( false );
    }
    
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentity;
    
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 1: Call the VerifyAsset Method for VerificationMode Identity
        if( !callVerifyAssetMethod( { 
            FxAssetTypeInstance: CU_Variables.TestAsset,
            VerificationMode: TC_Variables.VerificationMode,
            ServiceResult: TC_Variables.ExpectedServiceResult,
            OperationResults: TC_Variables.ExpectedOperationResults
        } ) ) TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );