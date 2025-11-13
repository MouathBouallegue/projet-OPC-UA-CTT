/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that every preconfigured ConnectionEndpoint is compliant with the
                  specification.
    Requirements: Preconfigured ConnectionEndpoint exists.
          Step 1: Browse any instance of a subtype from ConnectionEndpointType.
          Step 2: Read the Attribute Value of every node and verify the data type.
          Step 3: Read the DataType Attribute of every node and verify the DataType. 
          Step 4: Repeat previous steps for every preconfigured ConnectionEndpoint of the
                  AutomationComponent.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.Enumeration.ConnectionEndpointStatusEnum ) )
        addError( "Type 'ConnectionEndpointStatusEnum' not found in server" );
    if( !isDefined( CU_Variables.Test.Structure.RelatedEndpointDataType ) )
        addError( "Type 'RelatedEndpointDataType' not found in server" );
        
    // Step 1: Browse any instance of a subtype from ConnectionEndpointType.
    if( CU_Variables.ConnectionEndpointType_Instances.length > 0 ) {
        // Step 4: Repeat previous steps for every preconfigured ConnectionEndpoint of the
        //         AutomationComponent.
        for( var i=0; i<CU_Variables.ConnectionEndpointType_Instances.length; i++ ) {
            // Step 2: Read the Attribute Value of every node and verify the data type.
            // Step 3: Read the DataType Attribute of every node and verify the DataType. 
            TC_Variables.result = VerifyElementsOfNode( { 
                Node: CU_Variables.ConnectionEndpointType_Instances[i],
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
        }
    }
    else {
        addSkipped( "No instance of type ConnectionEndpointType or a subtype found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );