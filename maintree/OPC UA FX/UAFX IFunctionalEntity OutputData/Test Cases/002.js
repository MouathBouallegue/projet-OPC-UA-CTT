/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the OutputsFolderType is present and
                 compliant with table 'OutputsFolderType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.HasComponent.HasOutputGroup ) )
        addError( "Type 'HasOutputGroup' not found in server" );
    if( !isDefined( CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType ) )
        addError( "Type 'PublisherCapabilitiesType' not found in server" );

    // check if OutputsFolderType is compliant
    if( isDefined( CU_Variables.Test.FolderType.OutputsFolderType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.FolderType.OutputsFolderType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PublisherCapabilities" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                },
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasOutputGroup.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<OutputGroup>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.FolderType.OutputsFolderType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.Organizes ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<OutputVariable>" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: new UaNodeId( Identifier.BaseDataType ),
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                }
            ]
        } );
    }
    else {
        addError( "OutputsFolderType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );