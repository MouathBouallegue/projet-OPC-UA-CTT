/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Network Message Header: ExtendedFlags2 Bit 0: Check if Chunk Message is activated
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    // Check if Chunk Message is activated
    if( checkChunkMessageFlag( TC_Variables.NetworkMessage, true ) ) {
        addLog( "Chunk Message flag is set" );
    }
    else {
        addError( "Chunk Message flag is not set" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );