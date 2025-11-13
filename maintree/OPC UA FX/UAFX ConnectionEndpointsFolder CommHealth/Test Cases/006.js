/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the CommPreOperational bit of the CommHealth variable is set
                 if a PubSubConnectionEndpoint with Mode Subscriber or  PublisherSubscriber
                 is waiting on the security keys of a Publisher. 
         Step 1: Configure the AC as Subscriber and the CTT as Publisher. 
         Step 2: Establish a PubSub connection but don't provide security keys to the Subscriber.
         Step 3: Read the value of the CommHealth Variable.
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is not yet implemented as establishing a PubSub connection between an AutomationComponent and the CTT is not supported yet." );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );