/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse all instances of the ControlGroupType and verify that EstablishControl,
                 ReassignControl and ReleaseControl Nodes exist.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    if( isDefined( CU_Variables.ControlGroupType_Instances ) && CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            TC_Variables.result = VerifyElementsOfNode( { 
                Node: CU_Variables.ControlGroupType_Instances[i],
                Elements: [
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishControl" } ),
                        NodeClass: NodeClass.Method
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReleaseControl" } ),
                        NodeClass: NodeClass.Method
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReassignControl" } ),
                        NodeClass: NodeClass.Method
                    }
                ]
            } );
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_001 } );