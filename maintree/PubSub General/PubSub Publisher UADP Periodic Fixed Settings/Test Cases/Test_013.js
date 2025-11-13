/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check DataSetMessage layout
*/

function Test_013() {
    // Check DataSetFields types, change content
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.MaxTimeToWaitForMessages = 25000;
    
    var pDS = CU_Variables.PublisherConfiguration.PublishedDataSets;
    TC_Variables.pDSmessageData1 = [];
    TC_Variables.pDSmessageData2 = [];
    
    // First get some messages
    TC_Variables.TestNetworkMessages1 = CollectNetworkMessageData( {
        SubscriberConfiguration: CU_Variables.SubscriberConfiguration,
        Timeout:                 TC_Variables.MaxTimeToWaitForMessages,
        MaxNumberOfMessages:     5,
        SuppressMessages:        true
    } );
    if( TC_Variables.TestNetworkMessages1.length != 5 ) {
        addError( "Did not receive 5 NetworkMessages within " + TC_Variables.MaxTimeToWaitForMessages + " ms. Aborting test." );
        return( false );
    }
    
    // Read current values from server
    for( var p=0; p<pDS.length; p++ ) {
        TC_Variables.pDSmessageData1.push( ReadMessageDataOfPublishedDataItems( pDS[p].DataSetSource.toPublishedDataItemsDataType() ) );
    }
    
    // Modify the values on the server
    for( var p=0; p<pDS.length; p++ ) {
        if( !IncrementValuesOfPublishedDataItems( pDS[p].DataSetSource.toPublishedDataItemsDataType() ) ) {
            addError( "Failed to modify the configured PublishedVariables on the server. Aborting test." );
            return( false );
        }
    }
    
    // Wait for changes to take effect in the server
    UaDateTime.CountDown( { Msecs: 250 } );
    
    // Get further messages after modification
    TC_Variables.TestNetworkMessages2 = CollectNetworkMessageData( {
        SubscriberConfiguration: CU_Variables.SubscriberConfiguration,
        Timeout:                 TC_Variables.MaxTimeToWaitForMessages,
        MaxNumberOfMessages:     5,
        SuppressMessages:        true
    } );
    if( TC_Variables.TestNetworkMessages2.length != 5 ) {
        addError( "Did not receive 5 NetworkMessages within " + TC_Variables.MaxTimeToWaitForMessages + " ms. Aborting test." );
        return( false );
    }
    
    // Read current values from server after modification
    for( var p=0; p<pDS.length; p++ ) {
        TC_Variables.pDSmessageData2.push( ReadMessageDataOfPublishedDataItems( pDS[p].DataSetSource.toPublishedDataItemsDataType() ) );
    }
    
    // Check if DataSetMessage Layout is the same in every received NetworkMessage
    for( var i=0; i<TC_Variables.TestNetworkMessages1.length; i++ ) {
        
        // Check if the DataSetMessage count is equal in both Messages before and after value modification
        if( !Assert.Equal( TC_Variables.TestNetworkMessages1[i].Payload.DataSetMessages.length, TC_Variables.TestNetworkMessages2[i].Payload.DataSetMessages.length, "Received DataSetMessage count is not equal in Messages received before and after modifying the published data sources." ) ) {
            TC_Variables.Result = false;
            break;
        }
        
        if( TC_Variables.TestNetworkMessages1[i].Payload.DataSetMessages.length == pDS.length ) {
            for( var j=0; j<TC_Variables.TestNetworkMessages1[i].Payload.DataSetMessages.length; j++ ) {
                // Check MessageData content for both Messages before and after modification
                if( !Assert.Equal( TC_Variables.pDSmessageData1[j].toHexString(), TC_Variables.TestNetworkMessages1[i].Payload.DataSetMessages[j].MessageData.Value, "Payload of received NetworkMessage at index " + i + " (before modification) is different from the according read PublishedDataSet values." ) ) {
                    TC_Variables.Result = false;
                    break;
                }
                if( !Assert.Equal( TC_Variables.pDSmessageData2[j].toHexString(), TC_Variables.TestNetworkMessages2[i].Payload.DataSetMessages[j].MessageData.Value, "Payload of received NetworkMessage at index " + i + " (after modification) is different from the according read PublishedDataSet values." ) ) {
                    TC_Variables.Result = false;
                    break;
                }
            }
        }
        else {
            addError( "The DataSetMessage count of the received NetworkMessage at index " + i + " and of the according PublishedDataSet are not equal." );
            TC_Variables.Result = false;
        }
        
        if( !TC_Variables.Result ) break;
        
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_013 } );