/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call ClearStoredVariables Method and provide the NodeId of a Variable that
                 is not ConfigurationData.
*/

function Test_Err_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ];

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                    // Call the ClearStoredVariables Method and provide the NodeId of a Variable...
                    var variableToClear = [];
                    var TestVariables = GetVariablesFromFunctionalEntity( {
                        StartingNode: CU_Variables.AllFunctionalEntities[i]
                    } );
                    // ...that is not ConfigurationData
                    for( var v=0; v<TestVariables.length; v++ ) {
                        if( !CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId.equals( GetParentNode( TestVariables[v] ).NodeId ) ) {
                            variableToClear = [ TestVariables[v].NodeId ];
                            break;
                        }
                    }
                    if( variableToClear.length > 0 ) {
                        TC_Variables.nothingTested = false;
                        addLog( "Calling ClearStoredVariables method of ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' with VariablesToClear [ " + variableToClear[0] + " ]" );
                        var callResult = callClearStoredVariablesMethod( CU_Variables.AllFunctionalEntities[i].ConfigurationData, variableToClear, TC_Variables.ServiceResult, TC_Variables.OperationResults );
                        break;
                    }
                    else addLog( "No variable found in FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' which is not ConfigurationData. Skipping FunctionalEntity." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in AddressSpace exposes the ConfigurationData folder and a variable that is not ConfigurationData. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_005 } );