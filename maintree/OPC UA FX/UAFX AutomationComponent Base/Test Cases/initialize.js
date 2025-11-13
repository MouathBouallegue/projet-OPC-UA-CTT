include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AutomationComponent Base";

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
        // Find and initialize all instances of type 'AutomationComponentType' or subtypes
        if( isDefined( CU_Variables.Test.BaseObjectType.AutomationComponentType.NodeId ) ) {
            CU_Variables.AutomationComponentType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.AutomationComponentType, IncludeSubTypes: true } );
        }
        else {
            addError( "Type definition of 'AutomationComponentType' not found in server, therefore no instances of this type can be browsed. Aborting CU." );
            stopCurrentUnit();
        }
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