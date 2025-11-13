include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ControlGroup Base";

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
            CU_Variables.AllFunctionalEntities = CU_Variables.AllFunctionalEntities.concat( 
                CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities 
            );
        }
        // Find and initialize all instances of type 'ControlGroupType'
        if( isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType.NodeId ) ) {
            CU_Variables.ControlGroupType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ControlGroupType } );
        }
        else addError( "Type definition of 'ControlGroupType' not found in server, therefore no instances of this type can be browsed." );
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );