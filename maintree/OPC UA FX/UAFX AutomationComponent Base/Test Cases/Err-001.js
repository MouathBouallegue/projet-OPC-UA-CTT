/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the behavior of the CloseConnections Method if a NodeId for the requested
                 ConnectionEndpoint is provided that does not exist in the Server address
                 space.
         Step 1: Use the connection information of any dynamically created connection to
                 establish a single connection.
         Step 2: Call CloseConnections. Provide the ConnectionEndpoint created in the previous
                 step in the ConnectionEndpoints argument and set Remove to TRUE.
         Step 3: Repeat step 2.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Use the connection information of any dynamically created connection to
    //         establish a single connection.
    addLog( "EstablishingConnection between CTT and FunctionalEntity '" + FE_PubSub.NodeId + "'..." );
    UaOpcServer.restartServer( { SkipTestReconnect: true } );
    var callResult = EstablishConnectionsToCTT( {
        Settings: [ {
            FunctionalEntity: FE_PubSub,
            Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber
        } ]
    } );
    
    if( callResult !== false && callResult.success ) {
        if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
            var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
        
            // Check if Data is received
            var receivedMessages = CollectNetworkMessageData( {
                SubscriberConfiguration: callResult.PubSubConfig_CTT,
                Timeout:                 5000,
                MaxNumberOfMessages:     1,
                SuppressMessages:        true
            } );

            if( receivedMessages.length > 0 ) {
                addLog( "Received message: " + receivedMessages[0].getRawNetworkMessageData() );
                // Step 2: Call CloseConnections. Provide the ConnectionEndpoint created in the previous
                //         step in the ConnectionEndpoints argument and set Remove to TRUE.
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: FE_PubSub.ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    Remove: true
                } ).success ) {
                    addError( "Step 2: Calling CloseConnections was not successful" );
                    TC_Variables.Result = false;
                }
                
                // Step 3: Repeat step 2.
                var callResult = callCloseConnectionsMethod( {
                    AutomationComponent: FE_PubSub.ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    Remove: true,
                    SkipResultValidation: true,
                    OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
                } );
                if( callResult.success ) {
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadNodeIdUnknown ), callResult.Results[0], "Step 3: Received unexpected StatusCode in the Results argument returned by the CloseConnections call" ) ) TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else {
                addError( "Step 1: Did not receive any NetworkMessages within 5000 ms. Connection is not up and running." );
                TC_Variables.Result = false;
            }
            
        }
        else {
            addError( "Step 1: Call to EstablishConnections for FunctionalEntity '" + FE_PubSub.NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
            TC_Variables.Result = false;
        }
        
        // Cleanup created connection endpoint and PubSubConfig
        if( !callCloseConnectionsMethod( {
            AutomationComponent: FE_PubSub.ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointId,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
        UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
    }
    else {
        addError( "Step 1: Failed to establish the connection between the CTT and the FunctionalEntity '" + FE_PubSub.NodeId + "'. Aborting test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_001 } );