/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Reserve communication Ids for a single DataSetWriter and a single WriterGroup
                  in a single EstablishConnections call.
    Requirements: - AutomationComponent supports Mode Publisher or PublisherSubscriber.
                  - If BundledRequried is set this becomes a manual test.
          Step 1: Use any supported TransportProfileUri to construct the ReserveCommunicationIds
                  argument. Request Ids for a single DataSetWriter and a single WriterGroup.
          Step 2: Call EstablishConnection Method with ReserveCommunicationIdsCmd set.
                  All other command bits are not set.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Run test for all AutomationComponents
    for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
        if( isCommandBundleRequiredSet( CU_Variables.Test.AutomationComponents[ac] ) ) {
            notImplemented( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "'. Please test this AutomationComponent manually." );
            TC_Variables.Result = false;
            continue;
        }
        
        addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        
        // Step 1: Use any supported TransportProfileUri to construct the ReserveCommunicationIds
        //         argument. Request Ids for a single DataSetWriter and a single WriterGroup.
        // Step 2: Call EstablishConnection Method with ReserveCommunicationIdsCmd set.
        //         All other command bits are not set.
                  
        var result = callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( {
            AutomationComponent: CU_Variables.Test.AutomationComponents[ac],
            TransportProfileUri: CU_Variables.SupportedTransportProfiles[0],
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
        
        addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        
    }
    
    CU_Variables.TC001_Failed = !TC_Variables.Result;
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );