/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check the StatusCode
*/

function Test_009() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.StatusCodes_HIGH = [];
    for( key in StatusCode ) TC_Variables.ExpectedResults.StatusCodes_HIGH.push( StatusCode[key] & bin("11111111111111110000000000000000") );
    
    
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
    
    
    if( isDefined( TC_Variables.DataSetMessage.Status ) ) {
        // On a published message, check the StatusCode
        var isOneOf = false;
        for( var i=0; i<TC_Variables.ExpectedResults.StatusCodes_HIGH.length; i++ ) {
            if( TC_Variables.ExpectedResults.StatusCodes_HIGH[i] == TC_Variables.DataSetMessage.Status ) {
                isOneOf = true;
                break;
            }
        }
        if( !isOneOf ) {
            addError( "Status does not match one of the High-Order bits of the StatusCodes defined in the CTT." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Status disabled in received DataSetMessage. Aborting test." );
        TC_Variables.Result = false;
    }
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_009 } );