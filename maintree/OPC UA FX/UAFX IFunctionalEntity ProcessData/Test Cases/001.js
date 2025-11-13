/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the FunctionalEntity and verify that either InputData or OutputData
                 or both Objects are present.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( !isDefined( CU_Variables.AllFunctionalEntities[i].InputData ) && !isDefined( CU_Variables.AllFunctionalEntities[i].OutputData ) ) {
                addError( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing both 'InputData' and/or 'OutputData'." );
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