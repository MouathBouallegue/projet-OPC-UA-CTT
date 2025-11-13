/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CloseConnections method removes a single PubSub Connection
                  with Mode PublisherSubscriber utilizing customized DataSets.
    Requirements: - The Mode PublisherSubscriber is supported
                  - The input and output data is varying equal or faster than the publishing rate
          Step 1: Use the connection information of a PubSub connection supporting Mode PublisherSubscriber
                  that utilizes customized DataSets to establish a single connection. 
          Step 2: Call CloseConnections. Provide the ConnectionEndpoint created in the previous
                  step in the ConnectionEndpoints argument and set Remove to TRUE.
          Step 3: Browse the ConnectionEndpoints Folder.
          Step 4: Read the value of all variables in the InputData folder belonging to the
                  closed connection. Wait for the duration of the publishing interval and
                  read the values the second time. Wait another duration of the publishing
                  interval and read the values the third time. 
          Step 5: Ensure that the CTT is not receiveing data from the closed connection. Wait
                  for the duration of the publishing interval and check the second time.
                  Wait another duration of the publishing interval and check the third
                  time. 
*/

function Test_010() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Use the connection information of a PubSub connection supporting Mode PublisherSubscriber
    //         that utilizes customized DataSets to establish a single connection. 
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
                
                // Step 3: Browse the ConnectionEndpoints Folder.
                if( NodeExistsInAddressSpace( connectionEndpointId ) ) {
                    addError( "Step 3: Created ConnectionEndpoint with NodeId '" + connectionEndpointId + "' is still present in the AddressSpace of the server" );
                    TC_Variables.Result = false;
                }
                
                // Step 4: Read the value of all variables in the InputData folder belonging to the
                //         closed connection. Wait for the duration of the publishing interval and
                //         read the values the second time. Wait another duration of the publishing
                //         interval and read the values the third time. 
                var publishingInterval = callResult.PubSubConfig_Server.Connections[0].WriterGroups[0].PublishingInterval;
                    
                var inputDataVariables = GetInputDataVariables( {
                    InputDataFolder: FE_PubSub.InputData
                } );
                
                if( ReadHelper.Execute( { NodesToRead: inputDataVariables } ) ) {
                    // Cache read values
                    var inputDataVariablesCached = [];
                    for( var c=0; c<inputDataVariables.length; c++ ) inputDataVariablesCached.push( inputDataVariables[c].Value.Value.clone() );
                    
                    // Read second and third time
                    for( var r=0; r<2; r++ ) {
                        addLog( "Step 4: Waiting for the duration of the PublishingInterval of " + publishingInterval + " ms" );
                        UaDateTime.CountDown( { Msecs: publishingInterval } );
                        if( ReadHelper.Execute( { NodesToRead: inputDataVariables } ) ) {
                            // Compare values
                            for( var c=0; c<inputDataVariables.length; c++ ) {
                                if( !Assert.Equal( inputDataVariablesCached[c], inputDataVariables[c].Value.Value, "Step 4: Received an unexpected change of the value of InputData variable '" + inputDataVariables[c].NodeId + "'" ) ) TC_Variables.Result = false;
                            }
                        }
                        else TC_Variables.Result = false;
                    }
                
                }
                else TC_Variables.Result = false;
                
                // Step 5: Ensure that the CTT is not receiveing data from the closed connection. Wait
                //         for the duration of the publishing interval and check the second time.
                //         Wait another duration of the publishing interval and check the third
                //         time. 
                addLog( "Step 5: Setting timeout of CollectNetworkMessageData to 2 times the PublishingInterval of " + publishingInterval + " ms" );
                var receivedMessages = CollectNetworkMessageData( {
                    SubscriberConfiguration: callResult.PubSubConfig_CTT,
                    Timeout:                 publishingInterval * 2,
                    MaxNumberOfMessages:     1,
                    SuppressMessages:        true
                } );
                
                if( receivedMessages.length > 0 ) {
                    addError( "Step 5: Unexpectedly received data from the removed connection" );
                    TC_Variables.Result = false;
                }
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

Test.Execute( { Procedure: Test_010 } );