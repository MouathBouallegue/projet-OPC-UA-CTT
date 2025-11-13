/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check VerifyAsset behavior when the VerificationMode is AssetIdentityAndCompatibility
                 and values of verification variables are COMPATIBLE with the expected values.
    Step 1: Browse any Asset in Assets Folder
    Step 2: Set VerificationMode to AssetIdentityAndCompatibility
    Step 3: Read every present verification variable for VerificationMode AssetIdentityAndCompatibility.
            Modify the value of at least one verification variable for VerificationMode
            AssetCompatibility according to the vendors documentation such that
            the expected VerificationResult is Compatible.
            Use this modified value to construct the input argument for the method call in the next step.
    Step 4: Call VerifyAsset and provide the modified Values and BrowseNames from previous steps as
            ExpectedVerificationVariables and VerificationMode.
*/

function test() {
    notImplemented( "This test case is intended to be executed manually." );
    return ( true );
}

Test.Execute( { Procedure: test } );