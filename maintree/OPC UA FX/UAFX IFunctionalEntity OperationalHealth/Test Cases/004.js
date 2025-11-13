/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the product follows the aggregation rules for the health of
                  FunctionalEntities and the health of ConnectionEndpoints.
    Requirements: - Warnings and errors are well described in the product documentation.
          Step 1: Provoke a warning in the FunctionalEntity and read the value of OperationalHealth.
          Step 2: Provoke an error in the FunctionalEntity and read the value of OperationalHealth.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );