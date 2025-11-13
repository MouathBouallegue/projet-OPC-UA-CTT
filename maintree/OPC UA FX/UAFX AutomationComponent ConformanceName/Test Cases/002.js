/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Compare the product name on the OPC Foundation website with the DisplayName
                  of the AutomationComponent. 
    Requirements: The product must be listed on the OPC Foundation Website.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );