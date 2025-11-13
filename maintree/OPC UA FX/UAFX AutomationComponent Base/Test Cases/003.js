/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that all instances of AutomationComponentType are compliant with
                 the specification. 
         Step 1: Browse forward references of the AutomationComponent Object.
         Step 2: Read DataType Attribute of all available variables.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    if( isDefined( CU_Variables.AutomationComponentType_Instances ) && CU_Variables.AutomationComponentType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.AutomationComponentType_Instances.length; i++ ) {
            // Step 1: Browse forward references of the AutomationComponent Object.
            // Step 2: Read DataType Attribute of all available variables.
            TC_Variables.result = VerifyElementsOfNode( {
                Node: CU_Variables.AutomationComponentType_Instances[i],
                IsModellingRuleOptional: true,
                Elements: [
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FunctionalEntities" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: new UaNodeId( Identifier.FolderType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Assets" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: new UaNodeId( Identifier.FolderType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PublisherCapabilities" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubscriberCapabilities" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ComponentCapabilities" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.FolderType.AutomationComponentCapabilitiesType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConformanceName" } ),
                        NodeClass: NodeClass.Variable,
                        DataType: new UaNodeId( Identifier.UriString ),
                        TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishConnections" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CloseConnections" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Descriptors" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: new UaNodeId( Identifier.FolderType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AggregatedHealth" } ),
                        NodeClass: NodeClass.Variable,
                        DataType: CU_Variables.Test.Structure.AggregatedHealthDataType,
                        TypeDefinition: CU_Variables.Test.BaseDataVariableType.AggregatedHealthType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.GeneratesEvent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "SystemStatusChangeEventType" } ),
                        NodeClass: NodeClass.ObjectType,
                        IsOptional: true
                    }
                ]
            } );
        }
    }
    else {
        addSkipped( "No instance of type 'AutomationComponentType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_003 } );