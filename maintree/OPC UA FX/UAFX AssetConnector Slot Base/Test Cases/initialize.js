include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AssetConnector Slot Base";

CU_Variables.Test = new Object();

CU_Variables.modelMapHelper = new BuildLocalCacheMapService();
CU_Variables.modelMap = CU_Variables.modelMapHelper.GetModelMap();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );