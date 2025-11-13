/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CleanupTimeout was reset after a transition from state Operational
                  to state Error.
    Requirements: Test cannot be applied to a Publisher supporting unidirectional communication
                  only.
          Step 1: Establish a connection between product and CTT. 
          Step 2: Read the Attribute Value of the variable Status.
          Step 3: Execute any operation to transition the ConnectionEndpoint from state Operational
                  into state Error.
          Step 4: Execute any operation to transition the ConnectionEndpoint from state Error
                  back into state Operational.
          Step 5: Execute any operation to transition the ConnectionEndpoint from state Operational
                  into state Error.
          Step 6: Wait until CleanupTimeout expires and measure the duration.
          Step 7: Browse the ConnectionEndpoint Object and verify that cleanup was successful.
                  
          Step 8: Repeat previous steps for one instance of every supported subtype of ConnectionEndpointType.
*/

function Test_013() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_013 } );