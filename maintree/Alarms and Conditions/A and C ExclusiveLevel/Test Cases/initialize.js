include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/AlarmsAndConditions/AlarmUtilities.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include ( "./library/Base/whereClauseCreator.js" );
include ( "./library/AlarmsAndConditions/ConformanceHelpers/limithelper.js" );


var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.ExclusiveLevel = new Object();
            
CUVariables.ExclusiveLevel.AlarmType = new UaNodeId( Identifier.ExclusiveLevelAlarmType );
CUVariables.ExclusiveLevel.AlarmTypeString = CUVariables.ExclusiveLevel.AlarmType.toString();

// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Base/Limit/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Base/Limit/Test Cases/Test_002.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {

    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_001", new Test_001() );
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );

    var customInitialize = true;
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables, customInitialize );
    CUVariables.LimitHelper = new LimitHelper( { 
        AlarmType: CUVariables.ExclusiveLevel.AlarmType, 
        AlarmCollector: CUVariables.AlarmCollector } );
    CUVariables.AlarmCollector.InitializeCustom( { CUVariables: CUVariables } );

    CUVariables.PrintResults = [
        CUVariables.AlarmCollector.Categories.Error,
        CUVariables.AlarmCollector.Categories.Activity
    ];
}
