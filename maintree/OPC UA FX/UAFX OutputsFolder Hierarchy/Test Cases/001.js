/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse the OutputData folder and verify that the HasOutputGroup reference
                  exists.
    Requirements: A nested OutputsFolder exists.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasOutputGroup ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].OutputData ) ) {
                TC_Variables.nothingTested = false;
                // check for HasOutputGroup reference
                var searchDefinition = [ { ReferenceTypeId: CU_Variables.Test.HasComponent.HasOutputGroup.NodeId } ];
                BaseVariables.ModelMapHelper.FindReferences( CU_Variables.AllFunctionalEntities[i].OutputData.References.ReferenceDescriptions, searchDefinition );
                if( !isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    addError( "OutputData folder '" + CU_Variables.AllFunctionalEntities[i].OutputData.NodeId + "' has no HasOutputGroup reference" );
                    TC_Variables.result = false;
                }
                else addLog( "OutputData folder '" + CU_Variables.AllFunctionalEntities[i].OutputData.NodeId + "' has a HasOutputGroup reference" );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no OutputData folder. Skipping node." );
        }
    }
    else {
        addError( "Type 'HasOutputGroup' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.nothingTested ) {
        addError( "No FunctionalEntity with an OutputData folder found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );