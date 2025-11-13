/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the InputData folder and verify that at least one reference to a
                 variable exists.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].InputData ) ) {
                TC_Variables.nothingTested = false;
                // get all Organizes target nodes
                var organizesTargetNodes = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[i].InputData, new UaNodeId( Identifier.Organizes ) );
                if( organizesTargetNodes.length == 0 ) {
                    addError( "InputData folder '" + CU_Variables.AllFunctionalEntities[i].InputData.NodeId + "' has no Organizes references." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no InputData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity with an InputData folder found in server." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );