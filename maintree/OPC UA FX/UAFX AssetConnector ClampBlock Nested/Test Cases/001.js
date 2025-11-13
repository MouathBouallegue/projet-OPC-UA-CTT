/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the Assets folder for Assets that include a reference to a Connector of ClampBlockType
    Step 1: Verify that an InstanceDeclaration for ClampType is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Run test for all AutomationComponents found in AddressSpace
    if( CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            TC_Variables.nestedClampTypeFound = false;
            
            // Browse the Assets folder for Assets that include a reference to a Connector of ClampBlockType
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                
                if( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length > 0 ) {
                    // iterate through assets
                    for( var i=0; i < CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length; i++ ) {
                        
                        if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].Connectors ) ) {
                            
                            // iterate through every reference of the Connectors folder
                            var connectorsFolderReferenceDescriptions = CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].Connectors.References.ReferenceDescriptions;
                            for( var i=0; i < connectorsFolderReferenceDescriptions.length; i++ ) {
                                // check if referenced node is of type ClampBlockType
                                var itemRefDescriptions = CU_Variables.modelMap.Get( connectorsFolderReferenceDescriptions[i].NodeId.NodeId.toString() ).ReferenceDescriptions;
                                var searchDefinition = [
                                    {
                                        ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ),
                                        IsForward: true,
                                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ClampBlockType" } )
                                    }
                                ];
                                FindReferencesVerifyingNamespaceIndex( itemRefDescriptions, searchDefinition, CU_Variables.modelMapHelper );
                                // if node is of ClampBlockType
                                if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                                    // search for nested Node of ClampType
                                    // iterate through every reference of the found ClampBlockType Node
                                    var clampBlockTypeNodeReferenceDescriptions = CU_Variables.modelMap.Get( itemRefDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId.toString() ).ReferenceDescriptions;
                                    for( var i=0; i < clampBlockTypeNodeReferenceDescriptions.length; i++ ) {
                                        // check if referenced node is of type ClampType
                                        var clampTypeItemRefDescriptions = CU_Variables.modelMap.Get( clampBlockTypeNodeReferenceDescriptions[i].NodeId.NodeId.toString() ).ReferenceDescriptions;
                                        var searchDefinition_ClampBlockTypeItem = [
                                            {
                                                ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ),
                                                IsForward: true,
                                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ClampType" } )
                                            }
                                        ];
                                        FindReferencesVerifyingNamespaceIndex( clampTypeItemRefDescriptions, searchDefinition_ClampBlockTypeItem, CU_Variables.modelMapHelper );
                                        // if node is of ClampType
                                        if( isDefined( searchDefinition_ClampBlockTypeItem[0].ReferenceIndex ) ) {
                                            TC_Variables.nestedClampTypeFound = true;
                                            break;
                                        }
                                    }
                                    
                                }
                                // do not check further references of the found ClampBlockType if a nested ClampType was found
                                if( TC_Variables.nestedClampTypeFound ) break;
                            }
                            
                        }
                        // do not check further Assets if a nested ClampType in a Connector of ClampBlockType was found
                        if( TC_Variables.nestedClampTypeFound ) break;
                        
                    }
                    
                    if( !TC_Variables.nestedClampTypeFound ) { addError( "No nested node of ClampType in a Connector of ClampBlockType found." ); TC_Variables.result = false; }
                    
                }
                else {
                    addError( "No Assets found in the Assets folder of the configured AutomationComponentInstance. Aborting test." );
                    TC_Variables.result = false;
                }
                
            }
            else {
                addError( "'Assets' folder is not available in the configured AutomationComponentInstance. Aborting test." );
                TC_Variables.result = false;
            }
            
            addLog( "=== End of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No AutomationComponent found in AddressSpace. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );