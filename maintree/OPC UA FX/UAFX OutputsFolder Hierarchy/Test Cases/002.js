/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse every Instance of OutputsFolderType exposed in the OutputData folder
                  and verify the references.
    Requirements: A nested OutputsFolder exists.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasOutputGroup ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].OutputData ) ) {
                // get all nested OutputFolders
                var nestedOutputFolders = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].OutputData, CU_Variables.Test.HasComponent.HasOutputGroup.NodeId );
                if( nestedOutputFolders.length > 0 ) {
                    for( var n=0; n<nestedOutputFolders.length; n++ ) {
                        TC_Variables.nothingTested = false;
                        // get all nested Organizes target nodes
                        var nestedOrganizesTargetNodes = GetChildNodesByReferenceTypeId( nestedOutputFolders[n], new UaNodeId( Identifier.Organizes ) );
                        if( nestedOrganizesTargetNodes.length > 0 ) {
                            // check NodeClass is Variable
                            for( var a=0; a<nestedOrganizesTargetNodes.length; a++ ) nestedOrganizesTargetNodes[a].AttributeId = Attribute.NodeClass;
                            if( ReadHelper.Execute( { NodesToRead: nestedOrganizesTargetNodes } ) ) {
                                for( var a=0; a<nestedOrganizesTargetNodes.length; a++ ) {
                                    if( !Assert.Equal( NodeClass.Variable, nestedOrganizesTargetNodes[a].Value.Value.toInt32(), "Received unexpected NodeClass attribute for node '" + nestedOrganizesTargetNodes[a].NodeId + "'" ) ) TC_Variables.Result = false;
                                }
                            }
                        }
                        else addLog( "Nested OutputData folder '" + nestedOutputFolders[n].NodeId + "' has no Organizes references. Skipping node." );
                    }
                }
                else addLog( "OutputData folder '" + CU_Variables.AllFunctionalEntities[i].OutputData.NodeId + "' has no nested OutputData folders. Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no OutputData folder. Skipping node." );
        }
    }
    else {
        addError( "Type 'HasOutputGroup' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.nothingTested ) {
        addSkipped( "No FunctionalEntity with an OutputData folder with nested OutputData folders found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );