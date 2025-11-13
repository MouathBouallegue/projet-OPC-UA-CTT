/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CloseConnections method disables a single PubSub Connection
                  with Mode PublisherSubscriber.
    Requirements: - The Mode PublisherSubscriber is supported
                  - The input and output data is varying equal or faster than the publishing rate
          Step 1: Use the connection information of a PubSub connection supporting Mode PublisherSubscriber
                  to establish a connection. 
          Step 2: Call CloseConnections. Provide the ConnectionEndpoint created in the previous
                  step in the ConnectionEndpoints argument and set Remove to FALSE.
          Step 3: Read the value of the Status variable from the ConnectionEndpoint disabled
                  in the previous step.
          Step 4: Read the values of the State variables (Status object) from the DataSetReader
                  and DataSetWriter referenced by the ConnectionEndpoint (which was used
                  for the connection in the previous steps). 
          Step 5: Read the value of all variables in the InputData folder belonging to the
                  closed connection. Wait for the duration of the publishing interval and
                  read the values the second time. Wait another duration of the publishing
                  interval and read the values the third time. 
          Step 6: Ensure that the CTT is not receiveing data from the closed connections.
                  Wait for the duration of the publishing interval and check the second
                  time. Wait another duration of the publishing interval and check the
                  third time. 
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Use the connection information of a PubSub connection supporting Mode PublisherSubscriber
    //         to establish a connection. 
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
                //         step in the ConnectionEndpoints argument and set Remove to FALSE.
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: FE_PubSub.ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    Remove: false
                } ).success ) {
                    addError( "Step 2: Calling CloseConnections was not successful. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Step 3: Read the value of the Status variable from the ConnectionEndpoint disabled
                //         in the previous step.
                refreshBaseVariablesModelMapByNodeId( FE_PubSub.NodeId, CU_Variables.SessionThread );
                
                var connectionEndpoint_mI = new MonitoredItem( connectionEndpointId );
                SetAllChildren_recursive( connectionEndpoint_mI );
                
                if( ReadHelper.Execute( { NodesToRead: connectionEndpoint_mI.Status } ) ) {
                    var statusValue = connectionEndpoint_mI.Status.Value.Value.toInt32();
                    if( !Assert.Equal( ConnectionEndpointStatusEnum.Ready, statusValue, "Step 3: Received unexpected value for 'Status' variable of ConnectionEndpoint '" + connectionEndpointId + "'" ) ) TC_Variables.Result = false;
                } else TC_Variables.Result = false;
                
                // Step 4: Read the values of the State variables (Status object) from the DataSetReader
                //         and DataSetWriter referenced by the ConnectionEndpoint (which was used
                //         for the connection in the previous steps). 
                var ToDataSetWriter_targets = GetChildNodesByReferenceTypeId( connectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetWriter.NodeId );
                var ToDataSetReader_targets = GetChildNodesByReferenceTypeId( connectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetReader.NodeId );
                
                if( ToDataSetWriter_targets.length > 0 && ToDataSetReader_targets.length > 0 ) {
                    if( isDefined( ToDataSetWriter_targets[0].NodeId ) &&
                        !ToDataSetWriter_targets[0].NodeId.equals( new UaNodeId() ) &&
                        isDefined( ToDataSetReader_targets[0].NodeId ) &&
                        !ToDataSetReader_targets[0].NodeId.equals( new UaNodeId() ) 
                    ) {
                        refreshBaseVariablesModelMapByNodeId( new UaNodeId( Identifier.PublishSubscribe ), CU_Variables.SessionThread );
                        SetAllChildren_recursive( ToDataSetWriter_targets[0] );
                        SetAllChildren_recursive( ToDataSetReader_targets[0] );
                        if( ReadHelper.Execute( { NodesToRead: [ ToDataSetWriter_targets[0].Status.State, ToDataSetReader_targets[0].Status.State ] } ) ) {
                            var stateValueWriter = ToDataSetWriter_targets[0].Status.State.Value.Value.toInt32();
                            var stateValueReader = ToDataSetReader_targets[0].Status.State.Value.Value.toInt32();
                            if( !Assert.Equal( PubSubState.Disabled, stateValueWriter, "Step 4: Received unexpected value for 'State' variable of DataSetWriter '" + ToDataSetWriter_targets[0].NodeId + "'" ) ) TC_Variables.Result = false;
                            if( !Assert.Equal( PubSubState.Disabled, stateValueReader, "Step 4: Received unexpected value for 'State' variable of DataSetReader '" + ToDataSetReader_targets[0].NodeId + "'" ) ) TC_Variables.Result = false;
                        } else TC_Variables.Result = false;
                        
                        // Step 5: Read the value of all variables in the InputData folder belonging to the
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
                                addLog( "Step 5: Waiting for the duration of the PublishingInterval of " + publishingInterval + " ms" );
                                UaDateTime.CountDown( { Msecs: publishingInterval } );
                                if( ReadHelper.Execute( { NodesToRead: inputDataVariables } ) ) {
                                    // Compare values
                                    for( var c=0; c<inputDataVariables.length; c++ ) {
                                        if( !Assert.Equal( inputDataVariablesCached[c], inputDataVariables[c].Value.Value, "Step 5: Received an unexpected change of the value of InputData variable '" + inputDataVariables[c].NodeId + "'" ) ) TC_Variables.Result = false;
                                    }
                                }
                                else TC_Variables.Result = false;
                            }
                        
                        }
                        else TC_Variables.Result = false;
                        
                        // Step 6: Ensure that the CTT is not receiveing data from the closed connections.
                        //         Wait for the duration of the publishing interval and check the second
                        //         time. Wait another duration of the publishing interval and check the
                        //         third time.
                        var publishingInterval = callResult.PubSubConfig_Server.Connections[0].WriterGroups[0].PublishingInterval;
                        addLog( "Step 6: Setting timeout of CollectNetworkMessageData to 2 times the PublishingInterval of " + publishingInterval + " ms" );
                        var receivedMessages = CollectNetworkMessageData( {
                            SubscriberConfiguration: callResult.PubSubConfig_CTT,
                            Timeout:                 publishingInterval * 2,
                            MaxNumberOfMessages:     1,
                            SuppressMessages:        true
                        } );
                        
                        if( receivedMessages.length > 0 ) {
                            addError( "Step 6: Unexpectedly received data from the disabled connection" );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Step 4: The ToDataSetWriter and/or ToDataSetReader references of ConnectionEndpoint '" + connectionEndpointId + "' has an empty target NodeId" );
                        TC_Variables.Result = false;
                    }
                }
                else {
                    addError( "Step 4: No ToDataSetWriter and/or ToDataSetReader references found on ConnectionEndpoint '" + connectionEndpointId + "', which both are required for Mode 'PublisherSubscriber'." );
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

Test.Execute( { Procedure: Test_006 } );