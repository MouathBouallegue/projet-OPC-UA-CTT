/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that creation of more FunctionalEntities than supported fails.
    Requirements: - The procedure of adding Functional Entities is described in the product manual
                  - If needed, the vendor provides the tools for adding FunctionalEntities.
          Step 1: Create MaxFunctionalEntities+1 FunctionalEntities by the use of any product
                  vendor recommended tool.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_001 } );