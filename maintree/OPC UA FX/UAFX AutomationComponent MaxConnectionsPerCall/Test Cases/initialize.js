include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AutomationComponent MaxConnectionsPerCall";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        CU_Variables.AllFunctionalEntities = [];
        
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            var allFunctionalEntitiesOfAC = CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities;
            for( var fe=0; fe<allFunctionalEntitiesOfAC.length; fe++ ) {
                allFunctionalEntitiesOfAC[fe].ParentAutomationComponent = CU_Variables.Test.AutomationComponents[ac];
            }
            CU_Variables.AllFunctionalEntities = CU_Variables.AllFunctionalEntities.concat( allFunctionalEntitiesOfAC );
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );