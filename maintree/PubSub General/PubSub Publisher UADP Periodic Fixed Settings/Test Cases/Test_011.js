/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check number of DataSetMessages
*/

function Test_011() {
    const requiredNumberOfNetworkMessages = 5;
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.TestNetworkMessages.length >= requiredNumberOfNetworkMessages ) {
        // Check if Number of DataSetMessages is the same in every NetworkMessage
        var lastNumberOfDataSetMessages = CU_Variables.TestNetworkMessages[0].Payload.DataSetMessages.length;
        for( var i=1; i<CU_Variables.TestNetworkMessages.length; i++ ) {
            if( CU_Variables.TestNetworkMessages[i].Payload.DataSetMessages.length != lastNumberOfDataSetMessages ) {
                addError( "Number of DataSetMessages inconsistent in received NetworkMessages" );
                TC_Variables.Result = false;
                break;
            }
        }
    }
    else {
        addSkipped( "Not enough NetworkMessages received for this test. Need " + requiredNumberOfNetworkMessages + " or more. Skipping test." );
        return( false );
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_011 } );