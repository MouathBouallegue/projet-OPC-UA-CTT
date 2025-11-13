/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the ConnectionEndpointFolderType
                 is present and compliant with table 'ConnectionEndpointsFolderType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.HasComponent.HasConnectionEndpoint ) ) {
        CU_Variables.Test.HasComponent.HasConnectionEndpoint = new MonitoredItem( new UaNodeId() );
        addError( "ReferenceType 'HasConnectionEndpoint' not found in server" );
    }
    if( !isDefined( CU_Variables.Test.UInt16.CommHealthOptionSet ) )
        addError( "Type 'CommHealthOptionSet' not found in server" );

    // check if ConnectionEndpointsFolderType is compliant
    if( isDefined( CU_Variables.Test.FolderType.ConnectionEndpointsFolderType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.FolderType.ConnectionEndpointsFolderType,
            Elements: [ 
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<ConnectionEndpoint>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.ConnectionEndpointType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                },
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CommHealth" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.UInt16.CommHealthOptionSet,
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional )
                }
            ]
        } );
    }
    else {
        addError( "ConnectionEndpointsFolderType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );