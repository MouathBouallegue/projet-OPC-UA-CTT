include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Information/BuildLocalCacheMap.js" );
include ( "./library/AlarmsAndConditions/ConformanceHelpers/discretehelper.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.OffNormal = new Object();
CUVariables.OffNormal.NodeId = new UaNodeId( Identifier.OffNormalAlarmType );
CUVariables.OffNormal.NodeIdString = CUVariables.OffNormal.NodeId.toString();

CUVariables.AlarmTypeString = CUVariables.OffNormal.NodeIdString;

CUVariables.DiscreteHelper = new DiscreteHelper( { 
    AlarmType: CUVariables.OffNormal.NodeIdString } );

include( "./maintree/Alarms and Conditions/A and C Base/Discrete/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Base/Discrete/Test Cases/Test_002.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {
    var modelMapHelper = new BuildLocalCacheMapService();
    var modelMap = modelMapHelper.GetModelMap();

    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_001", new Test_001() );
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );
    print( "Creating alarm collector" );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
    if ( isDefined( CUVariables.AlarmCollector ) ) {
        print( "Initialize, found CUVariables.AlarmCollector" );
        if ( isDefined( CUVariables.AlarmCollector.AlarmThreadHolder ) ) {
            print( "Initialize, found CUVariables.AlarmCollector.AlarmThreadHolder" );
        }
    }
    
    CUVariables.PrintResults = [ 
        CUVariables.AlarmCollector.Categories.Error, 
        CUVariables.AlarmCollector.Categories.Activity ];

}
