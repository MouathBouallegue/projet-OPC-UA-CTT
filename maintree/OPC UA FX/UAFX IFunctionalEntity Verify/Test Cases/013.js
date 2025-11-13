/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the Verify Method and provide an empty String as NodeId in the key
                 field.
*/

function Test_013() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.NotSet;
    TC_Variables.ExpectedVerificationVariablesErrors_0 = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            var callResult = callVerifyMethod( {
                FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                NodeIds: [ UaVariant.New( { Type: BuiltInType.String, Value: "" } ) ],
                Values: [ new UaVariant() ],
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
            } );
            if( callResult.success ) { 
                // check results
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.Result = false;
                addLog( "Returned result is " + FunctionalEntityVerificationResult_Names[callResult.VerificationResult] + "(" + callResult.VerificationResult + ")" );
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationVariablesErrors_0, callResult.VerificationVariablesErrors[0], "Received unexpected value for VerificationVariablesErrors[0]" ) ) TC_Variables.Result = false;
                addLog( "Returned VerificationVariablesErrors[0]: " + callResult.VerificationVariablesErrors[0] );
            }
            else TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_013 } );