/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse the Assets folder and compare the IVendorNameplate information provided
                  by the product with the IVendorNameplate information on the website.
    Requirements: The product must be listed on the OPC Foundation Website.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );