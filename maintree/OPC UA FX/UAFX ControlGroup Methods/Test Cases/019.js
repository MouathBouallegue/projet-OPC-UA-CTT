/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that a lock assigned to a ConnectionEndpoint is active after short
                  network interruption.
    Requirements: Make sure the interruption is shorter than CleanupTimeout.
          Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                  subtype from ConnectionEndpointType.
          Step 2: Issue a Write Request to any variable in the ListToBlock.
          Step 3: Interrupt the network connection. Ensure that the ConnectionEndpoint communication
                  resumes.
          Step 4: Issue a Write Request to any variable in the ListToBlock.
          Step 5: Call ReleaseControl to cleanup the lock(s).
*/

function Test_019() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_019 } );