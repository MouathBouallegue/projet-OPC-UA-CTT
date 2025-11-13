/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check WriterGroup Id
*/

function Test_016() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.WriterGroupId = CU_Variables.PublisherConfiguration.Connections[0].WriterGroups[0].WriterGroupId;
    
    
    // Check WriterGroup Id
    if( !Assert.Equal( TC_Variables.ExpectedResults.WriterGroupId, TC_Variables.NetworkMessage.GroupHeader.WriterGroupId, "Received WriterGroupId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
    
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_016 } );