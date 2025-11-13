/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the forward references of the FunctionalEntity.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasSubFunctionalEntity ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            var references = BaseVariables.ModelMap.Get( CU_Variables.AllFunctionalEntities[i].NodeId );
            var searchDefinition = [ { ReferenceTypeId: CU_Variables.Test.HasComponent.HasSubFunctionalEntity.NodeId } ];
            BaseVariables.ModelMapHelper.FindReferences( references.ReferenceDescriptions, searchDefinition );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                TC_Variables.nothingTested = false;
                var targetNode = new MonitoredItem( references.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                targetNode.References = BaseVariables.ModelMap.Get( targetNode.NodeId.toString() );
                addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has a HasSubFunctionalEntity reference to '" + targetNode.NodeId + "'" );
                
                // check type of target node
                var searchDefinition = [ { ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ) } ];
                BaseVariables.ModelMapHelper.FindReferences( targetNode.References.ReferenceDescriptions, searchDefinition );
                if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    var typeDefinition = new MonitoredItem( targetNode.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                    if( !typeDefinition.NodeId.equals( CU_Variables.Test.BaseObjectType.FunctionalEntityType.NodeId ) ) {
                        addError( "TargetNode '" + targetNode.NodeId + "' referenced by HasSubFunctionalEntity is no instance of FunctionalEntityType" );
                        TC_Variables.result = false;
                    }
                    else addLog( "TargetNode '" + targetNode.NodeId + "' referenced by HasSubFunctionalEntity is an instance of FunctionalEntityType" );
                }
                else {
                    addError( "TargetNode '" + targetNode.NodeId + "' referenced by HasSubFunctionalEntity has no HasTypeDefinition reference" );
                    TC_Variables.result = false;
                }
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no HasSubFunctionalEntity reference. Skipping node" );
        }
    
    }
    else {
        addError( "Type 'HasSubFunctionalEntity' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.nothingTested ) {
        addError( "No FunctionalEntity with a HasSubFunctionalEntity reference found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );