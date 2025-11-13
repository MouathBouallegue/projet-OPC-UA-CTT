/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify the behavior of an instance of a subtype from ConnectionEndpointType
                  after a power cycle for an AutomationComponent that supports persistent
                  Connections.
    Requirements: AutomationComponent supports persistent connections. 
          Step 1: Establish a persistent connection between the product and the CTT. 
          Step 2: Power cycle the product and wait until the AutomationComponent is operational
                  again. Verify the state by reading the value of the Variable Status from
                  the ConnectionEndpoint.  
          Step 3: Verify by browsing the AddressSpace that the ConnectionEndpoint was restored.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );