include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.Instances = new Object();
CUVariables.Instances.TypeMaps = new KeyPairCollection();

CUVariables.Instances.GetTypeMaps = function ( alarmTester, alarmType ) {

    if ( !CUVariables.Instances.TypeMaps.Contains( alarmType.SpecAlarmTypeId ) ) {

        var maps = {
            Mandatory: alarmTester.GetMandatoryMap( alarmType.SpecAlarmTypeId ),
            Optional: alarmTester.GetOptionalMap( alarmType.SpecAlarmTypeId )
        }

        CUVariables.Instances.TypeMaps.Set( alarmType.SpecAlarmTypeId, maps );
    }

    return CUVariables.Instances.TypeMaps.Get( alarmType.SpecAlarmTypeId );
}

include( "./maintree/Alarms and Conditions/A and C Instances/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Instances/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Instances/Test Cases/Test_004.js" );
include( "./maintree/Alarms and Conditions/A and C Instances/Test Cases/Test_005.js" );
include( "./maintree/Alarms and Conditions/A and C Instances/Test Cases/Test_006.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {
    var modelMapHelper = new BuildLocalCacheMapService();
    var modelMap = modelMapHelper.GetModelMap();

    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );
    CUVariables.AutoTestMap.Set( "Test_003", new Test_003() );
    CUVariables.AutoTestMap.Set( "Test_004", new Test_004() );
    CUVariables.AutoTestMap.Set( "Test_005", new Test_005() );
    CUVariables.AutoTestMap.Set( "Test_006", new Test_006() );
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
