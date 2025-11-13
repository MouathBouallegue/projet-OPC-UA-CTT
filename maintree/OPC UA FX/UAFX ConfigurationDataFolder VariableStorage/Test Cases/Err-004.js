/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Call ClearStoredVariables Method and provide the NodeId of a ConfigurationData
                  Variable that does not belong to this FunctionalEntity or one of its
                  SubFunctionalEntities.
    Requirements: At least two FunctionalEntities are supported by the AutomationComponent.
*/

function Test_Err_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ];

    if( CU_Variables.AllFunctionalEntities.length > 1 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                var volatileVariables = GetAllVolatileVariables( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                if( volatileVariables.length > 0 ) {
                    TC_Variables.nothingTested = false;
                    var variablesToClear = [];
                    for( var v=0; v<volatileVariables.length; v++ ) variablesToClear.push( volatileVariables[v].NodeId );
                    // Call the ClearStoredVariables Method of a different FunctionalEntity
                    if( i == 0 ) var callResult = callClearStoredVariablesMethod( CU_Variables.AllFunctionalEntities[1].ConfigurationData, variablesToClear, TC_Variables.ServiceResult, TC_Variables.OperationResults );
                    else var callResult = callClearStoredVariablesMethod( CU_Variables.AllFunctionalEntities[0].ConfigurationData, variablesToClear, TC_Variables.ServiceResult, TC_Variables.OperationResults );
                }
                else addLog( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no volatile variables. Skipping FunctionalEntity." );
                // break after one FunctionalEntity with ConfigurationData folder has been found
                break;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the FunctionalEntities found in AddressSpace exposes the ConfigurationData folder containing at least one variable. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "Not enough FunctionalEntities found in server. At least 2 are needed. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_004 } );