/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CloseConnections method disables a single PubSub Connection
                  with Mode Subscriber.
    Requirements: The Mode Subscriber is supported
          Step 1: Use the connection information of a PubSub connection supporting Mode Subscriber
                  to establish a connection. 
          Step 2: Call CloseConnections. Provide the ConnectionEndpoint created in the previous
                  step in the ConnectionEndpoints argument and set Remove to FALSE.
          Step 3: Read the value of the Status variable from the ConnectionEndpoint disabled
                  in the previous step.
          Step 4: Read the value of the State variable (Status object) from the DataSetReader
                  referenced by the ConnectionEndpoint (which was used for the connection
                  in the previous steps). 
          Step 5: Read the value of all variables in the InputData folder belonging to the
                  closed connection. Wait for the duration of the publishing interval and
                  read the values the second time. Wait another duration of the publishing
                  interval and read the values the third time. 
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    UaOpcServer.restartServer( { SkipTestReconnect: true } );
    
    // Connect to embedded server for this test (Read/Write needed)
    var doDisconnect = false;
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    var tempReadHelper = new ReadService( { Session: UaOpcServer.Session } );
    var tempWriteHelper = new WriteService( { Session: UaOpcServer.Session } );
    
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Use the connection information of a PubSub connection supporting Mode Subscriber
    //         to establish a connection. 
    addLog( "EstablishingConnection between CTT and FunctionalEntity '" + FE_PubSub.NodeId + "'..." );
    var callResult = EstablishConnectionsToCTT( {
        Settings: [ {
            FunctionalEntity: FE_PubSub,
            Mode: PubSubConnectionEndpointModeEnum.Subscriber
        } ]
    } );
    
    if( callResult !== false && callResult.success ) {
        if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
            var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
            
            var publishingInterval = callResult.PubSubConfig_CTT.Connections[0].WriterGroups[0].PublishingInterval;
                                
            // Check if InputData is changing
            var inputDataVariables = GetInputDataVariables( { InputDataFolder: FE_PubSub.InputData } );
            if( ReadHelper.Execute( { NodesToRead: inputDataVariables[0] } ) ) {
                var valueBefore = UaVariantToSimpleType( inputDataVariables[0].Value.Value );
                
                // Change values in the OutputData folder in the CTT Server
                for( var i=0; i<inputDataVariables.length; i++ ) {
                    var tempOutputVariable_CTT_Server_mI = new MonitoredItem( inputDataVariables[i].NodeId.clone() );
                    tempOutputVariable_CTT_Server_mI.NodeId.NamespaceIndex = CTT_NamespaceIndex;
                    tempReadHelper.Execute( { NodesToRead: tempOutputVariable_CTT_Server_mI } );
                    UaVariant.Increment( { Value: tempOutputVariable_CTT_Server_mI.Value.Value } );
                    tempWriteHelper.Execute( { NodesToWrite: tempOutputVariable_CTT_Server_mI } );
                }
                
                // Wait for the duration of one PublishingInterval for the InputData to update
                UaDateTime.CountDown( { Msecs: publishingInterval } );
                
                if( ReadHelper.Execute( { NodesToRead: inputDataVariables[0] } ) ) {
                    var valueAfter = UaVariantToSimpleType( inputDataVariables[0].Value.Value );
                    if( Assert.NotEqual( valueBefore, valueAfter, "Step 1: InputData variable '" + inputDataVariables[0].NodeId + "' of FunctionalEntity '" + FE_PubSub.NodeId + "' did not change after one PublishingInterval. Connection is not up and running." ) ) {
                        
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
                        
                        // Step 4: Read the value of the State variable (Status object) from the DataSetReader
                        //         referenced by the ConnectionEndpoint (which was used for the connection
                        //         in the previous steps). 
                        var ToDataSetReader_targets = GetChildNodesByReferenceTypeId( connectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetReader.NodeId );
                        
                        if( ToDataSetReader_targets.length > 0 ) {
                            if( isDefined( ToDataSetReader_targets[0].NodeId ) && !ToDataSetReader_targets[0].NodeId.equals( new UaNodeId() ) ) {
                                refreshBaseVariablesModelMapByNodeId( new UaNodeId( Identifier.PublishSubscribe ), CU_Variables.SessionThread );
                                SetAllChildren_recursive( ToDataSetReader_targets[0] );
                                if( ReadHelper.Execute( { NodesToRead: ToDataSetReader_targets[0].Status.State } ) ) {
                                    var stateValue = ToDataSetReader_targets[0].Status.State.Value.Value.toInt32();
                                    if( !Assert.Equal( PubSubState.Disabled, stateValue, "Step 4: Received unexpected value for 'State' variable of DataSetReader '" + ToDataSetReader_targets[0].NodeId + "'" ) ) TC_Variables.Result = false;
                                } else TC_Variables.Result = false;
                                
                                // Step 5: Read the value of all variables in the InputData folder belonging to the
                                //         closed connection. Wait for the duration of the publishing interval and
                                //         read the values the second time. Wait another duration of the publishing
                                //         interval and read the values the third time. 
                                if( ReadHelper.Execute( { NodesToRead: inputDataVariables[0] } ) ) {
                                    var valueBefore = UaVariantToSimpleType( inputDataVariables[0].Value.Value );
                                    
                                    // Change values in the OutputData folder in the CTT Server
                                    for( var i=0; i<inputDataVariables.length; i++ ) {
                                        var tempOutputVariable_CTT_Server_mI = new MonitoredItem( inputDataVariables[i].NodeId.clone() );
                                        tempOutputVariable_CTT_Server_mI.NodeId.NamespaceIndex = CTT_NamespaceIndex;
                                        tempReadHelper.Execute( { NodesToRead: tempOutputVariable_CTT_Server_mI } );
                                        UaVariant.Increment( { Item: tempOutputVariable_CTT_Server_mI } );
                                        tempWriteHelper.Execute( { NodesToWrite: tempOutputVariable_CTT_Server_mI } );
                                    }
                
                                    // Wait for the duration of one PublishingInterval
                                    UaDateTime.CountDown( { Msecs: publishingInterval } );
                                    
                                    if( ReadHelper.Execute( { NodesToRead: inputDataVariables[0] } ) ) {
                                        var valueAfter = UaVariantToSimpleType( inputDataVariables[0].Value.Value );
                                        if( Assert.Equal( valueBefore, valueAfter, "Step 5: Received unexpected change for the value attribute of InputData variable '" + inputDataVariables[0].NodeId + "'" ) ) {
                                            
                                            // Wait for the duration of one PublishingInterval a second time
                                            UaDateTime.CountDown( { Msecs: publishingInterval } );
                                    
                                            if( ReadHelper.Execute( { NodesToRead: inputDataVariables[0] } ) ) {
                                                var valueAfter = UaVariantToSimpleType( inputDataVariables[0].Value.Value );
                                                if( !Assert.Equal( valueBefore, valueAfter, "Step 5: Received unexpected change for the value attribute of InputData variable '" + inputDataVariables[0].NodeId + "'" ) ) TC_Variables.Result = false;
                                            }
                                            else TC_Variables.Result = false;
                                        }
                                        else TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                                
                            }
                            else {
                                addError( "Step 4: The ToDataSetReader reference of ConnectionEndpoint '" + connectionEndpointId + "' has an empty target NodeId" );
                                TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Step 4: No ToDataSetReader reference found on ConnectionEndpoint '" + connectionEndpointId + "', which is required for Mode 'Subscriber'." );
                            TC_Variables.Result = false;
                        }
                
                    }
                    else TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else TC_Variables.Result = false;
            
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
    
    delete tempWriteHelper;
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );