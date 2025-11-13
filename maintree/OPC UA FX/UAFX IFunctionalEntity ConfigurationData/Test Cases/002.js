/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the ConfigurationDataFolderType is
                 present and compliant with table 'ConfigurationDataFolderType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;

    // check if ConfigurationDataFolderType is compliant
    if( isDefined( CU_Variables.Test.FolderType.FunctionalGroupType ) ) {
        if( isDefined( CU_Variables.Test.FolderType.FunctionalGroupType.ConfigurationDataFolderType ) ) {
            TC_Variables.result = VerifyElementsOfNode( { 
                Node: CU_Variables.Test.FolderType.FunctionalGroupType.ConfigurationDataFolderType,
                Elements: [ 
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.Organizes ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<ConfigurationVariable>" } ),
                        NodeClass: NodeClass.Variable,
                        DataType: new UaNodeId( Identifier.BaseDataType ),
                        TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SetStoredVariables" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ClearStoredVariables" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListStoredVariables" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                    }
                ]
            } );
        }
        else {
            addError( "ConfigurationDataFolderType not found in Types folder of the server" );
            TC_Variables.result = false;
        }
    }
    else {
        addError( "FunctionalGroupType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );