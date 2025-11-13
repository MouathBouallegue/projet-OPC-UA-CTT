/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that EstablishConnections implementation creates multiple ConnectionEndpoints
                  in a single call. 
    Requirements: - Dynamically created ConnectionEndpoints are supported
                  - MaxConnectionsPerCall > 1
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
                  - Multiple FuntionalEntities are present
          Step 1: Browse the Object ComponentCapabilities of the AutomationComponent.
          Step 2: Read the Attribute value of variable MaxConnectionPerCall. 
          Step 3: Use the connection information of two dynamically created ConnectionEndpoints
                  to construct the ConnectionEndpointConfigurations argument. 
          Step 4: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 5: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var dynEP_PubSub = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: CU_Variables.AllFunctionalEntities } );
    
    if( dynEP_PubSub.length > 1 ) {
        dynEP_PubSub1 = dynEP_PubSub[0];
        dynEP_PubSub2 = dynEP_PubSub[1];
    }
    else {
        addSkipped( "Could not find at least two FunctionalEntities with InputData/OutputData variables. Skipping test." );
        return( false );
    }
    
    if( !dynEP_PubSub1.AutomationComponent.NodeId.equals( dynEP_PubSub2.AutomationComponent.NodeId ) ) {
        addError( "The configured FunctionalEntities of the dynamic ConnectionEndpoints PublisherSubscriber1 and PublisherSubscriber2 are part of different AutomationComponents (PublisherSubscriber1: '" + dynEP_PubSub1.AutomationComponent.NodeId + "', PublisherSubscriber2: '" + dynEP_PubSub2.AutomationComponent.NodeId + "'). Check settings /OPC UA FX/Dynamic Connection Endpoints/*. Aborting test." );
        return( false );
    }
    
    if( isCommandBundleRequiredSet( dynEP_PubSub1.AutomationComponent ) ) {
        notImplemented( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + dynEP_PubSub1.AutomationComponent.NodeId + "'. Please execute this test manually." );
        return( false );
    }
    
    // Step 1: Browse the Object ComponentCapabilities of the AutomationComponent.
    if( isDefined( dynEP_PubSub1.AutomationComponent.ComponentCapabilities ) ) {
        if( isDefined( dynEP_PubSub1.AutomationComponent.ComponentCapabilities.MaxConnectionsPerCall ) ) {
            // Step 2: Read the Attribute value of variable MaxConnectionPerCall. 
            if( ReadHelper.Execute( { NodesToRead: dynEP_PubSub1.AutomationComponent.ComponentCapabilities.MaxConnectionsPerCall } ) ) {
                if( dynEP_PubSub1.AutomationComponent.ComponentCapabilities.MaxConnectionsPerCall.Value.Value.toUInt32() > 1 ) {
                    
                    // Step 3: Use the connection information of two dynamically created ConnectionEndpoints
                    //         to construct the ConnectionEndpointConfigurations argument.
                    var ConnectionEndpointConfigurations = new UaExtensionObjects(2);
                    ConnectionEndpointConfigurations[0] = createConnectionEndpointConfiguration( {
                        FunctionalEntityNodeId: dynEP_PubSub1.NodeId,
                        Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_002_Entity1",
                        InputVariableIds: dynEP_PubSub1.InputVariableIds,
                        OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
                        IsPersistent: dynEP_PubSub1.IsPersistent,
                        CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
                        Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber,
                        RelatedEndpointData: dynEP_PubSub1.RelatedEndpoint
                    } );
                    ConnectionEndpointConfigurations[1] = createConnectionEndpointConfiguration( {
                        FunctionalEntityNodeId: dynEP_PubSub2.NodeId,
                        Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_002_Entity2",
                        InputVariableIds: dynEP_PubSub2.InputVariableIds,
                        OutputVariableIds: dynEP_PubSub2.OutputVariableIds,
                        IsPersistent: dynEP_PubSub2.IsPersistent,
                        CleanupTimeout: dynEP_PubSub2.CleanupTimeout,
                        Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber,
                        RelatedEndpointData: dynEP_PubSub2.RelatedEndpoint
                    } );
                    
                    // Step 4: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                    //         All other command bits are not set.
                    var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                        AutomationComponent: dynEP_PubSub1.AutomationComponent,
                        ConnectionEndpointConfigurations: ConnectionEndpointConfigurations,
                        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
                    } );
                    
                    // Get the ConnectionEndpointIds
                    var connectionEndpointId1 = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
                    var connectionEndpointId2 = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[1].ConnectionEndpointId : null;
                    
                    if( callResult !== false && callResult.success ) {
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                        if( TC_Variables.Result ) {
                            
                            refreshBaseVariablesModelMapByNodeId( dynEP_PubSub1.AutomationComponent.NodeId, CU_Variables.SessionThread );
                            
                            // Check first created ConnectionEndpoint
                            var createdConnectionEndpoint1 = CheckHasReferenceToNodeId( { 
                                SourceNode: connectionEndpointId1,
                                TargetNode: dynEP_PubSub1.ConnectionEndpoints.NodeId,
                                ReferenceTypeId: CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId,
                                IsForward: false
                            } );
                            if( createdConnectionEndpoint1 ) {
                                
                                var assertConnectionEndpointValuesArgs = {
                                    ConnectionEndpoint: connectionEndpointId1,
                                    InputVariableIds: dynEP_PubSub1.InputVariableIds,
                                    OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
                                    IsPersistent: dynEP_PubSub1.IsPersistent,
                                    CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
                                    RelatedEndpoint: dynEP_PubSub1.RelatedEndpoint
                                }
                                if( !AssertConnectionEndpointValues( assertConnectionEndpointValuesArgs ) ) TC_Variables.Result = false;
                                
                            }
                            else {
                                addError( "Step 4: The first created ConnectionEndpoint is not present in FunctionalEntity '" + dynEP_PubSub1.NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                            
                            // Check second created ConnectionEndpoint
                            var createdConnectionEndpoint2 = CheckHasReferenceToNodeId( { 
                                SourceNode: dynEP_PubSub2.ConnectionEndpoints.NodeId,
                                TargetNode: connectionEndpointId2,
                                ReferenceTypeId: CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId
                            } );
                            if( createdConnectionEndpoint2 ) {
                                
                                var assertConnectionEndpointValuesArgs = {
                                    ConnectionEndpoint: connectionEndpointId2,
                                    InputVariableIds: dynEP_PubSub2.InputVariableIds,
                                    OutputVariableIds: dynEP_PubSub2.OutputVariableIds,
                                    IsPersistent: dynEP_PubSub2.IsPersistent,
                                    CleanupTimeout: dynEP_PubSub2.CleanupTimeout,
                                    RelatedEndpoint: dynEP_PubSub2.RelatedEndpoint
                                }
                                if( !AssertConnectionEndpointValues( assertConnectionEndpointValuesArgs ) ) TC_Variables.Result = false;
                                
                            }
                            else {
                                addError( "Step 4: The second created ConnectionEndpoint is not present in FunctionalEntity '" + dynEP_PubSub2.NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                            
                        }   
                    }
                    else TC_Variables.Result = false;
    
                }
                else {
                    addSkipped( "Step 2: ComponentCapabilities.MaxConnectionsPerCall is 1. Skipping test." );
                    TC_Variables.Result = false;
                }
            }
            else TC_Variables.Result = false;
            
            // Step 5: Call CloseConnections Method to remove all created ConnectionEndpoints.
            if( !callCloseConnectionsMethod( {
                AutomationComponent: dynEP_PubSub1.AutomationComponent,
                ConnectionEndpoints: connectionEndpointId1,
                AllowEmptyConnectionEndpoint: true,
                ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                SkipResultValidation: true
            } ).success ) TC_Variables.Result = false;
            
            if( !callCloseConnectionsMethod( {
                AutomationComponent: dynEP_PubSub2.AutomationComponent,
                ConnectionEndpoints: connectionEndpointId2,
                AllowEmptyConnectionEndpoint: true,
                ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                SkipResultValidation: true
            } ).success ) TC_Variables.Result = false;
                            
        }
        else {
            addError( "Step 1: ComponentCapabilities.MaxConnectionsPerCall does not exist in AC '" + dynEP_PubSub1.AutomationComponent.NodeId + "'." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Step 1: ComponentCapabilities object does not exist in AC '" + dynEP_PubSub1.AutomationComponent.NodeId + "'." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );