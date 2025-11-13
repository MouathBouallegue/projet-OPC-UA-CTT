/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Check behavior of EstablishConnections if the VerificationMode is AssetCompatibility
                  and the expected verification result is COMPATIBLE.
    Requirements: - EstablishConnections supports VerifyAssetCmd
                  - Vendor information about Asset compatibility is available.
          Step 1: Browse any Asset in the Asset folder.
          Step 2: Read all supported verification variables for VerificationMode AssetCompatibility.
          Step 3: Modify the values of the verification variables according to the vendors
                  documentation such that the ExpectedVerificationResult equals Compatible.
                  Use the modified variable values to construct the AssetVerifications
                  argument. Set the VerificationMode to AssetCompatibility.
          Step 4: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                  All other command bits are not set. 
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );