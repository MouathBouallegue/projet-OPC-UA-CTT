
include( "./library/AlarmsAndConditions/AlarmUtilities.js" );
include( "./library/Base/whereClauseCreator.js" );


// Helpful Defines
CUVariables.Refresh.ConditionType = new UaNodeId( Identifier.ConditionType );
CUVariables.Refresh.ConditionTypeString = CUVariables.Refresh.ConditionType.toString();
CUVariables.Refresh.SystemEventType = new UaNodeId( Identifier.SystemEventType );
CUVariables.Refresh.SystemEventTypeString = CUVariables.Refresh.SystemEventType.toString();
CUVariables.Refresh.AlwaysGeneratesEvent = new UaNodeId( Identifier.AlwaysGeneratesEvent );
CUVariables.Refresh.AlwaysGeneratesEventString = CUVariables.Refresh.AlwaysGeneratesEvent.toString();
CUVariables.Refresh.RefreshStartEventType = new UaNodeId( Identifier.RefreshStartEventType );
CUVariables.Refresh.RefreshEndEventType = new UaNodeId( Identifier.RefreshEndEventType );


// Set up Custom test cases for AlarmCollector

CUVariables.TestTypeResults = new KeyPairCollection();
{
    // Mirror of AlarmTester.CreateTestTypePlaceholder
    var testPlaceHolder = new Object();
    testPlaceHolder.TypePassed = false;
    testPlaceHolder.Name = CUVariables.Refresh.Virtual.BrowseNameText;

    CUVariables.TestTypeResults.Set( CUVariables.Refresh.Virtual.MethodIdString, 
        testPlaceHolder );
}

// Functions common to this Refresh/Refresh2

CUVariables.Refresh.RemoveEntry = function ( CUVariables, events ) {
    var idsToRemove = [];
    if ( isDefined( events ) ) {
        if ( events.status == true ) {
            for ( var index = 0; index < events.events.length; index++ ) {
                idsToRemove.push( events.events[ index ].EventHandle );
            }
            if ( idsToRemove.length > 0 ) {
                CUVariables.AlarmThreadHolder.AlarmThread.RemoveEntry(
                    CUVariables.Refresh.SystemEventMonitor.SubscriptionData.Subscription.SubscriptionId,
                    CUVariables.Refresh.SystemEventMonitor.EventItem.ClientHandle );
            }
        }
    }
}

CUVariables.Refresh.CallRefresh = function( CUVariables ){

    // CallHelper is the original helper from Helpers.js, not in any thread, only called from Test_006
    return CUVariables.Refresh.CallRefreshDetails( CUVariables, 
        CallHelper,
        CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId,
        CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.MonitoredItemId );
}

CUVariables.Refresh.CallRefreshDetails = function( CUVariables, callHelper, subscriptionId, clientId ){
    
    print( "CUVariables.Refresh.CallRefreshDetails subscription " + subscriptionId + " client " + clientId );

    var inputArguments = [];
    var subscription = new UaVariant();
    subscription.setUInt32( subscriptionId );
    inputArguments.push( subscription );
    if ( CUVariables.Refresh.Virtual.BrowseNameText == "ConditionRefresh2" ){
        var item = new UaVariant();
        item.setUInt32( clientId );
        inputArguments.push( item );
    }

    callHelper.Execute( {
        MethodsToCall: [ {
            MethodId: CUVariables.Refresh.Virtual.MethodId,
            ObjectId: CUVariables.Refresh.ConditionType,
            InputArguments: inputArguments
        } ],
        SuppressMessaging: true
    } );

    print( CUVariables.Refresh.Virtual.BrowseNameText + " Returned " + 
    callHelper.Response.Results[ 0 ].StatusCode.toString() );
    var timeOfRefreshCall = callHelper.Response.ResponseHeader.Timestamp;
    print("TimeOfRefreshCall = " + timeOfRefreshCall.toString());
    CUVariables.Refresh.TimeOfRefreshCall = timeOfRefreshCall;

    return new UaStatusCode( callHelper.Response.Results[ 0 ].StatusCode );
}

CUVariables.Refresh.IsRefreshEventType = function( CUVariables, eventFields ){
    var isRefreshEventType = false;
    var eventType = eventFields[ CUVariables.AlarmCollector.EventTypeIndex ].toNodeId();
    if ( eventType.equals( CUVariables.Refresh.RefreshStartEventType ) ) {
        isRefreshEventType = true;
        if ( !isDefined( CUVariables.Refresh.RefreshStartEvent ) ){
            CUVariables.Refresh.RefreshStartEvent = eventFields;
        }
    } else if ( eventType.equals( CUVariables.Refresh.RefreshEndEventType ) ) {
        isRefreshEventType = true;
        if ( !isDefined( CUVariables.Refresh.RefreshEndEvent ) ){
            CUVariables.Refresh.RefreshEndEvent = eventFields;
        }
    }

    return isRefreshEventType;
}


CUVariables.Refresh.InitializeTestData = function( collector, testData, name, testName ){
    print( "Initialize " + testName + ":" + name );
    testData.Name = name;
    testData.TestName = testName;
    
    var typeResults = collector.TestTypeResults.Get( 
        CUVariables.Refresh.Virtual.MethodIdString );

    if ( isDefined( typeResults.TestCases ) ){
        testData.TestCase = typeResults.TestCases.Get( testName );
    }
    testData.TestIdentifier = CUVariables.Refresh.Virtual.MethodId;

    CUVariables.Refresh.ResetTestData( testData, "Initial" );
}

CUVariables.Refresh.ResetTestData = function( testData, state ){
    
    testData.TestState = state;
    testData.SaveEvents = [];
    testData.StartEvent = null;
    testData.EndEvent = null;
    testData.WaitingForStartCounter = 0;
    testData.WaitingForEndCounter = 0;
    testData.RefreshTime = null;
    testData.ItemCreated = false;
}

CUVariables.Refresh.InitializeSubscription = function( 
    testData, selectFieldsMap, alarmThread, subscription, eventItem ){
    testData.SelectFields = selectFieldsMap;
    testData.AlarmThread = alarmThread;
    testData.Subscription = subscription;
    testData.SubscriptionId = subscription.SubscriptionId;
    testData.EventItem = eventItem;
    testData.ClientId = eventItem.ClientHandle;
    testData.ItemCreated = true;


    print( testData.Name + " SubscriptionId " + testData.SubscriptionId + " ClientId " + testData.ClientId );
}

CUVariables.Refresh.ShutdownItem = function( testData ){
    if ( testData.ItemCreated ) {
        testData.AlarmThread.SessionThread.Helpers.DeleteMonitoredItemsHelper.Execute( {
            ItemsToDelete: testData.EventItem,
            SubscriptionId: testData.Subscription
        } );

        // Doesn't clean out the item from the thread, that will be done at the
        // the end of the conformance unit
        testData.AlarmThread.SessionThread.ClearThreadData( {
            ThreadId: testData.AlarmThread.SessionThread.ThreadId,
            SubscriptionId: testData.SubscriptionId,
            ClearEvents: true,
            ClientId: testData.ClientId
        } );
    }
}

CUVariables.Refresh.GetExtraBuffer = function ( testData ) {
    var alarmThread = testData.AlarmThread;

    var bufferResult = alarmThread.GetBuffer(
        testData.SubscriptionId,
        testData.ClientId
    );

    testData.Buffer = [];

    if ( bufferResult.status == true ) {
        testData.Buffer = bufferResult.events;
        print(testData.Name + " DEBUG GetExtraBuffer got " + testData.Buffer.length + " events" );
    }

    testData.IdsToRemove = [];
    for ( var index = 0; index < testData.Buffer.length; index++ ) {
        var event = testData.Buffer[ index ];
        testData.IdsToRemove.push( event.EventHandle );
    }
}


CUVariables.Refresh.ProcessEvents = function ( collector, testData ) {
    // Test should have these states defined as well
    var states = {
        WaitingForStart: "WaitingForStart",
        WaitingForEnd: "WaitingForEnd",
        ReadyToTest: "ReadyToTest"
    };

    print( testData.TestName + " ProcessEvents " + testData.Name + " State " + testData.TestState + " Events " + testData.Buffer.length);

    for ( var index = 0; index < testData.Buffer.length; index++ ) {
        var event = testData.Buffer[ index ];
        var eventFields = event.EventFieldList.EventFields;
        var eventType = collector.GetSelectFieldFromMap( eventFields, 
            "EventType", testData.SelectFields ).toNodeId();

        var time = collector.GetSelectFieldFromMap( eventFields, 
            "Time", testData.SelectFields ).toDateTime();

        print( "\t" + testData.TestName + " Event " + eventType.toString() + " at " + time.toString()) ;

        if ( testData.TestState == states.WaitingForStart ) {
            if ( eventType.equals( CUVariables.Refresh.RefreshStartEventType ) ) {
                if ( !isDefined( CUVariables.Refresh.RefreshStartEvent ) ){
                    CUVariables.Refresh.RefreshStartEvent = eventFields;
                }
        
                var time = collector.GetSelectFieldFromMap( eventFields, 
                    "Time", testData.SelectFields ).toDateTime();

                if ( time >= testData.RefreshTime ) {
                    print( testData.TestName + " ProcessEvents Found Start Event " + testData.Name );
                    testData.StartEvent = event;
                    testData.TestState = states.WaitingForEnd;
                }else{
                    print( testData.TestName + " ProcessEvents Event is before refresh " + testData.RefreshTime.toString() );
                }
            }
        } else if ( testData.TestState == states.WaitingForEnd ) {
            if ( eventType.equals( CUVariables.Refresh.RefreshEndEventType ) ) {
                if ( !isDefined( CUVariables.Refresh.RefreshEndEvent ) ){
                    CUVariables.Refresh.RefreshEndEvent = eventFields;
                }
                print( testData.TestName + " ProcessEvents Found End Event " + testData.Name );
                testData.EndEvent = event;
                testData.TestState = states.ReadyToTest;
            } else {
                testData.SaveEvents.push( event );
            }
        }
    }
    print( testData.TestName + " ProcessEvents Complete");

}


CUVariables.Refresh.PostLoopDeleteEvents = function ( testData ) {

    if ( isDefined( testData.IdsToRemove ) && testData.IdsToRemove.length > 0 ) {
        print("DEBUG PostLoopDeleteEvents deleting " + testData.IdsToRemove.length + " events" );

        testData.AlarmThread.RemoveEntry(
            testData.IdsToRemove,
            testData.SubscriptionId,
            testData.ClientId
        );
        testData.IdsToRemove = [];
    }
}

CUVariables.Refresh.Fail = function ( collector, testData, state, errorMessage, completeTest ) {
    collector.AddMessage( testData.TestCase, collector.Categories.Error,
        testData.TestName + " " + testData.Name + " " + errorMessage );
    testData.TestCase.TestsFailed++;
    testData.TestState = state;
    if ( completeTest ){
        collector.TestCompleted( testData.TestIdentifier, testData.TestName );
        completeTest = false;
    }
}

CUVariables.Refresh.VerifyStartBeforeEnd = function ( collector, testData, failedState ) {
    var success = true;
    if ( isDefined( testData.StartEvent ) && isDefined( testData.EndEvent ) ) {
        if ( testData.StartEvent.EventHandle > testData.EndEvent.EventHandle ) {
            CUVariables.Refresh.Fail( collector, testData.TestCase, failedState,
                "Received Refresh End Event before Refresh Start Event" );
            success = false;
        }
    } else {
        throw ( "Test Design Error" );
    }
    return success;
}

CUVariables.Refresh.VerifySystemEvent = function( CUVariables, testName, eventTypeName ){

    var success = false;
    
    var eventFields = null;
    var desiredEventType = null;
    if (  eventTypeName == "StartEvent" ){
        eventFields = CUVariables.Refresh.GetStartEvent( CUVariables, testName );
        desiredEventType = CUVariables.Refresh.RefreshStartEventType;
    }else if ( eventTypeName == "EndEvent" ){
        eventFields = CUVariables.Refresh.GetEndEvent( CUVariables, testName );
        desiredEventType = CUVariables.Refresh.RefreshEndEventType;
    }

    if ( isDefined( eventFields ) ){
        success = true;
        var collector = CUVariables.AlarmCollector;

        var systemEventFieldsMap = new KeyPairCollection();
        var mandatory = false;
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;

        var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
        alarmUtilities.CreateSelectFieldsMap( CUVariables.Refresh.SystemEventTypeString,
            systemEventFieldsMap, mandatory, startIndexObject );

        var nodeSetUtility = alarmUtilities.GetNodeSetUtility();
        // Use the systemEventFieldsMap as a guide, but use the configured SelectMap, as that 
        // is how the buffer was set up.

        var keys = systemEventFieldsMap.Keys();
        for( var index = 0; index < keys.length; index++ ){
            var key = keys[ index ];
            var field = systemEventFieldsMap.Get( key );
            var nodeSetField = nodeSetUtility.GetEntity( field.Reference._NodeId );
            var isMandatory = nodeSetUtility.IsMandatory( nodeSetField );
            var dataTypeIdentifier = nodeSetUtility.GetExpectedDataTypeIdentifier( nodeSetField );

            var eventField = collector.GetSelectField( eventFields, key );
            if ( eventField.DataType != 0 ){
                if ( !collector.ValidateDataType( eventField, dataTypeIdentifier ) ){
                    addError( "Event field " + key + " has invalid datatype: Expected " + dataTypeIdentifier +
                        " Actual " + eventField.DataType );
                        success = false;
                }

                if ( key == "EventType" ){
                    var eventType = eventField.toNodeId();
                    if ( isDefined( eventType ) ){

                        if ( !eventType.equals( desiredEventType ) ){
                            addError( "EventType has incorrect value: Expected " + desiredEventType.toString() + 
                            " Actual " + eventType.toString() );
                            success = false;
                        } 
                    }else{
                        addError( "EventType does not have a value" );
                        success = false;
                    }
                }
            }else{
                if ( isMandatory ){
                    addError( "Mandatory event field " + key + " does not have a value" );
                    success = false;
                }
            }
        }
    }

    return success;
}

CUVariables.Refresh.GetStartEvent = function( CUVariables, testName ){

    if ( !isDefined( CUVariables.Refresh.RefreshStartEvent ) ){
        CUVariables.Refresh.GetStartStop( CUVariables, testName );
    }

    return CUVariables.Refresh.RefreshStartEvent;
}

CUVariables.Refresh.GetEndEvent = function( CUVariables, testName ){

    if ( !isDefined( CUVariables.Refresh.RefreshEndEvent ) ){
        CUVariables.Refresh.GetStartStop( CUVariables, testName );
    }

    return CUVariables.Refresh.RefreshEndEvent;
}

CUVariables.Refresh.GetStartStop = function( CUVariables, testName ){
    var testData = new Object();
    CUVariables.Refresh.InitializeTestData( CUVariables.AlarmCollector, 
        testData, "Main", testName );
    var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
    CUVariables.Refresh.InitializeSubscription( testData, 
            CUVariables.AlarmThreadHolder.SelectFields,
            alarmThread,
            alarmThread.Subscription,
            alarmThread.EventMonitoredItem );


    CUVariables.Refresh.CallRefresh( CUVariables );
    testData.RefreshTime = new UaDateTime(CUVariables.Refresh.TimeOfRefreshCall);
    
    var counter = 0;
    var maximumCount = 10;
    var found = false;
    testData.TestState = "WaitingForStart";

    while( !found && counter < maximumCount ){
        var eventResult = alarmThread.GetBuffer();
        if ( eventResult.status && eventResult.events.length > 0 ){
            testData.Buffer = eventResult.events;
            CUVariables.Refresh.ProcessEvents( CUVariables.AlarmCollector, testData );
        }

        if ( isDefined( CUVariables.Refresh.RefreshEndEvent ) ){
            found = true;
        }else{
            counter++;
            wait( 100 );
        }
    }

    if ( !found ){
        addError( "Unable to get Start and stop events" );
        stopCurrentUnit();
    }
}


