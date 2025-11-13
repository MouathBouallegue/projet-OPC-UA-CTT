include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.Branch = new Object();

CUVariables.Branch.AlarmThread = null;
CUVariables.Branch.AlarmThreadStarted = false;
CUVariables.Branch.SelectFields = new KeyPairCollection();
CUVariables.Branch.Extra = null;

CUVariables.Branch.GetAlarmThread = function( collector ){
    if ( !isDefined( CUVariables.Branch.AlarmThread ) ){

        var mandatory = false;
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;

        collector.GetAlarmTester().GetAlarmUtilities().CreateSelectFieldsMap( 
            new UaNodeId( Identifier.AcknowledgeableConditionType_Acknowledge ).toString(), 
            CUVariables.Branch.SelectFields, mandatory, startIndexObject );

        CUVariables.Branch.AlarmThread = new AlarmThread();
    }

    return CUVariables.Branch.AlarmThread;
}

CUVariables.Branch.CreateSubscription = function( testName, collector ){
    var alarmThread = CUVariables.Branch.GetAlarmThread( collector );
    var eventItem = new UaNodeId( Identifier.Server );

    if ( CUVariables.Branch.AlarmThreadStarted ){

        var alarmDetails = alarmThread.AddEventItemExtended( {
            EventNodeId: eventItem, 
            SelectFields: CUVariables.Branch.SelectFields
        } );

        CUVariables.Branch[ testName ] = new Object;
        CUVariables.Branch[ testName ].EventMonitoredItem = alarmDetails.EventMonitoredItem;
        CUVariables.Branch[ testName ].Subscription = alarmDetails.Subscription;
        CUVariables.Branch.Extra = CUVariables.Branch[ testName ];
     }else{
        alarmThread.Start( {
            EventNodeId: eventItem,
            SelectFields: CUVariables.Branch.SelectFields
        } );

        alarmThread.StartPublish();
        CUVariables.Branch.Call = new CallService( alarmThread.SessionThread.Session );
        
        CUVariables.Branch.AlarmThreadStarted = true;

        CUVariables.Branch[ testName ] = new Object;
        CUVariables.Branch[ testName ].EventMonitoredItem = alarmThread.EvenMonitoredItem;
        CUVariables.Branch[ testName ].Subscription = alarmThread.Subscription;
    }
} 

CUVariables.Branch.GetEvents = function( testName, collector ){

    var buffer = [];

    var testDetails = CUVariables.Branch[ testName ];
    if ( isDefined( testDetails ) ){
        var alarmThread = CUVariables.Branch.GetAlarmThread( collector );
        var response = alarmThread.GetBuffer( 
            testDetails.Subscription.SubscriptionId, 
            testDetails.EventMonitoredItem );
        if ( response.status ){
            buffer = response.events;
        }
    }

    return buffer;
}

CUVariables.Branch.ClearEvents = function( testName, eventIds, collector ){
    var testDetails = CUVariables.Branch[ testName ];
    if ( isDefined( testDetails ) && eventIds.length > 0 ){
        var alarmThread = CUVariables.Branch.GetAlarmThread( collector );
        alarmThread.RemoveEntry( eventIds, 
            testDetails.Subscription.SubscriptionId, 
            testDetails.EventMonitoredItem.ClientHandle );
    }
}



include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_004.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_005.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_006.js" );
include( "./maintree/Alarms and Conditions/A and C Branch/Test Cases/Test_007.js" );

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
    CUVariables.AutoTestMap.Set( "Test_003", new Test_003() );
    CUVariables.AutoTestMap.Set( "Test_004", new Test_004() );
    CUVariables.AutoTestMap.Set( "Test_005", new Test_005() );
    CUVariables.AutoTestMap.Set( "Test_006", new Test_006() );
    CUVariables.AutoTestMap.Set( "Test_007", new Test_007() );
    var customInitialize = true;
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables, customInitialize );
    CUVariables.AlarmCollector.InitializeCustom( { 
        CUVariables: CUVariables,
        Branch: true
     } );

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
