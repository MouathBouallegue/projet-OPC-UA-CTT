/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Browse all top level instances of FuntionalEntity Type in the FunctionalEntity
                  folder and verify that the ControlGroups folder is exposed in the address
                  space.
    Requirements: ControlGroups are supported.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingFound = true;

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ControlGroups ) ) TC_Variables.nothingFound = false;
        }
        if( TC_Variables.nothingFound ) {
            addError( "No FunctionalEntity with a ControlGroups folder found in server." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );