/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check SecurityTokenId
*/

function Test_019() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    if( TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1 == 1 &&
        TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Security == 1 ) {
            
        // Expected results
        TC_Variables.ExpectedResults = new Object();
        TC_Variables.ExpectedResults.SecurityTokenId = 1;//*TODO* Replace with PubSubConfiguration.SecurityTokenId when available;
        
        
        // Check SecurityTokenId
        if( !Assert.Equal( TC_Variables.ExpectedResults.SecurityTokenId, TC_Variables.NetworkMessage.SecurityHeader.SecurityTokenId, "Received SecurityTokenId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
        
    }
    else {
        addSkipped( "Security disabled in received NetworkMessage. Skipping test." );
        TC_Variables.Result = false;
    }
    
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_019 } );