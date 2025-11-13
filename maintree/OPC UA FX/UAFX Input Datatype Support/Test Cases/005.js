/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Establish a connection utilizing variables of datatypes: Boolean, Sbyte,
                 Int16, UInt16, Int32, UInt32 and Float as output data
         Step 1: Establish one ore more connections to the product
         Step 2: Review the sent values
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.AlreadyCheckedFEs = [];
    
    if( typeof( Test_004 ) !== 'undefined' ) {
        // Print missing DataTypes
        for( var n=0; n<CU_Variables.OutputNodeOfTypeExists.length; n++ ) {
            if( !CU_Variables.OutputNodeOfTypeExists[n] ) {
                addWarning( "Skipping DataType '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' as no OutputData variable of this type was found in TC 004 before" );
                continue;
            }
            
            if( ArrayContains( TC_Variables.AlreadyCheckedFEs, CU_Variables.OutputNodeOfType_FE[n].NodeId.toString() ) ) continue;
            
            // Step 1: Establish one or more connections to the product
            UaOpcServer.restartServer( { SkipTestReconnect: true } );
            
            // Establish Connection
            addLog( "EstablishingConnection between CTT and FunctionalEntity '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "'..." );
            TC_Variables.AlreadyCheckedFEs.push( CU_Variables.OutputNodeOfType_FE[n].NodeId.toString() );
            
            var callResult = EstablishConnectionsToCTT( {
                Settings: [ {
                    FunctionalEntity: CU_Variables.OutputNodeOfType_FE[n],
                    Mode: PubSubConnectionEndpointModeEnum.Publisher
                } ]
            } );
            
            if( callResult !== false && callResult.success ) {
                if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    
                    var publishingInterval = callResult.PubSubConfig_Server.Connections[0].WriterGroups[0].PublishingInterval;
                    
                    // Check if OutputData is changing for every OutputData variable found by TC 004
                    var publishedVariables = callResult.PubSubConfig_Server.PublishedDataSets[0].DataSetSource.toPublishedDataItemsDataType().PublishedData;
                    var outputDataVariables = [];
                    for( var v=0; v<publishedVariables.length; v++ ) outputDataVariables.push( new MonitoredItem( publishedVariables[v].PublishedVariable ) );
                    
                    // Receive current values first
                    var receivedMessages = CollectNetworkMessageData( {
                        SubscriberConfiguration: callResult.PubSubConfig_CTT,
                        Timeout:                 publishingInterval * 2,
                        MaxNumberOfMessages:     100,
                        SuppressMessages:        true
                    } );
                    
                    // Splice out received messages from other Publishers
                    for( var r=0; r<receivedMessages.length; r++ ) {
                        if( receivedMessages[r].NetworkMessageHeader.PublisherId != callResult.PubSubConfig_CTT.Connections[0].ReaderGroups[0].DataSetReaders[0].PublisherId ) {
                            receivedMessages.splice( r, 1 );
                            r--;
                        }
                    }
                    
                    // Store value for this field of the last received DataSetMessage
                    if( receivedMessages.length > 0 ) {
                        var valuesBefore = receivedMessages[receivedMessages.length-1].Payload.DataSetMessages[0].MessageData.DataSetFields;
                    }
                    else {
                        addError( "Did not receive PubSub messages for OutputVariables of FE '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "' after waiting for two PublishingIntervals" );
                        continue;
                    }
                    
                    for( var oDV=0; oDV<outputDataVariables.length; oDV++ ) {
                        if( ArrayContains( CU_Variables.OutputNodeOfTypeFoundNode, outputDataVariables[oDV].NodeId ) ) {
                            // Change value in the OutputData folder in the CTT Server
                            ReadHelper.Execute( { NodesToRead: outputDataVariables[oDV] } );
                            UaVariant.Increment( { Value: outputDataVariables[oDV].Value.Value } );
                            WriteHelper.Execute( { NodesToWrite: outputDataVariables[oDV] } );
                        }
                    }
                    
                    // Check if updated Data is received
                    var receivedMessages = CollectNetworkMessageData( {
                        SubscriberConfiguration: callResult.PubSubConfig_CTT,
                        Timeout:                 publishingInterval * 2,
                        MaxNumberOfMessages:     100,
                        SuppressMessages:        true
                    } );
                    
                    // Splice out received messages from other Publishers
                    for( var r=0; r<receivedMessages.length; r++ ) {
                        if( receivedMessages[r].NetworkMessageHeader.PublisherId != callResult.PubSubConfig_CTT.Connections[0].ReaderGroups[0].DataSetReaders[0].PublisherId ) {
                            receivedMessages.splice( r, 1 );
                            r--;
                        }
                    }
                    
                    // Store value for this field of the last received DataSetMessage
                    if( receivedMessages.length > 0 ) {
                        var valuesAfter = receivedMessages[receivedMessages.length-1].Payload.DataSetMessages[0].MessageData.DataSetFields;
                    }
                    else {
                        addError( "Did not receive PubSub messages for OutputVariables of FE '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "' after changing the value of the variables and waiting for two PublishingIntervals" );
                        continue;
                    }
                    
                    // Step 2: Review the sent values
                    for( var oDV=0; oDV<outputDataVariables.length; oDV++ ) {
                        if( ArrayContains( CU_Variables.OutputNodeOfTypeFoundNode, outputDataVariables[oDV].NodeId ) ) {
                            var valueBefore = ( isDefined( valuesBefore[oDV] ) ) ? UaVariantToSimpleType( valuesBefore[oDV] ) : valuesBefore[oDV];
                            var valueAfter = ( isDefined( valuesAfter[oDV] ) ) ? UaVariantToSimpleType( valuesAfter[oDV] ) : valuesAfter[oDV];
                            if( valueBefore == valueAfter ) {
                                addError( "Step 2: Sent data of OutputData variable '" + outputDataVariables[oDV].NodeId + "' (Type: " + Identifier.toString( new UaNodeId( outputDataVariables[oDV].Value.Value.DataType ) ) + ") of FunctionalEntity '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "' did not change after waiting for two PublishingIntervals." );
                                TC_Variables.Result = false;
                            }
                        }
                    }
                }
                else {
                    addError( "Step 1: Call to EstablishConnections for FunctionalEntity '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Cleanup created connection endpoint and PubSubConfig
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: CU_Variables.OutputNodeOfType_FE[n].ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    AllowEmptyConnectionEndpoint: true,
                    ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                    OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                    SkipResultValidation: true
                } ).success ) TC_Variables.Result = false;
                UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
            }
            else {
                addError( "Step 1: Failed to establish the connection between the CTT and the FunctionalEntity '" + CU_Variables.OutputNodeOfType_FE[n].NodeId + "'. Aborting test." );
                TC_Variables.Result = false;
            }
            
            if( !TC_Variables.Result ) break;
            
        }
    }
    else {
        addSkipped( "UAFX Input Datatype Support TC 004 must be selected for this test to run. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );