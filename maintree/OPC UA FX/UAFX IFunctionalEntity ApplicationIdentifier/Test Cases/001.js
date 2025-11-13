/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse every top level FunctionalEntity in the FunctionalEntities Folder
                 and check for support of the Property ApplicationIdentifier.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( !isDefined( CU_Variables.AllFunctionalEntities[i].ApplicationIdentifier ) ) {
                addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'ApplicationIdentifier' property." );
                TC_Variables.Result = false;
            }
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );