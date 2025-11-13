/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that a lock assigned to a Client/Server connection is active after
                  short network interruption. 
    Requirements: Make sure the interruption is shorter than SessionTimeout.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 2: Issue a Write Request to any variable in the ListToBlock.
          Step 3: Interrupt the network connection. Make sure that the initial session is
                  re-established.
          Step 4: Issue a Write Request to any variable in the ListToBlock.
          Step 5: Call ReleaseControl to cleanup the lock(s).
*/

function Test_018() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_018 } );