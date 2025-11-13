/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Call ClearStoredVariables Method and provide the NodeId of a NonVolatile
                  Variable.
    Requirements: NonVolatile ConfigurationData is available.
*/

function Test_Err_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadNotSupported ) ];

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                    // Call the ClearStoredVariables Method and provide the NodeId of a NonVolatile Variable...
                    var nonVolatileVariables = GetAllNonVolatileVariables( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                    if( nonVolatileVariables.length > 0 ) {
                        TC_Variables.nothingTested = false;
                        var variablesToClear = [];
                        for( var v=0; v<nonVolatileVariables.length; v++ ) variablesToClear.push( nonVolatileVariables[v].NodeId );
                        addLog( "Calling ClearStoredVariables method of ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' with VariablesToClear [ " + variablesToClear + " ]" );
                        var callResult = callClearStoredVariablesMethod( CU_Variables.AllFunctionalEntities[i].ConfigurationData, variablesToClear, TC_Variables.ServiceResult, TC_Variables.OperationResults );
                        break;
                    }
                    else addLog( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no NonVolatile variables. Skipping FunctionalEntity." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in AddressSpace exposes the ConfigurationData folder and a NonVolatile variable. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_006 } );