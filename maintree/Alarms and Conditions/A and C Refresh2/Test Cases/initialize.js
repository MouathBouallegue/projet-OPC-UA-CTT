include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.Refresh = new Object();
            
// 'Virtual Getters'
CUVariables.Refresh.Virtual = new Object();
CUVariables.Refresh.Virtual.MethodId = new UaNodeId( Identifier.ConditionType_ConditionRefresh2 );
CUVariables.Refresh.Virtual.MethodIdString = CUVariables.Refresh.Virtual.MethodId.toString();
CUVariables.Refresh.Virtual.Name = "Refresh2";
CUVariables.Refresh.Virtual.BrowseNameText = "ConditionRefresh2";
CUVariables.Refresh.Virtual.BrowseName = UaQualifiedName.New({ 
    NamespaceIndex: 0, Name: CUVariables.Refresh.Virtual.BrowseNameText });
CUVariables.Refresh.Virtual.Mandatory = false;
CUVariables.Refresh.Virtual.SupportsMonitoredItem = true;


// Functions common to this conformance unit
include( "./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/initialize2.js" );

// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Refresh2/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Refresh2/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_007.js" );
include( "./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_008.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {
    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_001", new Test_001() );
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );
    CUVariables.AutoTestMap.Set( "Test_003", new Test_003() );
    CUVariables.AutoTestMap.Set( "Test_007", new Test_007() );
    CUVariables.AutoTestMap.Set( "Test_008", new Test_008() );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
    CUVariables.PrintResults = [
        CUVariables.AlarmCollector.Categories.Error,
        CUVariables.AlarmCollector.Categories.Activity
    ];

    var modelMap = CUVariables.AlarmTester.GetAlarmUtilities().GetModelMap();
    var conditionRefreshInModel = modelMap.Get( CUVariables.Refresh.Virtual.MethodIdString );

    if ( !isDefined( conditionRefreshInModel ) ){
        addSkipped("Optional method ConditionRefresh2 is not supported in the server." );
        stopCurrentUnit();
    }
}
