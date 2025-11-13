/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the AutomationComponentType exists in the Types Folder.
         Step 1: Browse the ObjectTypes Folder. 
         Step 2: Browse the AutomationComponentType.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the ObjectTypes Folder
    if( isDefined( CU_Variables.Test.BaseObjectType.AutomationComponentType.NodeId ) ) {
        // Step 2: Browse the AutomationComponentType
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.BaseObjectType.AutomationComponentType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FunctionalEntities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: new UaNodeId( Identifier.FolderType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Assets" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: new UaNodeId( Identifier.FolderType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PublisherCapabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubscriberCapabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ComponentCapabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.AutomationComponentCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConformanceName" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.UriString ),
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishConnections" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CloseConnections" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Descriptors" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: new UaNodeId( Identifier.FolderType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AggregatedHealth" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.Structure.AggregatedHealthDataType,
                    TypeDefinition: CU_Variables.Test.BaseDataVariableType.AggregatedHealthType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.GeneratesEvent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "SystemStatusChangeEventType" } ),
                    NodeClass: NodeClass.ObjectType
                }
            ]
        } );
    }
    else {
        addError( "'AutomationComponentType' not found in ObjectTypes folder" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );