/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ControlGroupType in the Types folder and verify that it is compliant
                 with table 'ControlGroupType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.FolderType.FunctionalGroupType ) ) {
        addError( "Type 'FunctionalGroupType' not found in server" );
    }
    else {
        if( !isDefined( CU_Variables.Test.FolderType.FunctionalGroupType.ControlItemFolderType ) )
            addError( "Type 'ControlItemFolderType' not found in server" );
    }

    // check if ControlGroupType is compliant
    if( isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.BaseObjectType.ControlGroupType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListToBlock" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.FunctionalGroupType.ControlItemFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListToRestrict" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.FunctionalGroupType.ControlItemFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListOfRelated" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "IsControlled" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.Boolean ),
                    TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishControl" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReleaseControl" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReassignControl" } ),
                    NodeClass: NodeClass.Method,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<ControlGroup>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.ControlGroupType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                }
            ]
        } );
    }
    else {
        addError( "ControlGroupType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );