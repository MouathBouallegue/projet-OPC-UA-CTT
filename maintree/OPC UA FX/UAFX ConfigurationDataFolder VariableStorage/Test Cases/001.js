/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ConfigurationData folder in every FunctionalEntity and verify
                 that the Methods SetStoredVariables, ClearStoredVariables and ListStoredVariables
                 are exposed.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                TC_Variables.nothingTested = false;
                // SetStoredVariables
                if( !Assert.True( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData.SetStoredVariables ), "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' is missing the 'SetStoredVariables' method" ) ) TC_Variables.Result = false;
                // ClearStoredVariables
                if( !Assert.True( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData.ClearStoredVariables ), "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' is missing the 'ClearStoredVariables' method" ) ) TC_Variables.Result = false;
                // ListStoredVariables
                if( !Assert.True( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData.ListStoredVariables ), "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' is missing the 'ListStoredVariables' method" ) ) TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the FunctionalEntities found in AddressSpace exposes the ConfigurationData folder. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );