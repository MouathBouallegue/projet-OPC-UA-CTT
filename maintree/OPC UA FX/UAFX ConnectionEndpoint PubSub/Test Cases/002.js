/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that PubSubConnectionEndpoint Type exists
                 and is compliant with table 'PubSubConnectionEndpointType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.Enumeration.PubSubConnectionEndpointModeEnum ) )
        addError( "Type 'PubSubConnectionEndpointModeEnum' not found in server" );

    // check if PubSubConnectionEndpointType is exposed and compliant
    if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType,
            Elements: [ 
                { 
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Mode" } ),
                    NodeClass: NodeClass.Variable,
                    DataType: CU_Variables.Test.Enumeration.PubSubConnectionEndpointModeEnum,
                    TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory )
                }
            ]
        } );
    }
    else {
        addError( "PubSubConnectionEndpointType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );