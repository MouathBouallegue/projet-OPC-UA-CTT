
include( "./library/AlarmsAndConditions/AlarmUtilities.js" );
include( "./library/AlarmsAndConditions/AlarmThread.js" );
include( "./library/Base/whereClauseCreator.js" );
include( "./library/Utilities/AuditInfrastructure/GetBuffer.js" );
include( "./library/Utilities/AuditInfrastructure/RemoveEntry.js" );

function FilterTest ( args ) {

    if ( !isDefined( args ) ) { throw ( "FilterTest must have arguments" ); }
    if ( !isDefined( args.TestName ) ) { throw ( "FilterTest must have TestName argument" ); }
    if ( !isDefined( args.FilterToTest ) ) { throw ( "FilterTest must have FilterToTest argument" ); }
    if ( !isDefined( args.LimitHelper ) ) { throw ( "FilterTest must have LimitHelper argument" ); }

    this.TestName = args.TestName;
    this.FilterToTest = args.FilterToTest;
    this.LimitHelper = args.LimitHelper;
    this.AlarmThread = args.LimitHelper.AlarmThread;
    this.AlarmCollector = args.LimitHelper.AlarmCollector;
    this.FilteredEvents = null;
    this.IgnoreEventsBeforeTime = null;
    this.EndTimeTolerance = 2000;
    this.EndTime = null;

    print( "FilterTest Created" );

    this.RunTest = function () {

        var minimumRunTime = this.LimitHelper.GetMinimumRunTime();

        if ( minimumRunTime > 0 ) {
            print( this.TestName +":" + UaDateTime.utcNow().toString() + 
                " waiting " + minimumRunTime + " to retrieve alarms for " + this.FilterToTest );
            wait( minimumRunTime );
        }else{
            print( this.TestName +":" + UaDateTime.utcNow().toString() + " No Waiting required for " + this.FilterToTest );
        }

        var filteredEventMap = this.GetFilteredEventMap();

        this.GetCurrentAlarms();
        var alarms = this.RetrieveAlarms();
        this.UpdateIgnoreTime();

        this.EndTime = UaDateTime.utcNow();
        this.EndTime.addMilliSeconds( -this.EndTimeTolerance );

        var successfullCount = 0;
        var failedCount = 0;
        var ignoreCount = 0;
        var expectedCount = 0;
        var unexpectedCount = 0;

        print( this.TestName + ":" + UaDateTime.utcNow().toString() + " Checking " + alarms.length + " Received Alarms..." );
        for ( var index = 0; index < alarms.length; index++ ) {
            var eventFields = alarms[ index ];
            if ( this.AlarmShouldBeInFilter( eventFields ) ) {
                print( "\tChecking for Alarm that should be in filter" );
                this.PrintAlarm( eventFields, this.AlarmCollector.AlarmThreadHolder.SelectFields );
                expectedCount++;
                var desiredEventId = eventFields[ this.AlarmCollector.EventIdIndex ].toByteString();
                var filteredEvent = filteredEventMap.Get( desiredEventId );
                if ( isDefined( filteredEvent ) ) {
                    successfullCount++;
                    filteredEvent.Confirmed = true;
                } else {
                    print("Time of expected (Failed) alarm " + this.AlarmCollector.GetSelectField(eventFields, "Time").toDateTime().toString() + 
                        " ActiveState " + this.AlarmCollector.GetSelectField(eventFields, "ActiveState").toString());
                    failedCount++;
                }
            }
        }

        print( "End Time " + this.EndTime.toString() );

        var filteredEvents = filteredEventMap.Values();

        print("Checking " + filteredEvents.length + " Filtered Alarms..." );

        for ( var index = 0; index < filteredEvents.length; index++ ) {
            var filteredEvent = filteredEvents[ index ];
            this.PrintAlarm( filteredEvent.EventFields, this.LimitHelper.SelectFields );
            print("\tConfirmed " + filteredEvent.Confirmed );

            if ( filteredEvent.Confirmed == false ) {
                if ( this.CanCompareAlarms( null, filteredEvent.EventFields )){
                    unexpectedCount++;
                }else{
                    ignoreCount++;
                }
            }
        }

        print( this.TestName + " Expected count " + expectedCount + " Successful Count " + successfullCount + 
            " Unexpected count " + unexpectedCount + " Ignore Count " + ignoreCount + " Failed Count " + failedCount );

        var success = true;

        if ( successfullCount != expectedCount ) {
            addError( "Unexpected filtered event count for " + this.FilterToTest + ", Expected " + expectedCount + " Actual " + successfullCount );
            success = false;
        }

        if ( unexpectedCount > 0 ) {
            addError( "Filter for " + this.FilterToTest + " received " + unexpectedCount + " unexpected events" );
            success = false;
        }

        if ( success ){
            if ( expectedCount <= 0 ){
                notImplemented( "Filter for " + this.FilterToTest + " did not receive any alarms" );
            }else{
                addSuccessMessage( "Expected count " + expectedCount + " Successful Count " + successfullCount );
            }
        }

        return success;
    }

    this.GetIgnoreTime = function(){
        // There are two alarm threads in play.  
        // 1.) The AlarmTester thread started by the AlarmCollector
        // 2.) The Conformance Unit AlarmThread created by LimitTester.
        // There is no guarantee that either of these threads are created first.
        // Any alarm before either of these times cannot be compared.
        // Find the most recent time.
        if ( !isDefined( this.IgnoreEventsBeforeTime ) ){
            var alarmTester = this.AlarmCollector.GetAlarmTester();
            var alarmTesterTime = alarmTester.AlarmThreadHolder.AlarmThread.StartTime;
            var limitTesterTime = this.AlarmThread.StartTime;
            var mostRecentTime = alarmTesterTime;
            if ( mostRecentTime.msecsTo( limitTesterTime ) > 0 ){
                mostRecentTime = limitTesterTime;
            }

            print( "GetIgnoreTime AlarmTester StartTime", alarmTesterTime, "LimitTester StartTime", limitTesterTime, "Most Recent", mostRecentTime );

            this.IgnoreEventsBeforeTime = mostRecentTime;
        }

        return this.IgnoreEventsBeforeTime;
    }

    this.UpdateIgnoreTime = function(){
        var currentIgnoreTime = this.GetIgnoreTime();
        // Alarms before this point will be deleted
        var oldDataTime = this.LimitHelper.AlarmTester.GetOldDataTime();
        if ( currentIgnoreTime.msecsTo( oldDataTime ) > 0 ){
            print( "Updating Ignore Events before time from " + currentIgnoreTime.toString() + " to " + oldDataTime.toString() );
            this.IgnoreEventsBeforeTime = oldDataTime;
        }
    }

    this.CanCompareAlarms = function( originalAlarm, filteredAlarm ){

        var canCompare = true;

        var ignoreTime = this.GetIgnoreTime();
        if ( isDefined( originalAlarm )){
            var originalAlarmTime = this.GetTime( originalAlarm, this.AlarmCollector.AlarmThreadHolder.SelectFields );
            if ( originalAlarmTime.msecsTo( ignoreTime ) > 0 ){
                canCompare = false;
            }else if ( isDefined( this.EndTime ) && this.EndTime.msecsTo( originalAlarmTime ) > 0 ){
                canCompare = false;
            }
        }

        if ( canCompare ){
            if ( isDefined( filteredAlarm )){
                var filteredAlarmTime = this.GetTime( filteredAlarm, this.LimitHelper.SelectFields );
                if ( filteredAlarmTime.msecsTo( ignoreTime ) > 0 ){
                    canCompare = false;
                }else if ( isDefined( this.EndTime ) && this.EndTime.msecsTo( filteredAlarmTime ) > 0 ){
                    canCompare = false;
                }
            }
        }


        return canCompare;
    }


    this.GetCurrentAlarms = function () {

        var events = this.AlarmCollector.AlarmTester.WaitForEvents( 100 );
        var alarmCounter = 0;
        if ( isDefined( events ) ) {
            this.AlarmCollector.StoreData();
            for ( var eventIndex = 0; eventIndex < events.length; eventIndex++ ) {
                var eventFields = events[ eventIndex ].EventFieldList.EventFields;

                var eventType = eventFields[ this.AlarmCollector.EventTypeIndex ].toNodeId();

                var testTypeObject = this.AlarmCollector.TestTypeResults.Get( eventType );

                if ( isDefined( testTypeObject ) ) {
                    this.AlarmCollector.Store( eventFields );
                    alarmCounter++;
                }
            }
        }
    }

    this.RetrieveAlarms = function () {

        var alarms = [];

        var supportedAlarmTypes = this.LimitHelper.GetAlarmTypeAndDerivedTypes();
        var filterTestObject = this;

        for ( var index = 0; index < supportedAlarmTypes.length; index++ ) {
            var supportedAlarmType = supportedAlarmTypes[ index ];
            var conditionIdsMap = this.AlarmCollector.GetAlarmTypeStoreMap( supportedAlarmType );
            if ( isDefined( conditionIdsMap ) ) {
                conditionIdsMap.Iterate( function ( conditionIdString, branchMap ) {
                    if ( isDefined( branchMap ) ) {
                        branchMap.Iterate( function ( branchId, eventMap ) {
                            var branchNodeId = UaNodeId.fromString( branchId );
                            if ( !isDefined( branchId ) || UaNodeId.IsEmpty( branchNodeId ) ) {
                                eventMap.Values().forEach( function ( event ) {
                                    alarms.push( event );
                                } );
                            }
                        } );
                    }
                } );
            }
        }

        return alarms;
    }

    this.GetTime = function ( eventFields, selectFields ) {
        var dateTime = null;
        var time = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "Time", selectFields );
        if ( isDefined( time ) && this.AlarmCollector.ValidateDataType( time, BuiltInType.DateTime ) ) {
            dateTime = time.toDateTime();
        } else {
            addError( "FilterTest::GetTime Unable to get Time Property" );
        }

        return dateTime;
    }

    this.FilterTypeSupported = function ( conditionIdString ) {
        var limits = this.LimitHelper.GetConditionLimits( conditionIdString );
        var filterType = this.FilterToTest + "Limit";
        if ( isDefined( limits ) && isDefined( limits[ filterType ] ) ) {
            var limit
        }
        // what
    }

    this.GetFilteredEventMap = function () {
        var map = new KeyPairCollection();

        var filteredEvents = this.LimitHelper.GetEvents( this.FilterToTest );
        if ( filteredEvents.status != true ) {
            throw ( "Unable to retrieve filtered events for " + this.FilterToTest );
        }

        print( this.TestName + " GetFilteredEventMap retrieved " + filteredEvents.events.length + " events" );

        for ( var index = 0; index < filteredEvents.events.length; index++ ) {
            var eventFields = filteredEvents.events[ index ].EventFieldList.EventFields;
            var eventId = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "EventId", this.LimitHelper.GetSelectFields() );
            map.Set( eventId, { EventFields: eventFields, Confirmed: false } );
        }

        return map;
    }


    this.AlarmShouldBeInFilter = function ( eventFields ) {
        // Event needs to be after limithelper start time
        // Event needs to be active
        // Condition Id needs to support this type of alarm
        // Event condition needs to be active (different for Exclusive/Non-Exclusive)

        var required = false;

        var conditionId = this.AlarmCollector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( this.LimitHelper.ConditionSupportsLimit( conditionIdString, eventFields, this.FilterToTest + "Limit" ) ) {
            if ( this.AlarmCollector.IsActive( eventFields ) ) {
                if ( this.CanCompareAlarms( eventFields, null ) ){
                    var stateName = this.LimitHelper.GetFilterStateName( this.FilterToTest );
                    var limitStateVariant = this.AlarmCollector.GetSelectField( eventFields, stateName );
                    if ( limitStateVariant.DataType > 0 ) {
                        if ( this.LimitHelper.IsExclusive() ) {
                            var limitState = limitStateVariant.toNodeId();
                            if ( isDefined( limitState ) && !UaNodeId.IsEmpty( limitState ) ) {
                                var desiredNodeId = this.LimitHelper.GetExclusiveNodeId( this.FilterToTest );
                                if ( limitState.equals( desiredNodeId ) ) {
                                    required = true;
                                }
                            }
                        } else {
                            if ( limitStateVariant.toBoolean() == true ) {
                                required = true;
                            }
                        }
                    }
                }
            }
        }

        return required;
    }

    this.PrintAlarm = function( eventFields, selectMap ){
        var conditionIdString = this.AlarmCollector.GetConditionId( eventFields ).toString();
        
        var eventId = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "EventId", selectMap ).toString();
        var eventType = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "EventType", selectMap ).toString();
        var activeState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "ActiveState", selectMap ).toString();
        var message = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "Message", selectMap ).toString();
        var time = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "Time", selectMap ).toString();
        print( conditionIdString + ":" + eventId + " " + eventType + " " + activeState );
        print( "\t" + time + " " + message );
        if ( this.LimitHelper.IsExclusive() ){
            var limitState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "LimitState.CurrentState", selectMap ).toString();
            print( "\tExclusive limit state " + limitState );
        }else{
            var highHighState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "HighHighState", selectMap ).toString();
            var highState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "HighState", selectMap ).toString();
            var lowState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "LowState", selectMap ).toString();
            var lowLowState = this.AlarmCollector.GetSelectFieldFromMap( eventFields, "LowLowState", selectMap ).toString();
            print( "\tNonExclusive limit HighHigh [" + highHighState + "] High [" + highState + "] Low [" + lowState + "] LowLow [" + lowLowState + "]" );
        }
    }
}
