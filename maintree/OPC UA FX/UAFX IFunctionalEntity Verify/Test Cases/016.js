/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check that the status of Verify Method is Bad_NothingToDo if verification
                 was skipped because verification of preceding variables  resulted in VerificationResult
                 Mismatch.
         Step 1: Browse the FunctionalEntity for any scalar variables.
         Step 2: Read the Attribute Value of the variables.
         Step 3: Modify the value of one variable from Step 2 (the expected VerificationResult
                 equals mismatch) and provide it as second NodeIdValuePair. The first and
                 third NodeIdValuePair is valid.
         Step 4: Call the Verify Method and provide the modified values from Step 3 as input
                 argument.
*/

function Test_016() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.Mismatch;
    TC_Variables.ExpectedVerificationVariablesErrors_0 = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedVerificationVariablesErrors_1 = new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange );
    TC_Variables.ExpectedVerificationVariablesErrors_2 = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo, StatusCode.Good );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the FunctionalEntity for any scalar variables.
            
            var TestVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: CU_Variables.AllFunctionalEntities[i],
                ExcludeDataTypes: [           // simple
                    Identifier.Structure,
                    Identifier.BaseDataType,
                    Identifier.DiagnosticInfo
                ],
                ValueRank: -1                 // scalar
            } );
            
            if( TestVariables.length > 2 ) {
                TC_Variables.nothingTested = false;
                // Step 2: Read the Attribute Value of the variables.
                addLog( "Test variables used for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' are '" + TestVariables[0].NodeId + "', '" + TestVariables[1].NodeId + "' and '" + TestVariables[2].NodeId + "'" );
                TestVariables[0].AttributeId = Attribute.Value;
                TestVariables[1].AttributeId = Attribute.Value;
                TestVariables[2].AttributeId = Attribute.Value;
                if( ReadHelper.Execute( { NodesToRead: [ TestVariables[0], TestVariables[1], TestVariables[2] ] } ) ) {
                    // Step 3: Modify the value of one variable from Step 2 (the expected VerificationResult
                    //         equals mismatch) and provide it as second NodeIdValuePair. The first and
                    //         third NodeIdValuePair is valid.
                    UaVariant.Increment( { Item: TestVariables[1] } );
                    // Step 4: Call the Verify Method and provide the modified values from Step 3 as input argument.
                    var callResult = callVerifyMethod( {
                        FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                        NodeIds: [ 
                            TestVariables[0].NodeId,
                            TestVariables[1].NodeId,
                            TestVariables[2].NodeId
                        ],
                        Values: [ 
                            TestVariables[0].Value,
                            TestVariables[1].Value,
                            TestVariables[2].Value 
                        ],
                        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
                    } );
                    if( callResult.success ) { 
                        // check results
                        if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.Result = false;
                        addLog( "Returned result is " + FunctionalEntityVerificationResult_Names[callResult.VerificationResult] + "(" + callResult.VerificationResult + ")" );
                        
                        if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationVariablesErrors_0, callResult.VerificationVariablesErrors[0], "Received unexpected value for VerificationVariablesErrors[0]" ) ) TC_Variables.Result = false;
                        addLog( "Returned VerificationVariablesErrors[0]: " + callResult.VerificationVariablesErrors[0] );
                        if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationVariablesErrors_1, callResult.VerificationVariablesErrors[1], "Received unexpected value for VerificationVariablesErrors[1]" ) ) TC_Variables.Result = false;
                        addLog( "Returned VerificationVariablesErrors[1]: " + callResult.VerificationVariablesErrors[1] );
                        if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationVariablesErrors_2, callResult.VerificationVariablesErrors[2], "Received unexpected value for VerificationVariablesErrors[2]" ) ) TC_Variables.Result = false;
                        addLog( "Returned VerificationVariablesErrors[2]: " + callResult.VerificationVariablesErrors[2] );
                    }
                    else TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not contain at least 3 simple scalar variables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity containing at least 3 simple scalar variables found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_016 } );