/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Reserve communication lds for the maximum supported number of WriterGroups
                 in a single EstablishConnections call.
         Step 1: Read the value of the MaxWriterGroups variable of the PubSub Capabilities
                 Object.
         Step 2: Use any TransportProfileUri to construct the ReserveCommunicationIds argument.
                 Request Ids for a single DataSetWriters and #MaxWriterGroups WriterGroups.
         Step 3: Call EstablishConnections Method with ReserveCommunicationIdsCmd set.
                 All other command bits are not set.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.TC001_Failed ) {
        addSkipped( "TC001 failed. Skipping test." );
        return( false );
    }
    
    // If PublishSubscribe is not exposed, this becomes a manual test
    if( isDefined( CU_Variables.PublishSubscribeObject ) ) {
        
        // Step 1: Read the value of the MaxWriterGroups variable of the PubSub Capabilities
        //         Object.
        if( isDefined( CU_Variables.MaxWriterGroups ) ) {
            
            if( CU_Variables.MaxWriterGroups > 0 ) {
                  
                // Run test for all AutomationComponents
                for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) { 
                    
                    addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        
                    // Step 2: Use any TransportProfileUri to construct the ReserveCommunicationIds argument.
                    //         Request Ids for a single DataSetWriters and #MaxWriterGroups WriterGroups.
                    // Step 3: Call EstablishConnections Method with ReserveCommunicationIdsCmd set.
                    //         All other command bits are not set.
                              
                    var result = callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( {
                        AutomationComponent: CU_Variables.Test.AutomationComponents[ac],
                        TransportProfileUri: CU_Variables.SupportedTransportProfiles[0],
                        NumReqDataSetWriterIds: 1,
                        NumReqWriterGroupIds: CU_Variables.MaxWriterGroups
                    } );
                    
                    if( result.success ) {
                        if( isDefined( result.ReserveCommunicationIdsResults ) && result.ReserveCommunicationIdsResults.length > 0 ) {
                            
                            // Check results
                            if( isDefined( CU_Variables.DefaultDatagramPublisherId ) ) {
                                if( !Assert.Equal( CU_Variables.DefaultDatagramPublisherId, result.ReserveCommunicationIdsResults[0].DefaultPublisherId, "Received an unexpected value for the DefaultPublisherId output argument" ) ) TC_Variables.Result = false;
                            }
                            else {
                                if( !Assert.GreaterThan( 0, result.ReserveCommunicationIdsResults[0].DefaultPublisherId, "Received an unexpected value for the DefaultPublisherId output argument" ) ) TC_Variables.Result = false;
                            }
                            if( !Assert.Equal( CU_Variables.MaxWriterGroups.toUInt32(), result.ReserveCommunicationIdsResults[0].WriterGroupIds.length, "Received an unexpected size for the WriterGroupIds output argument" ) ) TC_Variables.Result = false;
                            if( !Assert.Equal( 1, result.ReserveCommunicationIdsResults[0].DataSetWriterIds.length, "Received an unexpected size for the DataSetWriterIds output argument" ) ) TC_Variables.Result = false;
                            
                        }
                        else {
                            addError( "Received empty ReserveCommunicationIdsResults argument after calling EstablishConnections method of AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "'" );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Failed to call ReserveCommunicationIds command over EstablishConnections method of AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "'" );
                        TC_Variables.Result = false;
                    }
                    
                    addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
                        
                }
            
            }
            else {
                addError( "Step 1: PubSubCapabilities.MaxWriterGroups is 0" );
                TC_Variables.Result = false;
            }
            
        }
        else {
            notImplemented( "PubSubCapabilities.MaxWriterGroups is not exposed in the server. Please execute this test case manually." );
            TC_Variables.Result = false;
        }
    }
    else {
        notImplemented( "PublishSubscribe object is not exposed in the server. Please execute this test case manually." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );