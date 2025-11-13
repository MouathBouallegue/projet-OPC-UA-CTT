/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the CommHealth variable exists in every top-level FuntionalEntity
         Step 1: Browse the ConnectionEndpoints folder
         Step 2: Repeat previous step for every top-level FunctionalEntity
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        // Step 2: Repeat previous step for every top-level FunctionalEntity
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            // Step 1: Browse the ConnectionEndpoints folder
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                TC_Variables.nothingTested = false;
                if( !isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints.CommHealth ) ) {
                    addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'CommHealth' variable." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder. Skipping instance." );
        }
        if( TC_Variables.nothingTested ) addSkipped( "No FunctionalEntity found in AddressSpace that exposes the ConnectionEndpoints folder. Skipping test." );
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );