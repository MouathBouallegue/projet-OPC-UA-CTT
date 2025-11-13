/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check ChunkOffset field in the payload of the NetworkMessage
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    if( checkChunkMessageFlag( TC_Variables.NetworkMessage ) ) {
        // Check ChunkOffset. Must be smaller than TotalSize
        if( !Assert.LessThan( TC_Variables.NetworkMessage.Payload.TotalSize, TC_Variables.NetworkMessage.Payload.ChunkOffset, "Received ChunkOffset is not smaller than TotalSize." ) ) TC_Variables.Result = false;
    }
    else TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );