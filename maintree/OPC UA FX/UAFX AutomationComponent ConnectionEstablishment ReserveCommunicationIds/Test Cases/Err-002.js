/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Reserve more DataSetWriterds than supported.
         Step 1: Read the value of the MaxDataSetWriters variable of the PubSub Capabilities
                 Object.
         Step 2: Use any supported TransportProfileUri to construct the ReserveCommunicationIds
                 argument. Request #MaxDataSetWriters+1 DataSetWriters and a single WriterGroup.
         Step 3: Call EstablishConnection Method with ReserveCommunicationIdsCmd set.
                 All other command bits are not set.
*/

function Test_Err_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.TC001_Failed ) {
        addSkipped( "TC001 failed. Skipping test." );
        return( false );
    }
    
    // If PublishSubscribe is not exposed, this becomes a manual test
    if( isDefined( CU_Variables.PublishSubscribeObject ) ) {
        
        // Step 1: Read the value of the MaxDataSetWriters variable of the PubSub Capabilities
        //         Object.
        if( isDefined( CU_Variables.MaxDataSetWriters ) ) {
            
            if( CU_Variables.MaxDataSetWriters > 0 ) {
                  
                // Run test for all AutomationComponents
                for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) { 
                    
                    addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        
                    // Step 2: Use any supported TransportProfileUri to construct the ReserveCommunicationIds
                    //         argument. Request #MaxDataSetWriters+1 DataSetWriters and a single WriterGroup.
                    // Step 3: Call EstablishConnection Method with ReserveCommunicationIdsCmd set.
                    //         All other command bits are not set.
                              
                    var result = callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( {
                        AutomationComponent: CU_Variables.Test.AutomationComponents[ac],
                        TransportProfileUri: CU_Variables.SupportedTransportProfiles[0],
                        NumReqDataSetWriterIds: CU_Variables.MaxDataSetWriters + 1,
                        NumReqWriterGroupIds: 1,
                        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadResourceUnavailable ) ]
                    } );
                    
                    if( !result.success ) TC_Variables.Result = false;
                    
                    addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
                        
                }
            
            }
            else {
                addError( "Step 1: PubSubCapabilities.MaxDataSetWriters is 0" );
                TC_Variables.Result = false;
            }
            
        }
        else {
            notImplemented( "PubSubCapabilities.MaxDataSetWriters is not exposed in the server. Please execute this test case manually." );
            TC_Variables.Result = false;
        }
    }
    else {
        notImplemented( "PublishSubscribe object is not exposed in the server. Please execute this test case manually." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_002 } );