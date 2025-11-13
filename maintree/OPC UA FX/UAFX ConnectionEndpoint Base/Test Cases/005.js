/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify the behavior of an instance of a subtype from ConnectionEndpointType
                  after a power cycle for an AutomationComponent that doesn't support persistent
                  Connections.
    Requirements: AutomationComponent support non-persistent connections. 
          Step 1: Establish a non-persistent connection between the product and the CTT. 
          Step 2: Power cycle the product and wait until the AutomationComponent is operational
                  again.
          Step 3: Verify by browsing the AddressSpace that dynamically created Objects and
                  References related to the ConnectionEndpoint were removed.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );