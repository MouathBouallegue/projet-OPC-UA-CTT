/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the product follows the aggregation rules for the health of
                  SubFunctionalEntities and the health of ConnectionEndpoints.
    Requirements: - At least one SubFunctionalEntity is available.- Warnings and errors are
                  well described in the product documentation.
          Step 1: Provoke a warning in at least one SubFunctionalEntity and read the value
                  of OperationalHealth.
          Step 2: Provoke an error in at least one SubFunctionalEntity and read the value
                  of OperationalHealth.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );