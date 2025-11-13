/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Reserve communication ids for every supported transport profile. 
    Requirements: If PublishSubscribe is not exposed this becomes a manual test.
          Step 1: Read the value of the SupportedTransportProfile property of the
                  PublishSubscribe Object.
          Step 2: Use the TransportProfileUri on index 0 of the SupportedTransportProfiles
                  property to construct the ReserveCommunicationIds argument.
                  Request Ids for a single DataSetWriter and a single WriterGroup.
          Step 3: Call EstablishConnections Method with ReserveCommunicationIdsCmd set.
                  All other command bits are not set.
          Step 4: Repeat previous steps for every supported transport profile.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.TC001_Failed ) {
        addSkipped( "TC001 failed. Skipping test." );
        return( false );
    }
    
    // If PublishSubscribe is not exposed, this becomes a manual test
    if( isDefined( CU_Variables.PublishSubscribeObject ) ) {
        
        // Step 1: Read the value of the SupportedTransportProfile property of the
        //         PublishSubscribe Object.
        if( CU_Variables.SupportedTransportProfiles.length > 0 ) {
                  
            // Run test for all AutomationComponents
            for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {                
                addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
                
                // Step 4: Repeat previous steps for every supported transport profile.
                for( var tp=0; tp<CU_Variables.SupportedTransportProfiles.length; tp++ ) {
                    
                    // Step 2: Use the TransportProfileUri on index 0 of the SupportedTransportProfiles
                    //         property to construct the ReserveCommunicationIds argument.
                    //         Request Ids for a single DataSetWriter and a single WriterGroup.
                    // Step 3: Call EstablishConnections Method with ReserveCommunicationIdsCmd set.
                    //         All other command bits are not set.
                    
                    addLog( "Calling EstablishConnections(ReserveCommunicationIdsCmd) with Transport Profile Uri '" + CU_Variables.SupportedTransportProfiles[tp] + "'" );
                    var result = callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( {
                        AutomationComponent: CU_Variables.Test.AutomationComponents[ac],
                        TransportProfileUri: CU_Variables.SupportedTransportProfiles[tp],
                        NumReqDataSetWriterIds: 1,
                        NumReqWriterGroupIds: 1
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
                            if( !Assert.Equal( 1, result.ReserveCommunicationIdsResults[0].WriterGroupIds.length, "Received an unexpected size for the WriterGroupIds output argument" ) ) TC_Variables.Result = false;
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
                    
                }
                
                addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
                
            }
            
        }
        else {
            addError( "The size of the SupportedTransportProfile property of the PublishSubscribe Object is 0. Aborting test." );
            TC_Variables.Result = false;
        }
    }
    else {
        notImplemented( "PublishSubscribe object is not exposed in the server. Please execute this test case manually." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );