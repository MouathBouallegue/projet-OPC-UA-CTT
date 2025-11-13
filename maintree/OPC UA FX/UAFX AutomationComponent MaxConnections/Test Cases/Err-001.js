/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the AutomationComponent supports not more connections than claimed
                 in the MaxConnections variable
         Step 1: Browse the ComponentCapabilities folder of the instance of the AutomationComponentType
         Step 2: Read the Value Attribute of MaxConnections
         Step 3: Establish #MaxConnections + 1 number of connections in subsequent calls
                 (establish a single connection per call)
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var FE_PubSub = CU_Variables.AllFunctionalEntities[0];
    
    // Step 1: Browse the ComponentCapabilities folder of the instance of the AutomationComponentType
    if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities ) ) {
        // Step 2: Read the Value Attribute of MaxConnections
        if( isDefined( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnections ) ) {
            var maxConnectionsValue = GetValueOfNodeByNodeId( FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnections.NodeId );
            if( isDefined( maxConnectionsValue ) && !maxConnectionsValue.isEmpty() ) {
                
                TC_Variables.MaxConnections = maxConnectionsValue.toUInt32();
                var connectionEndpointIds = [];
                
                // Step 3: Establish #MaxConnections + 1 number of connections in subsequent calls
                //         (establish a single connection per call)
                for( var k=0; k<TC_Variables.MaxConnections + 1; k++ ) {
                    addLog( "EstablishingConnection #" + (k+1) + " between CTT and FunctionalEntity '" + FE_PubSub.NodeId + "'..." );
                    UaOpcServer.restartServer( { SkipTestReconnect: true } );
                    var callResult = EstablishConnectionsToCTT( {
                        Settings: [ {
                            FunctionalEntity: FE_PubSub,
                            Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber,
                            ConnectionEndpointName: "Connection_" + ( k + 1 ),
                            PublishedDataSetName: "CTT_UAFX_Writer_" + ( k + 1 ),
                            PublisherId_Server: UaVariant.New( { Type: BuiltInType.UInt64, Value: ( 32020 + k ) } )
                        } ],
                        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ) ]
                    } );
                
                    if( callResult !== false && callResult.success ) {
                        connectionEndpointIds.push( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId );
                        if( k >= TC_Variables.MaxConnections ) {
                            // Should fail
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadResourceUnavailable ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Step 3: Received unexpected value for ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult on Iteration #" + (k+1) + " (MaxConnections=" + TC_Variables.MaxConnections + ")" ) ) TC_Variables.Result = false;
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadResourceUnavailable ), callResult.CommunicationConfigurationResults[0].Result, "Step 3: Received unexpected value for CommunicationConfigurationResults[0].Result on Iteration #" + (k+1) + " (MaxConnections=" + TC_Variables.MaxConnections + ")" ) ) TC_Variables.Result = false;
                        }
                        else {
                            // Should be successful
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.StatusCode, "Step 3: Received unexpected OperationResult for the EstablishConnections call on Iteration #" + (k+1) + " (MaxConnections=" + TC_Variables.MaxConnections + ")" ) ) TC_Variables.Result = false;
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Step 3: Received unexpected value for ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult on Iteration #" + (k+1) + " (MaxConnections=" + TC_Variables.MaxConnections + ")" ) ) TC_Variables.Result = false;
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.CommunicationConfigurationResults[0].Result, "Step 3: Received unexpected value for CommunicationConfigurationResults[0].Result on Iteration #" + (k+1) + " (MaxConnections=" + TC_Variables.MaxConnections + ")" ) ) TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Step 3: EstablishConnection failed on Iteration #" + (k+1) + ". Aborting test." );
                        TC_Variables.Result = false;
                    }
                    if( !TC_Variables.Result ) break;
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
                addError( "Step 2: Error reading the value of MaxConnections variable '" + FE_PubSub.ParentAutomationComponent.ComponentCapabilities.MaxConnections.NodeId + "'" );
                TC_Variables.Result = false;
            }
        }
        else {
            addError( "Step 1: The AC '" + FE_PubSub.ParentAutomationComponent.NodeId + "' does not expose the MaxConnections variable." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Step 1: The AC '" + FE_PubSub.ParentAutomationComponent.NodeId + "' does not expose the ComponentCapabilities folder." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_001 } );