include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

// Functions common to this conformance unit
CUVariables.Alarm = new Object();

CUVariables.Alarm.AcknowledgeableConditionType = new UaNodeId( Identifier.AcknowledgeableConditionType );
CUVariables.Alarm.AcknowledgeableConditionTypeString = CUVariables.Alarm.AcknowledgeableConditionType.toString();
CUVariables.Alarm.AlarmConditionType = new UaNodeId( Identifier.AlarmConditionType );

CUVariables.Alarm.CanRunAlarmCondition = function( eventFields, collector ){
    var canRunAlarmCondition = false;
    var eventType = eventFields[ collector.EventTypeIndex ];
    var alarmEventType = CUVariables.AlarmTypes.Get( eventType.toString() );
    if ( isDefined( alarmEventType ) ) {
        var knownAlarmType = alarmEventType.SpecAlarmTypeId;
        if ( new UaNodeId( Identifier.ConditionId ).toString() != knownAlarmType &&
            CUVariables.Alarm.AcknowledgeableConditionType.toString() != knownAlarmType ) {
            canRunAlarmCondition = true;
        }
    }
    return canRunAlarmCondition;
}

CUVariables.Alarm.CanRunTest = function ( testName, eventFields, collector ) {
    var canRunTest = false;
    var conditionId = collector.GetConditionId( eventFields );

    if ( collector.CanRunTest( conditionId, testName ) ) {
        canRunTest = CUVariables.Alarm.CanRunAlarmCondition( eventFields, collector );
    }

    return canRunTest;
}

CUVariables.Alarm.ValidateRetain = function( conditionIdString, eventFields, testCase, collector ){
    var success = true;
    if ( !collector.ValidateRetain( eventFields ) ){
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " After Acknowledge Retain in invalid state" );
        testCase.TestsFailed++;
        success = false;
    }
    return success;
}

// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Alarm/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Alarm/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Alarm/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Alarm/Test Cases/Test_004.js" );

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
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
    CUVariables.PrintResults = [
        CUVariables.AlarmCollector.Categories.Error
    ];
}








