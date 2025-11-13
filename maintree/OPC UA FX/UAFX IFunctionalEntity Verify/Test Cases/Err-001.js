/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the Verify Method without providing InputArguments.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            var callResult = callVerifyMethod( {
                FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                NodeIds: [],
                Values: [],
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ]
            } );
            TC_Variables.Result = callResult.success;
            if( !TC_Variables.Result ) break;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_001 } );