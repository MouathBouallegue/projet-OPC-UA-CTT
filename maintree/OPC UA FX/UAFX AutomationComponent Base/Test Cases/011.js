/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CloseConnections method removes multiple PubSub Connections.
    Requirements: - The Mode PublisherSubscriber is supported
                  - The input and output data is varying equal or faster than the publishing rate
                  - Customized DataSets are supported
          Step 1: Use the connection information of any connections  to establish multiple
                  connections (use #MaxConnections if provided or 10). 
          Step 2: Call CloseConnections. Provide the ConnectionEndpoints created in the previous
                  step in the ConnectionEndpoints argument and set Remove to TRUE.
          Step 3: Browse the ConnectionEndpoints Folder.
          Step 4: Read the value of all variables in the InputData folder belonging to the
                  closed connection. Wait for the duration of the publishing interval and
                  read the values the second time. Wait another duration of the publishing
                  interval and read the values the third time. 
          Step 5: Ensure that the CTT is not receiveing data from the closed connections.
                  Wait for the duration of the publishing interval and check the second
                  time. Wait another duration of the publishing interval and check the
                  third time. 
*/

function Test_011() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.MaxConnections = 10;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Get MaxConnections
    if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities ) ) {
        if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnections ) ) {
            var maxConnectionsValue = GetValueOfNodeByNodeId( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnections.NodeId );
            if( isDefined( maxConnectionsValue ) && !maxConnectionsValue.isEmpty() ) {
                TC_Variables.MaxConnections = maxConnectionsValue.toUInt32();
            }
        }
    }
    
    // Step 1: Use the connection information of any connections  to establish multiple
    //         connections (use #MaxConnections if provided or 10). 
    var connectionEndpointIds = [];
    
    for( var k=0; k<TC_Variables.MaxConnections; k++ ) {
        addLog( "EstablishingConnection #" + (k+1) + " between CTT and FunctionalEntity '" + FE_PubSub.NodeId + "'..." );
        UaOpcServer.restartServer( { SkipTestReconnect: true, ClearPubSubConfig: true } );
        var callResult = EstablishConnectionsToCTT( {
            Settings: [ {
                FunctionalEntity: FE_PubSub,
                Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber,
                ConnectionEndpointName: "Connection_" + ( k + 1 ),
                ConnectionName: "CttGeneratedConnection_" + ( k + 1 ),
                PublishedDataSetName: "CTT_UAFX_Writer_" + ( k + 1 ),
                PublisherId_CTT: UaVariant.New( { Type: BuiltInType.UInt64, Value: ( 32020 + k ) } ),
                PublisherId_Server: UaVariant.New( { Type: BuiltInType.UInt64, Value: ( 33020 + k ) } )
            } ],
            MergeConfig: true
        } );
    
        if( callResult !== false && callResult.success ) {
            if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
                var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                connectionEndpointIds.push( connectionEndpointId );
            }
            else {
                addError( "Step 1: Call #" + (k+1) + " to EstablishConnections for FunctionalEntity '" + FE_PubSub.NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addError( "Step 1: Failed to establish the connection between the CTT and the FunctionalEntity '" + FE_PubSub.NodeId + "' on Iteration #" + (k+1) + ". Aborting test." );
            TC_Variables.Result = false;
        }
        if( !TC_Variables.Result ) break;
    }
    
    if( TC_Variables.Result ) {
        // Check if Data is received for all connections
        var timeout = callResult.PubSubConfig_Server.Connections[0].WriterGroups[0].PublishingInterval * TC_Variables.MaxConnections * 2;
        
        var receivedMessages = CollectNetworkMessageData( {
            SubscriberConfiguration: callResult.PubSubConfig_CTT,
            Timeout:                 timeout,
            MaxNumberOfMessages:     2 * TC_Variables.MaxConnections,
            SuppressMessages:        true
        } );
        
        if( receivedMessages.length > 0 ) {
            // Check if a message was received for each PublisherId set in the EstablishConnectionsToCTT calls before
            for( var k=0; k<TC_Variables.MaxConnections; k++ ) {
                var publisherId = 33020 + k;
                for( var m=0; m<receivedMessages.length; m++ ) {
                    if( receivedMessages[m].NetworkMessageHeader.PublisherId == publisherId ) {
                        addLog( "Received message for Connection #" + (k+1) + " (PublisherId: " + publisherId + "): " + receivedMessages[m].getRawNetworkMessageData() );
                        break;
                    }
                    if( m == receivedMessages.length - 1) {
                        addError( "Step 1: Did not receive any NetworkMessages for Connection #" + (k+1) + " (PublisherId: " + publisherId + "). Connection is not up and running. Aborting test." );
                        TC_Variables.Result = false;
                    }
                }
            }
        }
        else {
            addError( "Step 1: Did not receive any NetworkMessages within " + timeout + " ms. Connections are not up and running. Aborting test." );
            TC_Variables.Result = false;
        }
    }
    
    if( TC_Variables.Result ) {
        // Step 2: Call CloseConnections. Provide the ConnectionEndpoints created in the previous
        //         step in the ConnectionEndpoints argument and set Remove to TRUE.
        if( callCloseConnectionsMethod( {
            AutomationComponent: FE_PubSub.ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointIds,
            Remove: true
        } ).success ) {           
            
            refreshBaseVariablesModelMapByNodeId( FE_PubSub.NodeId, CU_Variables.SessionThread );
            refreshBaseVariablesModelMapByNodeId( new UaNodeId( Identifier.PublishSubscribe ), CU_Variables.SessionThread );
                    
            var connectionEndpoint_mIs = MonitoredItem.fromNodeIds( connectionEndpointIds );
            
            // Step 3: Browse the ConnectionEndpoints Folder.
            for( var s=0; s<connectionEndpoint_mIs.length; s++ ) {
                if( NodeExistsInAddressSpace( connectionEndpoint_mIs[s].NodeId ) ) {
                    addError( "Step 3: Created ConnectionEndpoint with NodeId '" + connectionEndpoint_mIs[s].NodeId + "' is still present in the AddressSpace of the server" );
                    TC_Variables.Result = false;
                }
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
                
            // Step 5: Ensure that the CTT is not receiveing data from the closed connections.
            //         Wait for the duration of the publishing interval and check the second
            //         time. Wait another duration of the publishing interval and check the
            //         third time. 
            var receivedMessages = CollectNetworkMessageData( {
                SubscriberConfiguration: callResult.PubSubConfig_CTT,
                Timeout:                 publishingInterval * 2,
                MaxNumberOfMessages:     1,
                SuppressMessages:        true
            } );
            
            if( receivedMessages.length > 0 ) {
                addError( "Step 5: Unexpectedly received data from the disabled connections" );
                TC_Variables.Result = false;
            }
            
        }
        else {
            addError( "Step 2: Calling CloseConnections was not successful. Aborting test." );
            TC_Variables.Result = false;
        }
    }
    
    // Cleanup created connection endpoint and PubSubConfig
    for( var k=0; k<TC_Variables.MaxConnections; k++ ) {
        if( !callCloseConnectionsMethod( {
            AutomationComponent: FE_PubSub.ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointIds[k],
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
    }
    UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_011 } );