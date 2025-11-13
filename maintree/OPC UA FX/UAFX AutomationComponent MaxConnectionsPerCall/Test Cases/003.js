/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the AutomationComponent supports the establishment of #MaxConnectionsPerCall
                 in a single call of the EstablishConnections method.
         Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
         Step 2: Read the Value Attribute of MaxConnectionsPerCall.
         Step 3: Establish #MaxConnectionsPerCall number of connections in a single EstablishConnections
                 Method call.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
    if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities ) ) {
        // Step 2: Read the Value Attribute of MaxConnectionsPerCall.
        if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnectionsPerCall ) ) {
            var maxConnectionsPerCallValue = GetValueOfNodeByNodeId( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnectionsPerCall.NodeId );
            if( isDefined( maxConnectionsPerCallValue ) && !maxConnectionsPerCallValue.isEmpty() ) {
                
                TC_Variables.MaxConnectionsPerCall = maxConnectionsPerCallValue.toUInt32();
                var connectionEndpointIds = [];
                
                // Step 3: Establish #MaxConnectionsPerCall number of connections in a single EstablishConnections
                //         Method call.
                var establishConnectionSettings = [];
                for( var k=0; k<TC_Variables.MaxConnectionsPerCall; k++ ) {
                    establishConnectionSettings.push( {
                        FunctionalEntity: FE_PubSub,
                        Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber,
                        ConnectionEndpointName: "Connection_" + ( k + 1 ),
                        PublishedDataSetName: "CTT_UAFX_Writer_" + ( k + 1 ),
                        PublisherId_Server: UaVariant.New( { Type: BuiltInType.UInt64, Value: ( 32020 + k ) } )
                    } );
                }
                addLog( "Establishing " + TC_Variables.MaxConnectionsPerCall + " Connections at once between CTT and FunctionalEntity '" + FE_PubSub.NodeId + "'..." );
                UaOpcServer.restartServer( { SkipTestReconnect: true, ClearPubSubConfig: true } );
                var callResult = EstablishConnectionsToCTT( {
                    Settings: establishConnectionSettings
                } );
            
                if( callResult !== false && callResult.success ) {
                    for( var ceId=0; ceId<callResult.ConnectionEndpointConfigurationResults.length; ceId++ ) {
                        connectionEndpointIds.push( callResult.ConnectionEndpointConfigurationResults[ceId].ConnectionEndpointId );
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[ceId].ConnectionEndpointResult, "Step 3: Received unexpected value for ConnectionEndpointConfigurationResults[" + ceId + "].ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                    }
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.StatusCode, "Step 3: Received unexpected OperationResult for the EstablishConnections call" ) ) TC_Variables.Result = false;
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.CommunicationConfigurationResults[0].Result, "Step 3: Received unexpected value for CommunicationConfigurationResults[0].Result" ) ) TC_Variables.Result = false;
                    
                    if( TC_Variables.Result ) {
                        // If successful check if data is received
                        var receivedMessages = CollectNetworkMessageData( {
                            SubscriberConfiguration: callResult.PubSubConfig_CTT,
                            Timeout:                 5000,
                            MaxNumberOfMessages:     1,
                            SuppressMessages:        true
                        } );
            
                        if( receivedMessages.length == 0 ) {
                            addError( "Step 3: EstablishConnections results are Good, but no NetworkMessages received within 5000 ms. Connection is not up and running." );
                            TC_Variables.Result = false;
                        }
                        else addLog( "Received message: " + receivedMessages[0].getRawNetworkMessageData() );
                    }
                }
                else {
                    addError( "Step 3: EstablishConnections failed. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Cleanup created connection endpoints and PubSubConfig
                for( var k=0; k<connectionEndpointIds.length; k++ ) {
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
            }
            else {
                addError( "Step 2: Error reading the value of MaxConnectionsPerCall variable '" + FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnectionsPerCall.NodeId + "'" );
                TC_Variables.Result = false;
            }
        }
        else {
            addError( "Step 1: The AC '" + FE_PubSub.ParentAutomationComponent.NodeId + "' does not expose the MaxConnectionsPerCall variable." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Step 1: The AC '" + FE_PubSub.ParentAutomationComponent.NodeId + "' does not expose the ComponentCapabilities folder." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );