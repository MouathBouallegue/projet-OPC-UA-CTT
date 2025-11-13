/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ControlGroups folder of each instance of the FuntionalEntityType
                 and verify that at least one instance of the ControlGroupType is exposed.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.HasComponent.HasControlGroup ) ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ControlGroups ) ) {
                TC_Variables.nothingTested = false;
                // check for HasControlGroup reference
                var searchDefinition = [ { ReferenceTypeId: CU_Variables.Test.HasComponent.HasControlGroup.NodeId } ];
                BaseVariables.ModelMapHelper.FindReferences( CU_Variables.AllFunctionalEntities[i].ControlGroups.References.ReferenceDescriptions, searchDefinition );
                if( !isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    addError( "ControlGroups folder '" + CU_Variables.AllFunctionalEntities[i].ControlGroups.NodeId + "' has no HasControlGroup reference" );
                    TC_Variables.result = false;
                }
                else addLog( "ControlGroups folder '" + CU_Variables.AllFunctionalEntities[i].ControlGroups.NodeId + "' has at least one HasControlGroup reference" );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ControlGroups folder. Skipping node." );
        }
    }
    else {
        addError( "Type 'HasControlGroup' not found in server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    if( TC_Variables.nothingTested ) {
        addSkipped( "No FunctionalEntity with a ControlGroups folder found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );