include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ControlGroup Nested";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else CU_Variables.ControlGroupsWithNestedControlGroups = GetControlGroupInstancesWithNestedControlGroups();
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );