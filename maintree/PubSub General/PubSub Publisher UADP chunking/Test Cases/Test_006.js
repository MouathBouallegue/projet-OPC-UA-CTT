/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check static Fields
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( checkChunkMessageFlag( CU_Variables.TestNetworkMessages[0] ) ) {
        // Expected results (static payload fields of the first NetworkMessage)
        TC_Variables.ExpectedResults = new Object();
        TC_Variables.ExpectedResults.MessageSequenceNumber = CU_Variables.TestNetworkMessages[0].Payload.MessageSequenceNumber;
        TC_Variables.ExpectedResults.TotalSize = CU_Variables.TestNetworkMessages[0].Payload.TotalSize;
    
        for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
            if( !Assert.Equal( TC_Variables.ExpectedResults.MessageSequenceNumber, CU_Variables.TestNetworkMessages[i].Payload.MessageSequenceNumber, "Payload.MessageSequenceNumber is not static in all chunks." ) ) TC_Variables.Result = false;
            if( !Assert.Equal( TC_Variables.ExpectedResults.TotalSize, CU_Variables.TestNetworkMessages[i].Payload.TotalSize, "Payload.TotalSize is not static in all chunks." ) ) TC_Variables.Result = false;
            if( !TC_Variables.Result ) break;
        }
    } 
    else TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );