/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the CommError bit of the CommHealth variable is set if at least
                 one ConnectionEndpoint establised of this FunctionalEntity has its Status
                 set to Error. 
         Step 1: Use the product documentation to bring the AutomationComponent in a state
                 were the value of the Variable Status equals Error.
         Step 2: Read the value of the CommHealth Variable.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );