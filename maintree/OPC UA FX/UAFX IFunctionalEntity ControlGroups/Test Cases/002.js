/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the ControlGroupsFolderType is present
                 and compliant with table 'ControlGroupsFolderType definition'.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.HasComponent.HasControlGroup ) ) {
        CU_Variables.Test.HasComponent.HasControlGroup = new MonitoredItem( new UaNodeId() );
        addError( "ReferenceType 'HasControlGroup' not found in server" );
    }
    if( !isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType ) )
        addError( "Type 'ControlGroupType' not found in server" );
        
    // check if ControlGroupsFolderType is compliant
    if( isDefined( CU_Variables.Test.FolderType.ControlGroupsFolderType ) ) {
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.FolderType.ControlGroupsFolderType,
            Elements: [ 
                { 
                    ReferenceTypeId: CU_Variables.Test.HasComponent.HasControlGroup.NodeId,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<ControlGroup>" } ),
                    NodeClass: NodeClass.Object,
                    TypeDefinition: CU_Variables.Test.BaseObjectType.ControlGroupType,
                    ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder )
                }
            ]
        } );
    }
    else {
        addError( "ControlGroupsFolderType not found in Types folder of the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_002 } );