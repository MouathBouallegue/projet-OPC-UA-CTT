/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check overall lengths of message processed
    Step  1: Check correct process Header length matches defined length
    Step  2: Check correct Frame length
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.NetworkMessageHeaderLength = 4;
    TC_Variables.ExpectedResults.GroupHeaderLength = 11;
    TC_Variables.ExpectedResults.DataSetMessageHeaderLength = 5;
    
    
    // Step 1: Check correct Header length
    var publisherIdType = 0;
    if( isDefined( TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type ) ) publisherIdType = TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type;
    switch( publisherIdType ) {
        case bin( "001" ): // UInt16
            if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeaderLength, TC_Variables.NetworkMessage.NetworkMessageHeaderSize, "NetworkMessageHeader length must be 4 Byte." ) ) TC_Variables.Result = false;
            break;
        case bin( "011" ): // UInt64
            if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeaderLength + 6, TC_Variables.NetworkMessage.NetworkMessageHeaderSize, "NetworkMessageHeader length must be 10 Byte." ) ) TC_Variables.Result = false;
            break;
        default:
            addError( "NetworkMessageHeader of the tested NetworkMessage has an unknown PublisherId type or is not defined: " + publisherIdType );
            TC_Variables.Result = false;
    }
    if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeaderLength, TC_Variables.NetworkMessage.GroupHeaderSize, "GroupHeader length must be 11 Byte." ) ) TC_Variables.Result = false;
    
    if( isDefined( TC_Variables.NetworkMessage.Payload.DataSetMessages ) && TC_Variables.NetworkMessage.Payload.DataSetMessages.length > 0 ) {
        if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetMessageHeaderLength, TC_Variables.NetworkMessage.Payload.DataSetMessages[0].DataSetMessageHeaderSize, "DataSetMessageHeader length must be 5 Byte." ) ) TC_Variables.Result = false;
        
        // Step 2: Check correct Frame length Signature (16 Byte)
        // *TODO* What is considered the "Calculated length"? (If Payload.Sizes is meant, what to do if Count is 1 (shall be omitted in this case)
    }
    else {
        addError( "Received NetworkMessage contains no DataSetMessage data. Aborting test." );
        return( false );
    }
    
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );