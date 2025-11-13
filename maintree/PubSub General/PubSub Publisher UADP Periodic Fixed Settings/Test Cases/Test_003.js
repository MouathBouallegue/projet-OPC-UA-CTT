/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check DataSet Message Header
    Step 1: Field Encoding
    Step 2: DataSetMessageSequenceNumber Flag
    Step 3: Status Flag
    Step 4: MajorVersion Flag
    Step 5: MinorVersion Flag
    Step 6: DataSetFlags2
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.FieldEncoding = bin("01");
    TC_Variables.ExpectedResults.DataSetMessageSequenceNumber_Flag = 1;
    TC_Variables.ExpectedResults.Status_Flag = 1;
    TC_Variables.ExpectedResults.MajorVersion_Flag = 0;
    TC_Variables.ExpectedResults.MinorVersion_Flag = 0;
    TC_Variables.ExpectedResults.DataSetFlags2_Flag = 0;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    if( isDefined( TC_Variables.NetworkMessage.Payload.DataSetMessages ) &&
        TC_Variables.NetworkMessage.Payload.DataSetMessages.length > 0 ) {
            TC_Variables.DataSetMessage = TC_Variables.NetworkMessage.Payload.DataSetMessages[0];
    }
    else {
        addSkipped( "Received NetworkMessage contains no DataSetMessage data. Skipping test." );
        return( false );
    }
    
    
    // Step 1: Field Encoding
    if( !Assert.Equal( TC_Variables.ExpectedResults.FieldEncoding, TC_Variables.DataSetMessage.DataSetFlags1.FieldEncoding, "FieldEncoding must be set to '01' ('RAWDATA')" ) ) TC_Variables.Result = false;
    // Step 2: DataSetMessageSequenceNumber Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetMessageSequenceNumber_Flag, TC_Variables.DataSetMessage.DataSetFlags1.DataSetMessageSequenceNumber, "DataSetMessageSequenceNumber flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
    // Step 3: Status Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.Status_Flag, TC_Variables.DataSetMessage.DataSetFlags1.Status, "Status flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
    // Step 4: MajorVersion Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.MajorVersion_Flag, TC_Variables.DataSetMessage.DataSetFlags1.ConfigurationVersionMajorVersion, "ConfigurationVersionMajorVersion flag must be set to '0' (disabled)" ) ) TC_Variables.Result = false;
    // Step 5: MinorVersion Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.MinorVersion_Flag, TC_Variables.DataSetMessage.DataSetFlags1.ConfigurationVersionMinorVersion, "ConfigurationVersionMinorVersion flag must be set to '0' (disabled)" ) ) TC_Variables.Result = false;
    // Step 6: DataSetFlags2
    if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetFlags2_Flag, TC_Variables.DataSetMessage.DataSetFlags1.DataSetFlags2, "DataSetFlags2 flag must be set to '0' (disabled)" ) ) TC_Variables.Result = false;
        
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );