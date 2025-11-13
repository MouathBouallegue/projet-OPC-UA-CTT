/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the header fields match for every chunk
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Expected results (Header fields of the first NetworkMessage)
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.NetworkMessageHeader = CU_Variables.TestNetworkMessages[0].NetworkMessageHeader;
    TC_Variables.ExpectedResults.GroupHeader = CU_Variables.TestNetworkMessages[0].GroupHeader;
    TC_Variables.ExpectedResults.PayloadHeader = CU_Variables.TestNetworkMessages[0].PayloadHeader;

    for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
        if( checkChunkMessageFlag( CU_Variables.TestNetworkMessages[i], true ) ) {
            TC_Variables.nothingTested = false;
            // NetworkMessageHeader
            if( isDefined( TC_Variables.ExpectedResults.NetworkMessageHeader.UADPVersion_Flags ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeader.UADPVersion_Flags.Value, CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.UADPVersion_Flags.Value, "NetworkMessageHeader.UADPVersion_Flags is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.NetworkMessageHeader.ExtendedFlags1 ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeader.ExtendedFlags1.Value, CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.ExtendedFlags1.Value, "NetworkMessageHeader.ExtendedFlags1 is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.NetworkMessageHeader.ExtendedFlags2 ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeader.ExtendedFlags2.Value, CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.ExtendedFlags2.Value, "NetworkMessageHeader.ExtendedFlags2 is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.NetworkMessageHeader.PublisherId ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeader.PublisherId, CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.PublisherId, "NetworkMessageHeader.PublisherId is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.NetworkMessageHeader.DataSetClassId ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeader.DataSetClassId, CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.DataSetClassId, "NetworkMessageHeader.DataSetClassId is not identical in all chunks." ) ) TC_Variables.Result = false;
            
            // GroupHeader
            if( isDefined( TC_Variables.ExpectedResults.GroupHeader.GroupFlags ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeader.GroupFlags.Value, CU_Variables.TestNetworkMessages[i].GroupHeader.GroupFlags.Value, "GroupHeader.GroupFlags is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.GroupHeader.WriterGroupId ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeader.WriterGroupId, CU_Variables.TestNetworkMessages[i].GroupHeader.WriterGroupId, "GroupHeader.WriterGroupId is not identical in all chunks." ) ) TC_Variables.Result = false;
            if( isDefined( TC_Variables.ExpectedResults.GroupHeader.GroupVersion ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeader.GroupVersion, CU_Variables.TestNetworkMessages[i].GroupHeader.GroupVersion, "GroupHeader.GroupVersion is not identical in all chunks." ) ) TC_Variables.Result = false;
            
            // PayloadHeader.DataSetWriterId
            if( isDefined( TC_Variables.ExpectedResults.PayloadHeader.DataSetWriterId ) )
                if( !Assert.Equal( TC_Variables.ExpectedResults.PayloadHeader.DataSetWriterId, CU_Variables.TestNetworkMessages[i].PayloadHeader.DataSetWriterId, "PayloadHeader.DataSetWriterId is not identical in all chunks." ) ) TC_Variables.Result = false;
                
            if( !TC_Variables.Result ) break;
        }
        else addLog( "Received NetworkMessage is no chunk message. Skipping message: '" + CU_Variables.TestNetworkMessages[i].getRawNetworkMessageData() + "'" );
    }
    
    if( TC_Variables.nothingTested ) {
        addSkipped( "None of the received NetworkMessages has the Chunk Message flag set. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );