include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmTester.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Base/whereClauseCreator.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;


// This will be a challenge.

CUVariables.Suppress = new Object();
CUVariables.Suppress.ConditionType = new UaNodeId( Identifier.ConditionType );
CUVariables.Suppress.ConditionTypeString = CUVariables.Suppress.ConditionType.toString();
CUVariables.Suppress.AcknowledgeableConditionType = new UaNodeId( Identifier.AcknowledgeableConditionType );
CUVariables.Suppress.AcknowledgeableConditionTypeString = CUVariables.Suppress.AcknowledgeableConditionType.toString();
CUVariables.Suppress.ShelvingStateUnshelved = new UaNodeId( Identifier.ShelvedStateMachineType_Unshelved );



CUVariables.Suppress.IsAlarmCondition = function( eventFields, collector ){
    var canRunAlarmCondition = false;
    var eventType = eventFields[ collector.EventTypeIndex ];
    var alarmEventType = CUVariables.AlarmTypes.Get( eventType.toString() );
    if ( isDefined( alarmEventType ) ) {
        var knownAlarmType = alarmEventType.SpecAlarmTypeId;
        if ( CUVariables.Suppress.ConditionTypeString != knownAlarmType &&
            CUVariables.Suppress.AcknowledgeableConditionTypeString != knownAlarmType ) {
            canRunAlarmCondition = true;
            print( "Allowing " + knownAlarmType );
        }
    }
    return canRunAlarmCondition;
}

CUVariables.Suppress.IsSuppressedOrShelved = function( eventFields, testCase, collector, conditionId, testName ){
    var suppressedOrShelved = false;
    var valid = false;
    var suppressedOrShelvedVariant = collector.GetSelectField( eventFields, "SuppressedOrShelved" );
    if ( collector.ValidateDataType( suppressedOrShelvedVariant, BuiltInType.Boolean ) ){
        suppressedOrShelved = suppressedOrShelvedVariant.toBoolean();
        valid = true;
    }else{
        collector.AddMessage( testCase, collector.Categories.Error,
            conditionId.toString() + " Unable to get mandatory SuppressedOrShelved event field " );
        testCase.TestsFailed++;
        collector.TestCompleted( conditionId, testName );
    }
    
    return {
        Valid: valid,
        Value: suppressedOrShelved
    }
}

CUVariables.Suppress.IsSuppressed = function( eventFields, collector ){
    var suppressed = false;
    var valid = false;
    var suppressedStateVariant = collector.GetSelectField( eventFields, "SuppressedState.Id" );
    if ( collector.ValidateDataType( suppressedStateVariant, BuiltInType.Boolean ) ){
        suppressed = suppressedStateVariant.toBoolean();
        valid = true;
    }

    return {
        Valid: valid,
        Value: suppressed
    };
}

/**
 * Should Ack or Confirm be done
 * @param {boolean} activeState - is the alarm active
 * @param {UaVariant} variant - the eventfield.  Could be null 
 * @param {Object} collector - AlarmCollector
 */
CUVariables.Suppress.ShouldAction = function( activeState, variant, collector ){
    
    var shouldAction = false;
    if ( activeState ){
        if ( collector.ValidateDataType( variant, BuiltInType.Boolean ) ){
            shouldAction = !variant.toBoolean();
        }
    }

    return shouldAction;
}

CUVariables.Suppress.ShouldAck = function( activeState, eventFields, collector ){
    var ackedState = collector.GetSelectField( eventFields, "AckedState.Id" );
    return CUVariables.Suppress.ShouldAction( activeState, ackedState, collector );
}

CUVariables.Suppress.ShouldConfirm = function( activeState, eventFields, collector ){
    var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" );
    return CUVariables.Suppress.ShouldAction( activeState, confirmedState, collector );
}

CUVariables.Suppress.CreateSelectField = function ( index, id ) {
    return {
        Index: index,
        Identifier: Identifier.BaseEventType,
        BrowsePaths: id
    };
}

CUVariables.Suppress.CreateWhere = function ( surpressedValue ) {
    var surpressedOrShelved = new UaVariant;
    surpressedOrShelved.setBoolean( surpressedValue );

    var whereClause = CUVariables.Suppress.WhereClauseCreator.CreateEmptyWhereClause();
    whereClause.Elements[ 0 ] = CUVariables.Suppress.WhereClauseCreator.CreateTwoOperandFilterElement(
        FilterOperator.Equals, "SuppressedOrShelved", surpressedOrShelved );

    return whereClause;
}

CUVariables.Suppress.CreateSuppressEventMonitor = function( findSuppressed ){

    var alarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
    CUVariables.Suppress.SelectFields = new KeyPairCollection();
    CUVariables.Suppress.SelectFields.Set( "EventId", CUVariables.Suppress.CreateSelectField( 0, [ "EventId" ] ) );
    CUVariables.Suppress.SelectFields.Set( "EventType", CUVariables.Suppress.CreateSelectField( 1, [ "EventType" ] ) );
    CUVariables.Suppress.SelectFields.Set( "SuppressedOrShelved", CUVariables.Suppress.CreateSelectField( 2, [ "SuppressedOrShelved" ] ) );
    CUVariables.Suppress.SelectFields.Set( "SuppressedState", CUVariables.Suppress.CreateSelectField( 3, [ "SuppressedState" ] ) );
    CUVariables.Suppress.SelectFields.Set( "OutOfServiceState", CUVariables.Suppress.CreateSelectField( 4, [ "OutOfServiceState" ] ) );
    CUVariables.Suppress.SelectFields.Set( "ShelvingState.CurrentState", CUVariables.Suppress.CreateSelectField( 5, [ "ShelvingState", "CurrentState" ] ) );
    CUVariables.Suppress.WhereClauseCreator = new WhereClauseCreatorService();
    var whereClause = CUVariables.Suppress.CreateWhere( findSuppressed );

    var alarmDetails = alarmThread.AddEventItemExtended( {
        Subscription: alarmThread.Subscription,
        EventNodeId: new UaNodeId( Identifier.Server ),
        SelectFields: CUVariables.Suppress.SelectFields,
        WhereClause: whereClause
    } );

    if ( !alarmDetails.ItemCreated ) {
        addError( "Unable to create event monitor for SuppressedOrShelved = " + findSuppressed );
        stopCurrentUnit();
    }

    return alarmDetails;
}

CUVariables.Suppress.ShutdownEventMonitor = function( alarmDetails ){
    if ( alarmDetails.ItemCreated ){
        CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.DeleteMonitoredItemsHelper.Execute({
            ItemsToDelete: alarmDetails.EventMonitoredItem,
            SubscriptionId: CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId
        } );

        CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.ClearThreadData( {
            ThreadId:CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.ThreadId,
            SubscriptionId: CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId,
            ClearEvents: true,
            ClientId:alarmDetails.EventMonitoredItem.ClientHandle
        } );
    }
}

include( "./maintree/Alarms and Conditions/A and C Suppression/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Suppression/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Suppression/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Suppression/Test Cases/Test_004.js" );

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
    print( "Creating alarm collector" );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
    if ( isDefined( CUVariables.AlarmCollector ) ) {
        print( "Initialize, found CUVariables.AlarmCollector" );
        if ( isDefined( CUVariables.AlarmCollector.AlarmThreadHolder ) ) {
            print( "Initialize, found CUVariables.AlarmCollector.AlarmThreadHolder" );
        }
    }

    CUVariables.PrintResults = [ CUVariables.AlarmCollector.Categories.Error ];
}


