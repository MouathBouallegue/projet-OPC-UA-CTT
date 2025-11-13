/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse the InputData folder and verify that the HasInputGroup reference
                  exists.
    Requirements: A nested InputsFolder exists.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasInputGroup ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].InputData ) ) {
                TC_Variables.nothingTested = false;
                // check for HasInputGroup reference
                var searchDefinition = [ { ReferenceTypeId: CU_Variables.Test.HasComponent.HasInputGroup.NodeId } ];
                BaseVariables.ModelMapHelper.FindReferences( CU_Variables.AllFunctionalEntities[i].InputData.References.ReferenceDescriptions, searchDefinition );
                if( !isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    addError( "InputData folder '" + CU_Variables.AllFunctionalEntities[i].InputData.NodeId + "' has no HasInputGroup reference" );
                    TC_Variables.result = false;
                }
                else addLog( "InputData folder '" + CU_Variables.AllFunctionalEntities[i].InputData.NodeId + "' has a HasInputGroup reference" );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no InputData folder. Skipping node." );
        }
    }
    else {
        addError( "Type 'HasInputGroup' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.nothingTested ) {
        addError( "No FunctionalEntity with an InputData folder found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );