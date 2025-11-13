include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "DI IVendorNameplate ProductInstanceUri";

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
        CU_Variables.AllTopLevelAssets = [];
        
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                CU_Variables.AllTopLevelAssets = CU_Variables.AllTopLevelAssets.concat( 
                    CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets 
                );
            }
            else _error.store( "AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'Assets' folder" );
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );