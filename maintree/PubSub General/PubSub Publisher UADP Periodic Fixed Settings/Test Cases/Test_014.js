/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check Sequence Number order
*/

function Test_014() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    /*TC_Variables.DataSetMessages = [];
    
    
    // Extract DataSetMessages from received NetworkMessages
    for( var t=0; t<CU_Variables.TestNetworkMessages.length; t++ ) {
        if( isDefined( CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages ) ) {
            for( var d=0; d<CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages.length; d++ ) {
                TC_Variables.DataSetMessages.push( CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages[d] );
            }
        }
    }


    // Step 1: Check Sequence Number order
    var lastSequenceNumber = null;
    
    if( TC_Variables.DataSetMessages.length > 1 ) {
        for( var i=0; i<TC_Variables.DataSetMessages.length; i++ ) {
            if( isDefined( TC_Variables.DataSetMessages[i].DataSetMessageSequenceNumber ) ) {
                if( !isDefined( lastSequenceNumber ) ) lastSequenceNumber = TC_Variables.DataSetMessages[i].DataSetMessageSequenceNumber;
                else {
                    if( lastSequenceNumber < 65535 ) {
                        if( TC_Variables.DataSetMessages[i].DataSetMessageSequenceNumber - lastSequenceNumber != 1 ) {
                            addError( "DataSetMessageSequenceNumber is not strictly increasing monotonically\n<Last SequenceNumber: " + lastSequenceNumber + ", subsequent SequenceNumber: " + TC_Variables.DataSetMessages[i].DataSetMessageSequenceNumber + ">" );
                            TC_Variables.Result = false;
                        }
                    }
                    lastSequenceNumber = TC_Variables.DataSetMessages[i].DataSetMessageSequenceNumber;
                }
            }
            else {
                addError( "DataSetMessageSequenceNumber not set on received DataSetMessage. Aborting test." );
                TC_Variables.Result = false;
                break;
            }
        }
    }
    else {
        addSkipped( "Not enough DataSetMessages received within " + maxTimeToWaitForMessage + " ms for this test to run. Skipping test." );
        TC_Variables.Result = false;
    }*/
    


    // Step 1: Check Sequence Number order
    var lastSequenceNumber = null;
    
    if( CU_Variables.TestNetworkMessages.length > 1 ) {
        for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
            if( isDefined( CU_Variables.TestNetworkMessages[i].GroupHeader.SequenceNumber ) ) {
                if( !isDefined( lastSequenceNumber ) ) lastSequenceNumber = CU_Variables.TestNetworkMessages[i].GroupHeader.SequenceNumber;
                else {
                    if( lastSequenceNumber < 65535 ) {
                        if( CU_Variables.TestNetworkMessages[i].GroupHeader.SequenceNumber - lastSequenceNumber != 1 ) {
                            addError( "GroupHeader.SequenceNumber is not strictly increasing monotonically\n<Last SequenceNumber: " + lastSequenceNumber + ", subsequent SequenceNumber: " + CU_Variables.TestNetworkMessages[i].GroupHeader.SequenceNumber + ">" );
                            TC_Variables.Result = false;
                        }
                    }
                    lastSequenceNumber = CU_Variables.TestNetworkMessages[i].GroupHeader.SequenceNumber;
                }
            }
            else {
                addError( "GroupHeader.SequenceNumber not set on received NetworkMessage. Aborting test." );
                TC_Variables.Result = false;
                break;
            }
        }
    }
    else {
        addSkipped( "Not enough NetworkMessages received within " + maxTimeToWaitForMessage + " ms for this test to run. Skipping test." );
        TC_Variables.Result = false;
    }


    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_014 } );