/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: On a published message, check Network Message Number
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.NetworkMessageNumber = 1;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    
    // On a published message, check Network Message Number
    if( TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.GroupHeader == 0 ) { addError( "GroupHeader disabled in received NetworkMessage. Aborting test." ); TC_Variables.Result = false; }
    else if( !isDefined( TC_Variables.NetworkMessage.GroupHeader.NetworkMessageNumber ) ) { addError( "No NetworkMessageNumber defined in GroupHeader. Aborting test." ); TC_Variables.Result = false; }
    else if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageNumber, TC_Variables.NetworkMessage.GroupHeader.NetworkMessageNumber, "NetworkMessageNumber must be '1'" ) ) TC_Variables.Result = false;

        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );