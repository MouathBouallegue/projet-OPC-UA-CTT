/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse FunctionalEntityType in the ObjectTypes folder and verify that it
                  is compliant.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.Structure.FxVersion ) )
        addError( "Type 'FxVersion' not found in server" );
    if( !isDefined( CU_Variables.Test.Structure.ApplicationIdentifierDataType ) )
        addError( "Type 'ApplicationIdentifierDataType' not found in server" );
    if( !isDefined( CU_Variables.Test.FolderType.InputsFolderType ) )
        addError( "Type 'InputsFolderType' not found in server" );
    if( !isDefined( CU_Variables.Test.FolderType.OutputsFolderType ) )
        addError( "Type 'OutputsFolderType' not found in server" );
    if( !isDefined( CU_Variables.Test.FolderType.FunctionalGroupType ) ) {
        addError( "Type 'FunctionalGroupType' not found in server" );
    }
    else {
        if( !isDefined( CU_Variables.Test.FolderType.FunctionalGroupType.ConfigurationDataFolderType ) )
            addError( "Type 'ConfigurationDataFolderType' not found in server" );
    }
    if( !isDefined( CU_Variables.Test.FolderType.FunctionalEntityCapabilitiesType ) )
        addError( "Type 'FunctionalEntityCapabilitiesType' not found in server" );
    if( !isDefined( CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType ) )
        addError( "Type 'PublisherCapabilitiesType' not found in server" );
    if( !isDefined( CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType ) )
        addError( "Type 'SubscriberCapabilitiesType' not found in server" );
    if( !isDefined( CU_Variables.Test.FolderType.ConnectionEndpointsFolderType ) )
        addError( "Type 'ConnectionEndpointsFolderType' not found in server" );
    if( !isDefined( CU_Variables.Test.FolderType.ControlGroupsFolderType ) )
        addError( "Type 'ControlGroupsFolderType' not found in server" );
    if( !isDefined( CU_Variables.Test.UInt32.OperationalHealthOptionSet ) )
        addError( "Type 'OperationalHealthOptionSet' not found in server" );
    if( !isDefined( CU_Variables.Test.HasComponent.HasSubFunctionalEntity ) ) {
        CU_Variables.Test.HasComponent.HasSubFunctionalEntity = new MonitoredItem( new UaNodeId() );
        addError( "Type 'HasSubFunctionalEntity' not found in server" );
    }


    // check if FunctionalEntityType is exposed and compliant
    if( isDefined( CU_Variables.Test.BaseObjectType.FunctionalEntityType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.BaseObjectType.FunctionalEntityType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "IFunctionalEntityType" } ),
                    NodeClass: NodeClass.ObjectType
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorUri" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( 23751 ), // UriString
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorAssignedIdentifier" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.String ),
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorAssignedVersion" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.Structure.FxVersion,
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ApplicationIdentifier" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.Structure.ApplicationIdentifierDataType,
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Verify" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "InputData" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.InputsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OutputData" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.OutputsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConfigurationData" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.FunctionalGroupType.ConfigurationDataFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Capabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.FunctionalEntityCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
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
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConnectionEndpoints" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.ConnectionEndpointsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlGroups" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.ControlGroupsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OperationalHealth" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.UInt32.OperationalHealthOptionSet,
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OperationalHealthAlarms" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: new UaNodeId( Identifier.FolderType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasSubFunctionalEntity.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<SubFunctionalEntity>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.FunctionalEntityType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                }
            ]
        } );
    }
    else {
        addError( "FunctionalEntityType not found in ObjectTypes folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );