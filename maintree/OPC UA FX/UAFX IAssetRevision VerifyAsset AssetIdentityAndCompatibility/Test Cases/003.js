/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentityAndCompatibility
                 and values of verification variables MISMATCH (verification variable of mode compatibility).
    Step 1: Browse any Asset in Assets Folder
    Step 2: Set VerificationMode to AssetIdentityAndCompatibility
    Step 3: Read every present verification variable. Select any verification variable from
            VerificationMode AssetCompatibility and modify the value according
            to the vendors documentation such that the verification result is Mismatch.
            Use this modified value to construct the input argument for the method call in Step 4.
    Step 4: Call VerifyAsset and provide the Values and BrowseNames from previous steps
            as ExpectedVerificationVariables and VerificationMode.
*/

function test() {
    notImplemented( "This test case is intended to be executed manually." );
    return ( true );
}

Test.Execute( { Procedure: test } );