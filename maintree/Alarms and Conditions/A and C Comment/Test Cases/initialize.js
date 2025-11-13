include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.Comment = new Object();
CUVariables.Comment.AddCommentNodeId = new UaNodeId( Identifier.ConditionType_AddComment );
CUVariables.Comment.AddCommentNodeIdString = CUVariables.Comment.AddCommentNodeId.toString();
CUVariables.Comment.ConditionTypeNodeId = new UaNodeId( Identifier.ConditionType );
CUVariables.Comment.ConditionTypeNodeIdString = CUVariables.Comment.ConditionTypeNodeId.toString();

include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Test_004.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Err_002.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Err_003.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Err_004.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Err_005.js" );
include( "./maintree/Alarms and Conditions/A and C Comment/Test Cases/Err_007.js" );

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
    CUVariables.AutoTestMap.Set( "Test_004", new Test_004() );
    CUVariables.AutoTestMap.Set( "Err_002", new Err_002() );
    CUVariables.AutoTestMap.Set( "Err_003", new Err_003() );
    CUVariables.AutoTestMap.Set( "Err_004", new Err_004() );
    CUVariables.AutoTestMap.Set( "Err_005", new Err_005() );
    CUVariables.AutoTestMap.Set( "Err_007", new Err_007() );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
                if ( isDefined( CUVariables.AlarmCollector ) ){
                print("Initialize, found CUVariables.AlarmCollector" );
                if ( isDefined( CUVariables.AlarmCollector.AlarmThreadHolder ) ){
                    print("Initialize, found CUVariables.AlarmCollector.AlarmThreadHolder" );
                }
            }

    CUVariables.PrintResults = [ CUVariables.AlarmCollector.Categories.Error,
        CUVariables.AlarmCollector.Categories.Activity ];
}
