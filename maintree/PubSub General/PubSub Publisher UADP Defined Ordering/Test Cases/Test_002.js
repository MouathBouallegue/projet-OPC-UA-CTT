/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check order of DataSetMessages in frame. Configured for AscendingWriterId.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.DataSetWriterIds = [];
    TC_Variables.TestNetworkMessages = [];
    
    // Only get NetworkMessages from one WriterGroup (the first one received)
    var firstWriterGroupId = null;
    for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
        if( isDefined( CU_Variables.TestNetworkMessages[i].GroupHeader.WriterGroupId ) ) {
            if( !isDefined( firstWriterGroupId ) ) firstWriterGroupId = CU_Variables.TestNetworkMessages[i].GroupHeader.WriterGroupId;
            if( CU_Variables.TestNetworkMessages[i].GroupHeader.WriterGroupId == firstWriterGroupId ) TC_Variables.TestNetworkMessages.push( CU_Variables.TestNetworkMessages[i] );
        }
    }
    
    if( TC_Variables.TestNetworkMessages.length > 0 ) {
        
        var writerGroup = GetWriterGroupByWriterGroupIdFromConfig( TC_Variables.TestNetworkMessages[0].GroupHeader.WriterGroupId, CU_Variables.PublisherConfiguration );
        
        if( isDefined( writerGroup ) ) {
        
            var messageSettings = writerGroup.MessageSettings.toUadpWriterGroupMessageDataType();
            
            if( !isDefined( messageSettings.DataSetOrdering ) ) {
                addError( "Could not get MessageSettings.DataSetOrdering property of WriterGroup with WriterGroupId " + TC_Variables.TestNetworkMessages[0].GroupHeader.WriterGroupId + "'." );
                return( false );
            }
            
            if( messageSettings.DataSetOrdering == DataSetOrderingType_AscendingWriterId_1 ) {
                
                // Order received NetworkMessages by SequenceNumber
                TC_Variables.TestNetworkMessages = orderNetworkMessagesBySequenceNumber( CU_Variables.TestNetworkMessages );
                
                // Extract all DataSetWriterIds from received NetworkMessages
                for( var t=0; t<TC_Variables.TestNetworkMessages.length; t++ ) {
                    if( isDefined( TC_Variables.TestNetworkMessages[t].PayloadHeader.DataSetWriterIds ) ) {
                        for( var d=0; d<TC_Variables.TestNetworkMessages[t].PayloadHeader.DataSetWriterIds.length; d++ ) {
                            TC_Variables.DataSetWriterIds.push( TC_Variables.TestNetworkMessages[t].PayloadHeader.DataSetWriterIds[d] );
                        }
                    }
                }
            
                // The sequence of messages must always be the same. They always must be with ID increasing. 
                var lastDataSetWriterId = TC_Variables.DataSetWriterIds[0];
                for( var i=1; i<TC_Variables.DataSetWriterIds.length; i++ ) {
                    if( TC_Variables.DataSetWriterIds[0] <= lastDataSetWriterId ) {
                        addError( "DataSetWriterIds are not ordered correctly\nAll DataSetWriterIds: [" + TC_Variables.DataSetWriterIds + "]" );
                        TC_Variables.Result = false;
                        break;
                    }
                    lastDataSetWriterId = TC_Variables.DataSetWriterIds[i];
                }
                
            }
            else {
                addSkipped( "DataSetOrdering in configuration is not AscendingWriterId_1. Skipping test." );
                TC_Variables.Result = false;
            }
        
        }
        else {
            addError( "Can't find WriterGroup with WriterGroupId '" + TC_Variables.TestNetworkMessages[0].GroupHeader.WriterGroupId + "' in generated Publisher PubSubConfiguration. Aborting test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No NetworkMessages with GroupHeader.WriterGroupId available. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );