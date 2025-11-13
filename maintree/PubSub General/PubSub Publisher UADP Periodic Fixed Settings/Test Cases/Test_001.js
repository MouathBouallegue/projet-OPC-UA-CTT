/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check the UADP NetworkMessage Header
    Step 1: Check UADPVersion (bits 0-3)
    Step 2: Check PublisherId Flag (bit 4)
    Step 3: Check GroupHeader Flag (bit 5)
    Step 4: Check PayloadHeader Flag (bit 6)
    Step 5: Check ExtendedFlags1 (bit 7)
    Step 6: Check PublisherId Type (Bits 0-2)
    Step 7: Check DataSetClassId Flag (bit 3)
    Step 8: Check Security flag (bit 4)
    Step 9: Check Timestamp and Picoseconds Flags (bits 5-6)
    Step 10: Check ExtendedFlags2 (bits 7)
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.UADPVersion = bin( "0001" );
    TC_Variables.ExpectedResults.PublisherId = 1;
    TC_Variables.ExpectedResults.GroupHeader = 1;
    TC_Variables.ExpectedResults.PayloadHeader = 0;
    TC_Variables.ExpectedResults.ExtendedFlags1 = 1;
    TC_Variables.ExpectedResults.PublisherId_Type = [ bin( "001" ), bin( "011" ) ];
    TC_Variables.ExpectedResults.DataSetClassId = 0;
    //TC_Variables.ExpectedResults.Security = 0/1;
    TC_Variables.ExpectedResults.Timestamp = 0;
    TC_Variables.ExpectedResults.PicoSeconds = 0;
    TC_Variables.ExpectedResults.ExtendedFlags2 = 0;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    
    // Step 1: Check UADPVersion (bits 0-3)
    if( Assert.Equal( TC_Variables.ExpectedResults.UADPVersion, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.UADPVersion, "UADPVersion must be set to '0001'. Aborting test." ) ) {
        // Step 2: Check PublisherId Flag (bit 4)
        if( !Assert.Equal( TC_Variables.ExpectedResults.PublisherId, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.PublisherId, "PublisherId flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 3: Check GroupHeader Flag (bit 5)
        if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeader, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.GroupHeader, "GroupHeader flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 4: Check PayloadHeader Flag (bit 6)
        if( !Assert.Equal( TC_Variables.ExpectedResults.PayloadHeader, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader, "PayloadHeader flag must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
        // Step 5: Check ExtendedFlags1 (bit 7)
        if( Assert.Equal( TC_Variables.ExpectedResults.ExtendedFlags1, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1, "ExtendedFlags1 must be set to '1' (activated). Aborting test." ) ) {
            // Step 6: Check PublisherId Type (Bits 0-2)
            if( TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type != TC_Variables.ExpectedResults.PublisherId_Type[0] &&
                TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type != TC_Variables.ExpectedResults.PublisherId_Type[1] ) {
                    addError( "PublisherId Type must be set to '001' (1, UInt16) or '011' (3, UInt64). Received: '" + TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type + "'" );
                    TC_Variables.Result = false;
            }
            // Step 7: Check DataSetClassId Flag (bit 3)
            if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetClassId, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.DataSetClassId, "DataSetClassId flag must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            // Step 8: Check Security flag(bit 4)
            // *TODO* review Step 8
            // if( !Assert.Equal( TC_Variables.ExpectedResults.Security, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Security, "Security flag must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            // Step 9: Check Timestamp and Picoseconds Flags (bits 5-6)
            if( !Assert.Equal( TC_Variables.ExpectedResults.Timestamp, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Timestamp, "Timestamp flag must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            if( !Assert.Equal( TC_Variables.ExpectedResults.PicoSeconds, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PicoSeconds, "PicoSeconds flag must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            // Step 10: Check ExtendedFlags2 (bits 7)
            if( !Assert.Equal( TC_Variables.ExpectedResults.ExtendedFlags2, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.ExtendedFlags2, "ExtendedFlags2 must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
        }
        else TC_Variables.Result = false;
    }
    else TC_Variables.Result = false;
        
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );