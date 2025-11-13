/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Check the Verify Method for the center element of a one dimensional top
                  level array variable. Expected Verification Result is Match.
    Requirements: Variable of type array exists.
          Step 1: Browse the FunctionalEntity for any array variable.
          Step 2: Read the Attribute Value.
          Step 3: Call the Verify Method with the Values from step 2 as input argument. Use
                  the information from Step 2 to define the ArrayIndex element of the NodeIdArray
                  Structure.
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedVerificationResult = FunctionalEntityVerificationResult.Match;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            
            // Step 1: Browse the FunctionalEntity for any array variable.
            
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
                    // Step 3: Call the Verify Method with the Values from step 2 as input argument. Use
                    //         the information from Step 2 to define the ArrayIndex element of the NodeIdArray
                    //         Structure.
                    var callResult = callVerifyMethod( {
                        FunctionalEntity: CU_Variables.AllFunctionalEntities[i],
                        NodeIds: [ TestVariables[0].NodeId ],
                        Values: [ TestVariables[0].Value ],
                        ArrayIndexes: [ [ Math.floor( TestVariables[0].Value.Value.getArraySize() / 2 ) ] ]
                    } );
                    if( callResult.success ) { 
                        // check results
                        if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.Result = false;
                        addLog( "Returned result is " + FunctionalEntityVerificationResult_Names[callResult.VerificationResult] + "(" + callResult.VerificationResult + ")" );
                    }
                    else TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not contain any simple top level array variables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity containing at least one simple top level array variable found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );