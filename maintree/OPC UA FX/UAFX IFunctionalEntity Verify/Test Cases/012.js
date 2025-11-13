/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check that the Verify Method responds with NotSet if the data type of the
                 provided NodeIdValuePair is not of the same type as the implemented verification
                 variable.
         Step 1: Browse the FunctionalEntity for any scalar variable.
         Step 2: Read the Attribute DataType of the variable.
         Step 3: Provide a different data type as value for the NodeIdValuePair (e.g. String
                 if ExpectedVerificationVariable has type Float). 
         Step 4: Call the Verify Method and provide the modified values from Step 3 as input
                 argument.
*/

function Test_012() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.NotSet;
    TC_Variables.ExpectedVerificationVariablesErrors_0 = new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the FunctionalEntity for any scalar variable.
            
            var TestVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: CU_Variables.AllFunctionalEntities[i],
                Nested: false,                // top level
                ExcludeDataTypes: [           // simple
                    Identifier.Structure,
                    Identifier.BaseDataType,
                    Identifier.DiagnosticInfo
                ],
                ValueRank: -1,                // scalar
            } );
            
            if( TestVariables.length > 0 ) {
                TC_Variables.nothingTested = false;
                // Step 2: Read the Attribute DataType of the variable.
                addLog( "Test variable used for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is '" + TestVariables[0].NodeId + "'" );
                TestVariables[0].AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: TestVariables[0] } ) ) {
                    // Step 3: Provide a different data type as value for the NodeIdValuePair (e.g. String
                    //         if ExpectedVerificationVariable has type Float). 
                    var wrongType = UaVariant.New( { Type: BuiltInType.String, Value: "WRONG_TYPE" } );
                    if( TestVariables[0].Value.Value.toNodeId().equals( new UaNodeId( Identifier.String ) ) ) {
                        wrongType = UaVariant.New( { Type: BuiltInType.Float, Value: 42.0 } );
                    }
                    // Step 4: Call the Verify Method and provide the modified values from Step 3 as input argument.
                    var callResult = callVerifyMethod( {
                        FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                        NodeIds: [ TestVariables[0].NodeId ],
                        Values: [ wrongType ],
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
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not contain any top level simple scalar variables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity containing at least one top level simple scalar variable found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_012 } );