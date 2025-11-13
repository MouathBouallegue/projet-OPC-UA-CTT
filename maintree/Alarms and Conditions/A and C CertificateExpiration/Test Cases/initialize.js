include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.CertificateExpiration = new Object();
CUVariables.CertificateExpiration.NodeId = new UaNodeId( Identifier.CertificateExpirationAlarmType );
CUVariables.CertificateExpiration.NodeIdString = CUVariables.CertificateExpiration.NodeId.toString();
CUVariables.CertificateExpiration.TwoWeeks = 1000 * 60 * 60 * 24 * 7 * 2;
CUVariables.CertificateExpiration.NodeIds = null;
CUVariables.CertificateExpiration.RefreshStartNodeId = new UaNodeId( Identifier.RefreshStartEventType );
CUVariables.CertificateExpiration.RefreshEndNodeId = new UaNodeId( Identifier.RefreshEndEventType );

CUVariables.CertificateExpiration.GetLimit = function( eventFields, collector ){
    var limit = CUVariables.CertificateExpiration.TwoWeeks;
    var configuredLimit = collector.GetSelectField( eventFields, "ExpirationLimit" );
    if ( collector.ValidateDataType( configuredLimit, BuiltInType.Double ) ){
        limit = configuredLimit.toDouble();
    }
    return limit;
}

CUVariables.CertificateExpiration.GetExpirationTime = function( testName, conditionId, eventFields, localTestCase, failedState, collector ){
    var time = null;

    var expirationTime = collector.GetSelectField( eventFields, "ExpirationDate" );
    if ( collector.ValidateDataType( expirationTime, BuiltInType.DateTime ) ){
        time = UaDateTime( expirationTime.toDateTime() );
    }else{
        if ( isDefined( testName ) && isDefined( conditionId ) && isDefined( localTestCase ) && isDefined( failedState ) ){
            collector.Error( testName, conditionId, localTestCase, failedState, "Mandatory field ExpirationDate not found" );
        }
    }

    return time;
}

CUVariables.CertificateExpiration.GetAlarmTime = function( testName, conditionId, eventFields, localTestCase, failedState, collector ){
    var limitTime = null;
    var time = CUVariables.CertificateExpiration.GetExpirationTime( 
        testName, conditionId, eventFields, localTestCase, failedState, collector );
    if ( isDefined( time ) ){
        var limit = CUVariables.CertificateExpiration.GetLimit( eventFields, collector );
        time.addMilliSeconds( -limit );
        limitTime = time;
    }    

    return limitTime;
}

CUVariables.CertificateExpiration.GetSupportedAlarmTypes = function( collector ){
    
    if ( CUVariables.CertificateExpiration.NodeIds == null ){
        CUVariables.CertificateExpiration.NodeIds = 
            collector.GetAlarmTypesAndSubTypes( CUVariables.CertificateExpiration.NodeIdString );
    }

    return CUVariables.CertificateExpiration.NodeIds;
}


CUVariables.CertificateExpiration.IsDesiredType = function( typeIdString, collector ){
    
    var desired = false;

    var supportedAlarmTypes = CUVariables.CertificateExpiration.GetSupportedAlarmTypes( collector );

    supportedAlarmTypes.forEach( function( supportedId ){
        if ( supportedId == typeIdString ){
            desired = true;
            return;
        }
    } );

    return desired;
}

CUVariables.CertificateExpiration.CanRunTest = function( testName, conditionId, eventFields, testCase, collector ) {

    var canRun = false;

    if ( collector.CanRunTest( conditionId, testName ) ) {
        var eventTypeString = eventFields[ collector.EventTypeIndex ].toString();
        if ( CUVariables.CertificateExpiration.IsDesiredType( eventTypeString, collector ) ) {
            canRun = true;
        } else {
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, testName );
        }
    }

    return canRun;
}

include( "./maintree/Alarms and Conditions/A and C CertificateExpiration/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C CertificateExpiration/Test Cases/Test_004.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {

    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_001", new Test_001() );
    CUVariables.AutoTestMap.Set( "Test_004", new Test_004() );
    print("Creating alarm collector");
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
                if ( isDefined( CUVariables.AlarmCollector ) ){
                print("Initialize, found CUVariables.AlarmCollector" );
                if ( isDefined( CUVariables.AlarmCollector.AlarmThreadHolder ) ){
                    print("Initialize, found CUVariables.AlarmCollector.AlarmThreadHolder" );
                }
            }
    CUVariables.PrintResults = [ CUVariables.AlarmCollector.Categories.Error ];
}
