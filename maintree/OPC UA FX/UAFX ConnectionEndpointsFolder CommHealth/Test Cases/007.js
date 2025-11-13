/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the CommPreOperational bit of the CommHealth variable is set
                 if a PubSubConnectionEndpoint with Mode Subscriber or  PublisherSubscriber
                 is waiting on messages from the Publisher. 
         Step 1: Configure the AC as Subscriber and the CTT as Publisher. 
         Step 2: Configure an unidirectional connection with heartbeat between AutomationComponent
                 and CTT. 
         Step 3: Establish the connection but don't send messages to the Subscriber.
         Step 4: Read the value of the CommHealth Variable.
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is not yet implemented as establishing a PubSub connection between an AutomationComponent and the CTT is not supported yet." );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );