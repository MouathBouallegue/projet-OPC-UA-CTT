/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the Method for VerificationMode IdentityAndCompatibility.
    Step 1: Call the Method for VerificationMode IdentityAndCompatibility
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadNotSupported ) ];
    
    if( Settings.OPC_UA_FX.VerificationMode_IdentityAndCompatibility_supported ) {
        addSkipped( "VerificationMode AssetIdentityAndCompatibility is configured supported in the settings. Skipping test." );
        return( false );
    }
    
    TC_Variables.VerificationMode = AssetVerificationMode.AssetIdentityAndCompatibility;
    
    for( var a=0; a<CU_Variables.AllTopLevelAssets.length; a++ ) {
        TC_Variables.TestAsset = CU_Variables.AllTopLevelAssets[a];
        addLog( "=== Start of test for Asset '" + TC_Variables.TestAsset.NodeId + "' ===" );
        
        // Step 1: Step 1: Call the Method for VerificationMode IdentityAndCompatibility
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