/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Provide an invalid ArrayIndex for an Array Variable in the NodeIdValuePair.
    Requirements: Variable of type array exists.
          Step 1: Browse the FunctionalEntity for any array variable.
          Step 2: Read index one of the Array.
          Step 3: Call the Verify Method with the Value from step 2 as input argument. Provide
                  an ArrayIndex that is larger than the size of the Array.
*/

function Test_017() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.NotSet;
    TC_Variables.ExpectedVerificationVariablesErrors_0 = new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the FunctionalEntity for any array variable.
            
            var TestVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: CU_Variables.AllFunctionalEntities[i],
                ExcludeDataTypes: [           // simple
                    Identifier.Structure,
                    Identifier.BaseDataType,
                    Identifier.DiagnosticInfo
                ],
                ValueRank: 1,                 // array
            } );
            
            if( TestVariables.length > 0 ) {
                TC_Variables.nothingTested = false;
                // Step 2: Read index one of the Array.
                addLog( "Test variable used for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is '" + TestVariables[0].NodeId + "'" );
                TestVariables[0].AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: TestVariables[0] } ) ) {
                    // Step 3: Call the Verify Method with the Value from step 2 as input argument. Provide
                    //         an ArrayIndex that is larger than the size of the Array.
                    var callResult = callVerifyMethod( {
                        FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                        NodeIds: [ TestVariables[0].NodeId ],
                        Values: [ TestVariables[0].Value ],
                        ArrayIndexes: [ [ TestVariables[0].Value.Value.getArraySize() + 10 ] ],
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
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not contain any simple array variables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity containing at least one simple array variable found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_017 } );