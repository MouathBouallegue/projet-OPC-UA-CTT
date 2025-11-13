/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify behavior of EstablishConnections if the VerificationMode is AssetIdentityAndCompatibility
                  and the expected verification result for the provided verification variable
                  (from VerificationMode AssetCompatibility) is COMPATIBLE.
    Requirements: Vendor information about Asset compatibility is available.
          Step 1: Browse any Asset in Asset folder.
          Step 2: Read the mandatory and any present optional verification variable for VerificationMode
                  AssetIdentityAndCompatibility.
          Step 3: Modify the value of at least one ExpectedVerificationVariable for VerificationMode
                  AssetCompatibility according to the vendors documentation such that the
                  expected VerificationResult is Compatible. Use this modified value and
                  the other values to construct the AssetVerifications argument in the
                  EstablishConnections call. Set the VerificationMode to AssetIdentityAndCompatibility.
          Step 4: Call EstablishConnections method with the CommandMask set to VerifyAsset.
                  All other command bits are not set. 
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );