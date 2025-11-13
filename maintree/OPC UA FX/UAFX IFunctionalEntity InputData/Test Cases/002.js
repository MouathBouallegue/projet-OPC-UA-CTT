/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the InputsFolderType is present and
                 compliant with table 'InputsFolderType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.HasComponent.HasInputGroup ) )
        addError( "Type 'HasInputGroup' not found in server" );
    if( !isDefined( CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType ) )
        addError( "Type 'SubscriberCapabilitiesType' not found in server" );

    // check if InputsFolderType is compliant
    if( isDefined( CU_Variables.Test.FolderType.InputsFolderType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.FolderType.InputsFolderType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubscriberCapabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasInputGroup.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<InputGroup>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.InputsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.Organizes ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<InputVariable>" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.BaseDataType ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                }
            ]
        } );
    }
    else {
        addError( "InputsFolderType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );