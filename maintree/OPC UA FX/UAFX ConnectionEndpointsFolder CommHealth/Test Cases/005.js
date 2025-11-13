/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the CommPreOperational bit of the CommHealth variable is set
                 if a PubSubConnectionEndpoint with Mode PublisherSubscriber is waiting
                 on the Heartbeat of a Subscriber. 
         Step 1: Configure the AC as Publisher and the CTT as Subscriber. 
         Step 2: Configure an unidirectional connection with heartbeat between AutomationComponent
                 and CTT. 
         Step 3: Establish the connection but don't provide the Heartbeat.
         Step 4: Read the value of the CommHealth Variable.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is not yet implemented as establishing a PubSub connection between an AutomationComponent and the CTT is not supported yet." );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );