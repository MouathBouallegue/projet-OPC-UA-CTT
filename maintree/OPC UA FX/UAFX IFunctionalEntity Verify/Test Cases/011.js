/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Check the Verify Method for top level array variables. Expected Verification
                  Result is Mismatch.
    Requirements: Variable of type array exists.
          Step 1: Browse the FunctionalEntity for any variable of type array.
          Step 2: Read the Attribute Value.
          Step 3: Modify the values of the first, center and last array element from Step
                  2 that the expected VerificationResult equals mismatch.
          Step 4: Call the Verify Method and provide the modified values from Step 3 as input
                  argument. The ArrayIndex has size 0.
*/

function Test_011() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.Mismatch;
    TC_Variables.ExpectedVerificationVariablesErrors_0 = new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the FunctionalEntity for any variable of type array.
            
            var TestVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: CU_Variables.AllFunctionalEntities[i],
                Nested: false,                // top level
                ExcludeDataTypes: [           // simple
                    Identifier.Structure,
                    Identifier.BaseDataType,
                    Identifier.DiagnosticInfo
                ],
                ValueRank: 1,                 // array
            } );
            
            if( TestVariables.length > 0 ) {
                TC_Variables.nothingTested = false;
                // Step 2: Read the Attribute Value.
                addLog( "Test variable used for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is '" + TestVariables[0].NodeId + "'" );
                TestVariables[0].AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: TestVariables[0] } ) ) {
                    // Step 3: Modify the values of the first, center and last array element from Step 2
                    //         that the expected VerificationResult equals mismatch.
                    var range = new UaRange();
                    range.Low = 0;
                    range.High = range.Low;
                    UaVariant.Increment( { Item: TestVariables[0], Range: range } );
                    range.Low = TestVariables[0].Value.Value.getArraySize() - 1;
                    range.High = range.Low;
                    UaVariant.Increment( { Item: TestVariables[0], Range: range } );
                    range.Low = Math.floor( TestVariables[0].Value.Value.getArraySize() / 2 );
                    range.High = range.Low;
                    UaVariant.Increment( { Item: TestVariables[0], Range: range } );
                    // Step 4: Call the Verify Method and provide the modified values from Step 3 as input
                    //         argument. The ArrayIndex has size 0.
                    var callResult = callVerifyMethod( {
                        FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                        NodeIds: [ TestVariables[0].NodeId ],
                        Values: [ TestVariables[0].Value ],
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
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not contain any top level simple array variables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity containing at least one top level simple array variable found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_011 } );