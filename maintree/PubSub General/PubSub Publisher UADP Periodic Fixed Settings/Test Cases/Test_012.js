/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check DataSetMessage sequence
*/

function Test_012() {
    // Check DataSetMessage sequence
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Check if DataSetMessages are the same in every received NetworkMessage
    for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
        if( CU_Variables.TestNetworkMessages[0].Payload.DataSetMessages.length == CU_Variables.TestNetworkMessages[i].Payload.DataSetMessages.length ) {
            for( var j=0; j<CU_Variables.TestNetworkMessages[0].Payload.DataSetMessages.length; j++ ) {
                if( !Assert.Equal( CU_Variables.TestNetworkMessages[0].Payload.DataSetMessages[j].MessageData.Value, CU_Variables.TestNetworkMessages[i].Payload.DataSetMessages[j].MessageData.Value, "Payload of received NetworkMessage at index 0 is different from Payload of received NetworkMessage at index " + i + ". As the configured DataSets consist of static scalar values, they should be the same." ) ) {
                    TC_Variables.Result = false;
                    break;
                }
            }
        }
        else {
            addError( "The DataSetMessage count of the received NetworkMessages at index 0 and index " + i + " are not equal." );
            TC_Variables.Result = false;
        }
        if( !TC_Variables.Result ) break;
    }
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_012 } );