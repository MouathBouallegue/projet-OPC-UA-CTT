/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the FunctionalEntities Folder contains at least one node. Ensure
                 that the node is an instance of the FunctionalEntityType, a subtype of
                 it, or an Object that implements the IFunctionalEntity Interface.
         Step 1: Browse the FunctionalEntities folder.
         Step 2: Browse every node in the FunctionalEntities folder.
         Step 3: Browse the Type hierarchy Referenced by the FunctionalEntity Instance.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Run test for all AutomationComponents found in AddressSpace
    if( CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].FunctionalEntities ) ) {
                // Step 1: Browse the FunctionalEntities folder.
                var nodes = GetChildNodes( CU_Variables.Test.AutomationComponents[ac].FunctionalEntities );
                if( nodes.length > 0 ) {
                    // Step 2: Browse every node in the FunctionalEntities folder.
                    for( var i=0; i<nodes.length; i++ ) {
                        var references = BaseVariables.ModelMap.Get( nodes[i].NodeId );
                        // check if node has a HasInterface Reference to the IFunctionalEntityType
                        var searchDefinition = [
                            {
                                ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
                                IsForward: true,
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "IFunctionalEntityType" } )
                            }
                        ];
                        FindReferencesVerifyingNamespaceIndex( references.ReferenceDescriptions, searchDefinition, BaseVariables.ModelMapHelper );
                        if( !isDefined( searchDefinition[0].ReferenceIndex ) ) {
                            // alternatively check if node has a HasTypeDefinition Reference to the FunctionalEntityType or a subtype of it
                            if( !isNodeOfTypeOrSubType( nodes[i], CU_Variables.Test.BaseObjectType.FunctionalEntityType ) ) {
                                // Step 3: Browse the Type hierarchy Referenced by the FunctionalEntity Instance.
                                var typeDefinition = GetTypeDefinitionOfNode( nodes[i] );
                                if( !typeDefinition.equals( new UaNodeId() ) ) { 
                                    var loopcounter = 0;
                                    var hasInterface = false;
                                    var currentNode = new MonitoredItem( typeDefinition );
                                    do{
                                        var hasInterface = CheckHasReferenceTo( { 
                                            Node: currentNode,
                                            Name: "IFunctionalEntityType",
                                            ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
                                            SuppressMessages: true 
                                        } );
                                        if( hasInterface != false ) break;
                                        currentNode = GetReferenceTypeFirstParent( { TypeNodeId: currentNode.NodeId } );
                                        loopcounter++;
                                    } while( currentNode != null && loopcounter < 100 );
                                    if( hasInterface === false ) {
                                        addError( "Node '" + nodes[i].NodeId + "' has neither a HasInterface reference to IFunctionalEntityType nor a HasTypeDefinition referencing a type hierarchy containing a type having a HasInterface reference to IFunctionalEntityType." );
                                        TC_Variables.result = false;
                                    }
                                    else addLog( "Node '" + nodes[i].NodeId + "' references a type having a HasInterface IFunctionalEntityType in at least one of the types in its hierarchy." )
                                }
                                else {
                                    addError( "Node '" + nodes[i].NodeId + "' has neither a HasInterface reference to IFunctionalEntityType nor a HasTypeDefinition reference." );
                                    TC_Variables.result = false;
                                }
                            }
                            else addLog( "Node '" + nodes[i].NodeId + "' has a HasTypeDefinition reference to FunctionalEntityType or subtype" );
                        }
                        else addLog( "Node '" + nodes[i].NodeId + "' has a HasInterface reference to IFunctionalEntityType" );
                    }
                }
                else {
                    addError( "No nodes found in FunctionalEntities folder of the configured AutomationComponentInstance." );
                    TC_Variables.result = false;
                }
            }
            else {
                addError( "'FunctionalEntities' folder is not available in the configured AutomationComponentInstance. Aborting test." );
                TC_Variables.result = false;
            }
            
            addLog( "=== End of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No AutomationComponent found in AddressSpace. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );