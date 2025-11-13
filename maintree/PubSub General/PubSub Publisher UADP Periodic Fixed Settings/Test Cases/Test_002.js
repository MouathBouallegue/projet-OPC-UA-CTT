/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check Group Header
    Step 1: WriterGroup Id Flag (Bit 0)
    Step 2: Group Version Flag (Bit 1)
    Step 3: NetworkMessageNumber Flag (Bit 2)
    Step 4: SequenceNumber Flag (Bit 3)
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.WriterGroupId_Flag = 1;
    TC_Variables.ExpectedResults.GroupVersion_Flag = 1;
    TC_Variables.ExpectedResults.NetworkMessageNumber_Flag = 1;
    TC_Variables.ExpectedResults.SequenceNumber_Flag = 1;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    if( TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.GroupHeader == 1 ) {
    
        // Step 1: WriterGroup Id Flag (Bit 0)
        if( !Assert.Equal( TC_Variables.ExpectedResults.WriterGroupId_Flag, TC_Variables.NetworkMessage.GroupHeader.GroupFlags.WriterGroupId, "WriterGroupId flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 2: Group Version Flag (Bit 1)
        if( !Assert.Equal( TC_Variables.ExpectedResults.GroupVersion_Flag, TC_Variables.NetworkMessage.GroupHeader.GroupFlags.GroupVersion, "GroupVersion flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 3: NetworkMessageNumber Flag (Bit 2)
        if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageNumber_Flag, TC_Variables.NetworkMessage.GroupHeader.GroupFlags.NetworkMessageNumber, "NetworkMessageNumber flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 4: SequenceNumber Flag (Bit 3)
        if( !Assert.Equal( TC_Variables.ExpectedResults.SequenceNumber_Flag, TC_Variables.NetworkMessage.GroupHeader.GroupFlags.SequenceNumber, "SequenceNumber flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
    
    }
    else {
        addSkipped( "GroupHeader is deactivated in received NetworkMessage. Skipping test." );
        TC_Variables.Result = false;
    }
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );