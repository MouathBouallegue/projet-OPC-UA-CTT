/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the behavior of the AutomationComponent if more connections than
                 claimed in the MaxConnectionsPerCall variable are requested to be established.
         Step 1: Browse the ComponentCapabilities folder of any instance of the AutomationComponentType.
         Step 2: Read the Value Attribute of MaxConnectionsPerCall.
         Step 3: Establish #MaxConnectionsPerCall+1 number of connections in a single EstablishConnections
                 method call.
*/

function Test_Err_001() {
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
                
                // Step 3: Establish #MaxConnectionsPerCall+1 number of connections in a single EstablishConnections
                //         method call.
                var establishConnectionSettings = [];
                for( var k=0; k<TC_Variables.MaxConnectionsPerCall + 1; k++ ) {
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
                    Settings: establishConnectionSettings,
                    OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadTooManyOperations ) ]
                } );
            
                // Get ConnectionEndpointIds for cleanup on unexpected success
                if( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) {
                    for( var ceId=0; ceId<callResult.ConnectionEndpointConfigurationResults.length; ceId++ ) {
                        connectionEndpointIds.push( callResult.ConnectionEndpointConfigurationResults[ceId].ConnectionEndpointId );
                    }
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

Test.Execute( { Procedure: Test_Err_001 } );