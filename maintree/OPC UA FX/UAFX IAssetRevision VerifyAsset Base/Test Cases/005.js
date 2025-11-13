/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetCompatibility and
                 values of verification variables are COMPATIBLE with the expected values.
         Step 1: Browse any Asset in the Assets Folder.
         Step 2: Set VerificationMode to AssetCompatibility
         Step 3: Read all supported verification variables for VerificationMode AssetCompatibility.
                 Modify the values of the verification variables according to the vendors documentation
                 such that the expected VerificationResult is Compatible.
                 Use the modified variable values to construct the input argument for the method call
                 in Step 4.
         Step 4: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps
                 as ExpectedVerificationVariables and VerificationMode.
         Step 5: Repeat previous steps for every top level Asset with documented compatible settings.
*/

function test() {
    notImplemented( "This test case is intended to be executed manually." );
    return ( true );
}

Test.Execute( { Procedure: test } );