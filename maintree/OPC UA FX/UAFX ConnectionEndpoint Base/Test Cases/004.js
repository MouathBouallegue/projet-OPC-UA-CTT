/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that dynamically created ConnectionEndpoints are compliant with the
                  specification.
    Requirements: Dynamically created endpoints are supported.
          Step 1: Call EstablishConnections to create a dynamic instance of a subtype from
                  ConnectionEndpointType.
          Step 2: Browse the instance of a subtype from ConnectionEndpointType created in
                  Step 1.
          Step 3: Read the Attribute Value of every node and verify the data type.
          Step 4: Read the DataType Attribute of every node and verify the DataType. 
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
       
        for( var fe=0; fe<CU_Variables.AllFunctionalEntities.length; fe++ ) {
            
            addLog( "=== Start of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
            
            // Step 1: Call EstablishConnections to create a dynamic instance of a subtype from ConnectionEndpointType
            var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                FunctionalEntityNodeId: CU_Variables.AllFunctionalEntities[fe].NodeId,
                Name: "ConnectionEndpoint_Base_TC_004_dynamically_created_endpoint",
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.Uncertain ) ]
            } );
            
            if( callResult !== false && callResult.success ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].FunctionalEntityNodeResult, "Received unexpected StatusCode for FunctionalEntityNodeResult" ) ) TC_Variables.Result = false;
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                if( TC_Variables.Result ) {
                    
                    refreshBaseVariablesModelMapByNodeId( CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent.NodeId, CU_Variables.SessionThread );
                    
                    // Step 2: Browse the instance of a subtype from ConnectionEndpointType created in Step 1
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    
                    // Step 3: Read the Attribute Value of every node and verify the data type.
                    // Step 4: Read the DataType Attribute of every node and verify the DataType. 
                    TC_Variables.result = VerifyElementsOfNode( { 
                        Node: new MonitoredItem( connectionEndpointId ),
                        Elements: [ 
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Status" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: CU_Variables.Test.Enumeration.ConnectionEndpointStatusEnum,
                                ValueDataType: Identifier.Int32
                            },
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "RelatedEndpoint" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: CU_Variables.Test.Structure.RelatedEndpointDataType,
                                ValueDataType: Identifier.Structure
                            },
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "InputVariables" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: new UaNodeId( Identifier.NodeId ),
                                ValueDataType: Identifier.NodeId,
                                ValueRank: 1,
                                IsOptional: true
                            },
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OutputVariables" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: new UaNodeId( Identifier.NodeId ),
                                ValueDataType: Identifier.NodeId,
                                ValueRank: 1,
                                IsOptional: true
                            },
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "IsPersistent" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: new UaNodeId( Identifier.Boolean ),
                                ValueDataType: Identifier.Boolean
                            },
                            { 
                                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CleanupTimeout" } ),
                                NodeClass: NodeClass.Variable,
                                DataType: new UaNodeId( Identifier.Duration ),
                                ValueDataType: Identifier.Double
                            }
                        ]
                    } );
        
                    // Close created temporary endpoint
                    TC_Variables.Result = callCloseConnectionsMethod( {
                        AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                        ConnectionEndpoints: connectionEndpointId
                    } ).success;
                    
                }   
            }
            else TC_Variables.Result = false;
            
            addLog( "=== End of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
        
        }
        
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );