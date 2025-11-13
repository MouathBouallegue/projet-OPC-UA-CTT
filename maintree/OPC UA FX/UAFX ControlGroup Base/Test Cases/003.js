/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that all instances of the ControlGroupType are compliant with the
                  specification.
    Requirements: An instance of the ControlGroupType is present.
          Step 1: Browse any instance of the ControlGroupType and verify that all supported
                  objects, variables and methods are exposed.
          Step 2: Read the Attribute DataType of all variables and verify that it matches
                  with table 'ControlGroupType definition'.
          Step 3: Repeat previous steps for all instances of the ControlGroupType.
*/

function Test_003() {
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

    // Step 1: Browse any instance of the ControlGroupType and verify that all supported
    //         objects, variables and methods are exposed.
    // Step 2: Read the Attribute DataType of all variables and verify that it matches
    //         with table 'ControlGroupType definition'.
    // Step 3: Repeat previous steps for all instances of the ControlGroupType.
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            TC_Variables.result = VerifyElementsOfNode( { 
                Node: CU_Variables.ControlGroupType_Instances[i],
                IsModellingRuleOptional: true,
                Elements: [ 
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListToBlock" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.FolderType.FunctionalGroupType.ControlItemFolderType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListToRestrict" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.FolderType.FunctionalGroupType.ControlItemFolderType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ListOfRelated" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.FolderType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "IsControlled" } ),
                        NodeClass: NodeClass.Variable,
                        DataType: new UaNodeId( Identifier.Boolean ),
                        TypeDefinition: new UaNodeId( Identifier.PropertyType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishControl" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReleaseControl" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ReassignControl" } ),
                        NodeClass: NodeClass.Method,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Optional ),
                        IsOptional: true
                    },
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<ControlGroup>" } ),
                        NodeClass: NodeClass.Object,
                        TypeDefinition: CU_Variables.Test.BaseObjectType.ControlGroupType,
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_OptionalPlaceholder ),
                        IsOptional: true
                    }
                ]
            } );
            if( !TC_Variables.result ) break;
        }
    }
    else {
        addSkipped( "No instances of ControlGroupType found in the server" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_003 } );