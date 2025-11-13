include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AutomationComponent SupportsPersistence";

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
        // Find and initialize all instances of type 'ConnectionEndpointType' or subtypes
        if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.NodeId ) ) {
            CU_Variables.ConnectionEndpointType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ConnectionEndpointType, IncludeSubTypes: true } );
        }
        else {
            addError( "Type definition of 'ConnectionEndpointType' not found in server, therefore no instances of this type can be browsed. Aborting CU." );
            stopCurrentUnit();
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );