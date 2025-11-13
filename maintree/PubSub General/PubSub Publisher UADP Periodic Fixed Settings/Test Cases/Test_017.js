/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check PublisherId
*/

function Test_017() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    if( CU_Variables.PublisherConfiguration.Connections.length > 0 ) {
        
        var configuredPublisherId = UaVariantToSimpleType( CU_Variables.PublisherConfiguration.Connections[0].PublisherId );
        
        // Check PublisherId
        if( !Assert.Equal( configuredPublisherId, TC_Variables.NetworkMessage.NetworkMessageHeader.PublisherId, "Received PublisherId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
        
    }
    else {
        addError( "GetWriterGroupByWriterGroupIdFromConfig(): Passed PubSubConfiguration object has no Connections" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_017 } );