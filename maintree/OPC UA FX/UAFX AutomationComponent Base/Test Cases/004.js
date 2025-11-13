/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the AutomationComponentCapabilitiesType exists in the Types
                 Folder.
         Step 1: Browse the ObjectTypes Folder. 
         Step 2: Browse the AutomationComponentCapabilitiesType.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the ObjectTypes Folder
    if( isDefined( CU_Variables.Test.FolderType.AutomationComponentCapabilitiesType.NodeId ) ) {
        // Step 2: Browse the AutomationComponentCapabilitiesType
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.FolderType.AutomationComponentCapabilitiesType,
            Elements: [ 
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<Capability>" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.BaseDataType ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SupportsPersistence" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.Boolean ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxFunctionalEntities" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.UInt32 ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxConnections" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.UInt32 ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxConnectionsPerCall" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.UInt32 ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasCapability.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CommandBundleRequired" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.Boolean ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                }
            ]
        } );
    }
    else {
        addError( "'AutomationComponentCapabilitiesType' not found in ObjectTypes folder" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );