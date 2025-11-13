include( "./library/Base/safeInvoke.js" );
include( "./library/PubSub/UADPMessageDissector.js" );
include( "./library/PubSub/PubSubUtilities.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX Input Datatype Support";

CU_Variables.Test = new Object();

CU_Variables.RequiredDataTypes = [
    new UaNodeId( Identifier.Boolean ),
    new UaNodeId( Identifier.SByte ),
    new UaNodeId( Identifier.Byte ),
    new UaNodeId( Identifier.Int16 ),
    new UaNodeId( Identifier.UInt16 ),
    new UaNodeId( Identifier.Int32 ),
    new UaNodeId( Identifier.UInt32 ),
    new UaNodeId( Identifier.Float )
];

CU_Variables.InputNodeOfTypeExists = [];
CU_Variables.InputNodeOfTypeFoundNode = [];
CU_Variables.InputNodeOfType_FE = [];

CU_Variables.OutputNodeOfTypeExists = [];
CU_Variables.OutputNodeOfTypeFoundNode = [];
CU_Variables.OutputNodeOfType_FE = [];

for( var i=0; i<CU_Variables.RequiredDataTypes.length; i++ ) {
    CU_Variables.InputNodeOfTypeExists.push( false );
    CU_Variables.InputNodeOfTypeFoundNode.push( null );
    CU_Variables.InputNodeOfType_FE.push( null );
    CU_Variables.OutputNodeOfTypeExists.push( false );
    CU_Variables.OutputNodeOfTypeFoundNode.push( null );
    CU_Variables.OutputNodeOfType_FE.push( null );
}
    

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