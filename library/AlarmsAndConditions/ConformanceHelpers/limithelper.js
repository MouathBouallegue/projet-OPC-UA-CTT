/**
 * The Exclusive/NonExclusive limit and level alarm tests have similarities, use this helper to add EventMonitors
 * @param {} args.AlarmType 
 */

include( "./library/AlarmsAndConditions/AlarmUtilities.js" );
include( "./library/AlarmsAndConditions/AlarmThread.js" );
include( "./library/Base/whereClauseCreator.js" );
include( "./library/Utilities/AuditInfrastructure/GetBuffer.js" );
include( "./library/Utilities/AuditInfrastructure/RemoveEntry.js" );

function LimitHelper ( args ) {

    if ( !isDefined( args ) ) { throw ( "LimitHelper must have arguments" ); }
    if ( !isDefined( args.AlarmType ) ) { throw ( "LimitHelper must have AlarmType argument" ); }
    if ( !isDefined( args.AlarmCollector ) ) { throw ( "LimitHelper must have AlarmCollector argument" ); }
    if ( !isDefined( Test ) || !isDefined( Test.Session ) ) { throw ( "LimitHelper must connect before initialization" ); }
    print("LimitHelper Created");

    this.Initialized = false;
    this.Test_002_Initialized = false;
    this.TestLocalStartTime = null;
    this.ExclusiveLimitAlarmType = new UaNodeId( Identifier.ExclusiveLimitAlarmType );
    this.ExclusiveLevelAlarmType = new UaNodeId( Identifier.ExclusiveLevelAlarmType );
    this.ExclusiveDeviationAlarmType = new UaNodeId( Identifier.ExclusiveDeviationAlarmType );
    this.ExclusiveRateOfChangeAlarmType = new UaNodeId( Identifier.ExclusiveRateOfChangeAlarmType );
    this.NonExclusiveLimitAlarmType = new UaNodeId( Identifier.NonExclusiveLimitAlarmType );
    this.NonExclusiveLevelAlarmType = new UaNodeId( Identifier.NonExclusiveLevelAlarmType );
    this.NonExclusiveDeviationAlarmType = new UaNodeId( Identifier.NonExclusiveDeviationAlarmType );
    this.NonExclusiveRateOfChangeAlarmType = new UaNodeId( Identifier.NonExclusiveRateOfChangeAlarmType );
    this.ServerNodeId = new UaNodeId( Identifier.Server );

    this.AlarmType = args.AlarmType;
    this.AlarmTypeString = this.AlarmType.toString();
    this.AlarmThread = null;

    this.AlarmCollector = args.AlarmCollector;
    this.AlarmTester = null;
    this.AlarmUtilities = null;
    this.EventRetriever = null;
    this.EventRemover = null;
    this.SelectFields = null;

    this.InactiveEvent = null;  // This will be the default event for the alarm thread
    this.HighHighEvent = null;  // This will be an extra event for the alarm thread
    this.HighEvent = null;      // This will be an extra event for the alarm thread
    this.LowEvent = null;       // This will be an extra event for the alarm thread
    this.LowLowEvent = null;    // This will be an extra event for the alarm thread

    this.Session = null;

    this.DerivedTypes = null;
    this.MandatoryMap = null;
    this.OptionalMap = null;

    this.ConditionLimits = null;


    this.Initialize = function(){

        print("LimitHelper Initialize Started");

        if ( !this.SupportedAlarmType( this.AlarmType ) ){ throw ( "Invalid requested AlarmType " + args.AlarmType.toString() ); }

        this.Session = isDefined( Test.Session.Session ) ? Test.Session.Session : Test.Session;

        this.AlarmThread = new AlarmThread();
        this.AlarmThread.Start({
            EventNodeId: this.ServerNodeId,
            SelectFields: this.GetSelectFields(),
            WhereClause: this.CreateWhere( "Inactive"),
            Session: this.Session
        });

        if ( !this.AlarmThread.Started ){
            throw( "Unable to start Alarm Thread" );
        }

        this.InactiveEvent = new Object();
        this.InactiveEvent.EventMonitoredItem = this.AlarmThread.EventMonitoredItem;
        this.InactiveEvent.Subscription = this.AlarmThread.Subscription;
        this.InactiveEvent.SubscriptionCreated = this.AlarmThread.SubscriptionCreated;
        this.InactiveEvent.ItemCreated = this.AlarmThread.ItemCreated;

        this.HighHighEvent = this.AlarmThread.AddEventItemExtended( {
            EventNodeId: this.ServerNodeId,
            SelectFields: this.GetSelectFields(),
            WhereClause: this.CreateWhere( "HighHigh"),
        } );

        print( "HighHigh created " + " threadId " + this.AlarmThread.SessionThread.ThreadId + " subscription " + 
            this.HighHighEvent.Subscription.SubscriptionId + " client " + this.HighHighEvent.EventMonitoredItem.ClientHandle );

        this.HighEvent = this.AlarmThread.AddEventItemExtended( {
            EventNodeId: this.ServerNodeId,
            SelectFields: this.GetSelectFields(),
            WhereClause: this.CreateWhere( "High"),
        } );

        print( "High created " + " threadId " + this.AlarmThread.SessionThread.ThreadId + " subscription " + 
            this.HighEvent.Subscription.SubscriptionId + " client " + this.HighEvent.EventMonitoredItem.ClientHandle );
        
        this.LowEvent = this.AlarmThread.AddEventItemExtended( {
            EventNodeId: this.ServerNodeId,
            SelectFields: this.GetSelectFields(),
            WhereClause: this.CreateWhere( "Low"),
        } );

        print( "Low created " + " threadId " + this.AlarmThread.SessionThread.ThreadId + " subscription " + 
            this.LowEvent.Subscription.SubscriptionId + " client " + this.LowEvent.EventMonitoredItem.ClientHandle );

        this.LowLowEvent = this.AlarmThread.AddEventItemExtended( {
            EventNodeId: this.ServerNodeId,
            SelectFields: this.GetSelectFields(),
            WhereClause: this.CreateWhere( "LowLow"),

        } );
        
        print( "LowLow created " + " threadId " + this.AlarmThread.SessionThread.ThreadId + " subscription " + 
            this.LowLowEvent.Subscription.SubscriptionId + " client " + this.LowLowEvent.EventMonitoredItem.ClientHandle );

        this.AlarmThread.StartPublish();
        this.EventRetriever = new GetBufferService( { Session: this.Session } );
        this.EventRemover = new RemoveEntryService( { Session: this.Session } );

        this.GetDerivedTypes();

        print( "LimitHelper AlarmType " + this.AlarmTypeString );
        this.DerivedTypes.forEach( function( type ) {
            print( "LimitHelper Derived Type " + type );
        });        
        
        this.ConditionLimits = new KeyPairCollection();

        this.TestLocalStartTime = UaDateTime.utcNow();
        print("LimitHelper Initialize Completed local time " + this.TestLocalStartTime.toString() );
        this.Initialized = true;
    }

    this.Shutdown = function(){
        if ( this.AlarmThread.ItemCreated ){
            this.AlarmThread.End();
            this.AlarmThread = null;
        }
    }

    this.Set_Test_002_Initialized = function(){
        this.Test_002_Initialized = true;
    }

    this.Get_Test_002_Initialized = function(){
        return this.Test_002_Initialized;
    }

    this.GetEvents = function( type ){
        
        var detailName = type + "Event";
        var detail = this[detailName];
        print("LimitHelper::GetEvents for " + type + " threadId " + this.AlarmThread.SessionThread.ThreadId + " subscription " + detail.Subscription.SubscriptionId + " client " + detail.EventMonitoredItem.ClientHandle );
        return this.EventRetriever.Execute({
            ThreadId: this.AlarmThread.SessionThread.ThreadId,
            SubscriptionId: detail.Subscription.SubscriptionId,
            ClientId: detail.EventMonitoredItem.ClientHandle
        });
    }

    this.RemoveEvents = function( type, events ){

        if ( events.status == true ){
            var eventEntries = [];
            for( var index = 0; index < events.events.length; index++ ){
                var event = events[ index ];
                eventEntries.push( event.EventHandle );
            }

            if ( eventEntries.length > 0 ){
                var detailName = type + "Event";
                var detail = this[detailName];
                this.EventRemover.Execute({
                    ThreadId: this.AlarmThread.SessionThread.ThreadId,
                    SubscriptionId: detail.Subscription.SubscriptionId,
                    ClientId: detail.EventMonitoredItem.ClientHandle,
                    EventEntries: eventEntries
                });
            }
        }
    }

    this.SupportedAlarmType = function ( alarmType ) {
        var supported = false;
        if ( alarmType.equals( this.ExclusiveLimitAlarmType ) ||
            alarmType.equals( this.ExclusiveLevelAlarmType ) ||
            alarmType.equals( this.ExclusiveDeviationAlarmType ) ||
            alarmType.equals( this.ExclusiveRateOfChangeAlarmType ) ||
            alarmType.equals( this.NonExclusiveLimitAlarmType ) ||
            alarmType.equals( this.NonExclusiveLevelAlarmType ) ||
            alarmType.equals( this.NonExclusiveDeviationAlarmType ) ||
            alarmType.equals( this.NonExclusiveRateOfChangeAlarmType ) ){
            supported = true;
        }

        return supported;
    }

    this.IsExclusive = function(){
        var isExclusive = false;
        if ( this.AlarmType.equals( this.ExclusiveLimitAlarmType) ||
            this.AlarmType.equals( this.ExclusiveLevelAlarmType) ||
            this.AlarmType.equals( this.ExclusiveDeviationAlarmType ) ||
            this.AlarmType.equals( this.ExclusiveRateOfChangeAlarmType ) ){
                isExclusive = true;
        }
        return isExclusive;
    }

    this.IsNonExclusive = function (){
        return !this.IsExclusive();
    }

    this.IsDeviation = function(){
        var isDeviation = false;
        if ( this.AlarmType.equals( this.ExclusiveDeviationAlarmType ) ||
            this.AlarmType.equals( this.NonExclusiveDeviationAlarmType ) ){
                isDeviation = true;
        }
        return isDeviation;
    }

    this.IsRateOfChange = function(){
        var isRateOfChange = false;
        if ( this.AlarmType.equals( this.ExclusiveRateOfChangeAlarmType ) ||
            this.AlarmType.equals( this.NonExclusiveRateOfChangeAlarmType ) ){
                isRateOfChange = true;
        }
        return isRateOfChange;
    }


    this.GetSelectFields = function(){
        if ( !isDefined( this.SelectFields ) ){

            var selectFields = new KeyPairCollection();
            var fieldCounter = 0;
            
            selectFields.Set( "EventId", this.CreateSelectField( fieldCounter++, [ "EventId" ] ) );
            selectFields.Set( "EventType", this.CreateSelectField( fieldCounter++, [ "EventType" ]) );
            selectFields.Set( "Time", this.CreateSelectField( fieldCounter++, [ "Time" ]) );
            selectFields.Set( "ActiveState", this.CreateSelectField( fieldCounter++, [ "ActiveState" ]) );
            selectFields.Set( "ActiveState.Id", this.CreateSelectField( fieldCounter++, [ "ActiveState", "Id" ] ) );
            selectFields.Set( "Message", this.CreateSelectField( fieldCounter++, [ "Message" ]) );

            if ( this.IsExclusive( ) ){
                selectFields.Set( "LimitState.CurrentState", this.CreateSelectField( fieldCounter++, [ "LimitState", "CurrentState" ] ) );
                selectFields.Set( "LimitState.CurrentState.Id", this.CreateSelectField( fieldCounter++, [ "LimitState", "CurrentState", "Id" ] ) );
                selectFields.Set( "LimitState.LastTransition", this.CreateSelectField( fieldCounter++, [ "LimitState", "LastTransition" ] ) );
                selectFields.Set( "LimitState.LastTransition.Id", this.CreateSelectField( fieldCounter++, [ "LimitState", "LastTransition", "Id" ] ) );
                selectFields.Set( "LimitState.LastTransition.TransitionTime", this.CreateSelectField( fieldCounter++, [ "LimitState", "LastTransition", "TransitionTime" ] ) );
            }else{
                selectFields.Set( "HighHighState", this.CreateSelectField( fieldCounter++, [ "HighHighState" ] ) );
                selectFields.Set( "HighHighState.Id", this.CreateSelectField( fieldCounter++, [ "HighHighState", "Id" ] ) );
                selectFields.Set( "HighState", this.CreateSelectField( fieldCounter++, [ "HighState" ] ) );
                selectFields.Set( "HighState.Id", this.CreateSelectField( fieldCounter++, [ "HighState", "Id" ] ) );
                selectFields.Set( "LowLowState", this.CreateSelectField( fieldCounter++, [ "LowLowState" ] ) );
                selectFields.Set( "LowLowState.Id", this.CreateSelectField( fieldCounter++, [ "LowLowState", "Id" ] ) );
                selectFields.Set( "LowState", this.CreateSelectField( fieldCounter++, [ "LowState" ] ) );
                selectFields.Set( "LowState.Id", this.CreateSelectField( fieldCounter++, [ "LowState", "Id" ] ) );
            }

            this.SelectFields = selectFields;
        }

        return this.SelectFields;
    }

    this.CreateSelectField = function ( index, id ) {
        var browsePaths = id;
        if ( !isDefined( id.length )){
            browsePaths = [];
            browsePaths.push(id);
        }
        return {
            Index: index,
            Identifier: Identifier.BaseEventType,
            BrowsePaths: browsePaths
        };
    }

    this.CreateWhere = function( type ){

        var creator = new WhereClauseCreatorService();
        
        var whereClause = creator.CreateEmptyWhereClause();
        whereClause.Elements[0] = creator.CreateSingleOperandFilterElement(FilterOperator.And, 1);
        whereClause.Elements[0].FilterOperands[1] = creator.CreateElementOperand(2);

        var desiredState = new UaVariant();
        var stateBrowsePath = null;

        if ( type == "Inactive" ){
            desiredState.setBoolean(false);
            stateBrowsePath = [ "ActiveState", "Id" ];

        }else if ( this.IsExclusive() ){
            desiredState.setNodeId( this.GetExclusiveNodeId( type ) );
            stateBrowsePath = [ "LimitState", "CurrentState", "Id" ];
        }else{
            // Non Exclusive
            desiredState.setBoolean( true );
            stateBrowsePath = [ type + "State", "Id" ];
        }

        var desiredType = new UaVariant();
        desiredType.setNodeId( this.AlarmType );

        whereClause.Elements[1] = creator.CreateTwoOperandFilterElement( FilterOperator.Equals, stateBrowsePath, desiredState );

        var derivedTypes = this.GetDerivedTypes();

        if ( derivedTypes.length > 0 ){
            // Need an InList filter
            var element = new UaContentFilterElement();

            element.FilterOperator = FilterOperator.InList;
            element.FilterOperands = new UaExtensionObjects();

            var operandCounter = 0;
            element.FilterOperands[ operandCounter++ ] = creator.CreateSimpleAttributeOperand( "EventType" );

            var alarmTypeVariant = new UaVariant();
            alarmTypeVariant.setNodeId( this.AlarmType );
            element.FilterOperands[ operandCounter++ ] = creator.CreateLiteralOperand( alarmTypeVariant );

            for ( var index = 0; index < derivedTypes.length; index++ ){
                var nodeId = UaNodeId.fromString( derivedTypes[index] );
                var value = new UaVariant();
                value.setNodeId( nodeId );
                element.FilterOperands[ operandCounter++ ] = creator.CreateLiteralOperand( value );
            }

            whereClause.Elements[2] = element;

        }else{
            // Simple alarm type filter
            whereClause.Elements[2] = creator.CreateTwoOperandFilterElement( FilterOperator.Equals, "EventType", desiredType );
        }

        return whereClause;
    }

    this.GetExclusiveNodeId = function( desiredAlarmState ){
        var state = null;

        switch( desiredAlarmState ){
            case "HighHigh":
                state = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_HighHigh );
                break;
            case "High":
                state = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_High );
                break;
            case "Low":
                state = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_Low );
                break;
            case "LowLow":
                state = new UaNodeId( Identifier.ExclusiveLimitStateMachineType_LowLow );
                break;
            }

        return state;
    }

    this.GetAlarmUtilities = function(){
        if ( !isDefined( this.AlarmUtilities ) ){
            this.AlarmUtilities = new AlarmUtilities( );
        }

        return this.AlarmUtilities;
    }

    this.GetDerivedTypes = function(){
        if ( !isDefined( this.DerivedTypes ) ){
            this.DerivedTypes = this.GetAlarmUtilities().GetDerivedTypes( this.AlarmTypeString );
        }
        return this.DerivedTypes;
    }

    /**
     * Gets all alarm types including any derived types not in the spec.
     * Function is to AddIgnoreSkips so test results will only show these alarm types
     * @returns {string[]} All Alarm types interesting for specified test
     */
    this.GetAlarmTypeAndDerivedTypes = function(){
        
        return this.GetAlarmUtilities().GetAlarmTypeAndDerivedTypes( this.AlarmTypeString );
    }

    this.GetNodeSetUtility = function(){
        return this.GetAlarmUtilities().GetNodeSetUtility();
    }

    this.IsInitialized = function(){
        return this.Initialized;
    }

    this.GetAlarmTester = function(){
        if ( !this.IsInitialized() ){throw("LimitHelper::GetAlarmTester called before Initialize completed");}
        if ( !isDefined( this.AlarmTester ) ){
            this.AlarmTester = this.AlarmCollector.AlarmTester;
        }
        return this.AlarmTester;
    }

    this.GetAlarmTypeObject = function(){
        if ( !this.IsInitialized() ){throw("LimitHelper::GetAlarmTypeObject called before Initialize completed");}
        if ( !isDefined(this.AlarmTypeObject)){
            var alarmTypes = this.GetAlarmTester().GetSupportedAlarmTypes();
            var alarmType = alarmTypes.Get( this.AlarmTypeString );
            if( !isDefined( alarmType)){
                throw("levelhelper::GetAlarmTypeObject unable to find alarm type " + this.AlarmTypeString );
            }
            this.AlarmTypeObject = alarmType;    
        }
        return this.AlarmTypeObject;
    }

    this.GetMandatoryMap = function(){
        if ( !this.IsInitialized()) {throw("LimitHelper::GetMandatoryMap called before Initialize completed");}
        if ( !isDefined( this.MandatoryMap )){
            var mandatory = true;
            this.MandatoryMap = this.GetFieldMap( mandatory );
        }
        return this.MandatoryMap;
    }

    this.GetOptionalMap = function(){
        if ( !this.IsInitialized()) {throw("LimitHelper::GetOptionalMap called before Initialize completed");}
        if ( !isDefined( this.OptionalMap )){
            var mandatory = false;
            this.OptionalMap = this.GetFieldMap( mandatory );
        }
        return this.OptionalMap;
    }

    this.GetFieldMap = function( mandatory ){
        var alarmTypes = this.GetAlarmTester().GetSupportedAlarmTypes();
        var alarmUtilities = this.GetAlarmUtilities();
        var map = alarmUtilities.CreateSelectFields( this.AlarmTypeString, alarmTypes, mandatory );
        map.Iterate( function( key, object ){
            print( mandatory + ":" + key );
        });
        return map;
    }

    this.GetFilterStateName = function( desiredLimit ){

        var stateName = "LimitState.CurrentState.Id";

        if ( this.IsNonExclusive() ){
            stateName = desiredLimit + "State.Id";
        }

        return stateName;
    }

    this.GetAlarmCollector = function(){
        if ( !this.IsInitialized()) {throw("LimitHelper::GetAlarmCollector called before Initialize completed");}
        return this.AlarmCollector();
    }

    this.ShouldTestEvent = function( eventFields, collector ){

        var shouldTest = false;

        var eventType = eventFields[ collector.EventTypeIndex ].toString();
        if ( eventType == this.AlarmTypeString ){
            shouldTest = true;
        }else{
            var derived = this.GetDerivedTypes();
            for ( var index = 0; index < derived.length; index++ ){
                var derivedTypeName = derived[ index ];
                if ( derivedTypeName == eventType ){
                    shouldTest = true;
                    break;
                }
            }
        }
        
        if ( shouldTest ){
            // Ignore anything with a branch id
            if ( collector.IsNonNullNodeId( eventFields, "BranchId" ) ) {
                shouldTest = false;
                print( "ShouldTestEvent ignoring due to BranchId" );
            }
        }

        return shouldTest;
    }

    this.ConditionSupportsLimit = function( conditionIdString, eventFields, limitName ){
        
        return ( this.GetConditionLimitDataType( conditionIdString, eventFields, limitName ) > 0 );
    }

    this.GetConditionLimits = function( conditionIdString, eventFields ){
        if ( !this.ConditionLimits.Contains( conditionIdString ) ){
            print( "Creating Condition Limits for " + conditionIdString );
            var highHighLimit = this.AlarmCollector.GetSelectField( eventFields, "HighHighLimit" );
            var highLimit = this.AlarmCollector.GetSelectField( eventFields, "HighLimit" );
            var lowLimit = this.AlarmCollector.GetSelectField( eventFields, "LowLimit" );
            var lowLowLimit = this.AlarmCollector.GetSelectField( eventFields, "LowLowLimit" );

            this.ConditionLimits.Set( conditionIdString, {
                HighHighLimit: highHighLimit,
                HighLimit: highLimit,
                LowLimit: lowLimit,
                LowLowLimit: lowLowLimit,
            } );
        }

        var limits = this.ConditionLimits.Get( conditionIdString );

        return limits;
    }

    this.GetConditionLimitDataType = function( conditionIdString, eventFields, limitName ){
        
        var dataType = 0;

        var limits = this.GetConditionLimits( conditionIdString, eventFields );

        if ( isDefined( limits ) ){
            if ( isDefined( limits[ limitName ] ) ){
                var dataType = limits[ limitName ].DataType;
            }
        }

        return dataType;
    }

    this.GetConditionLimit = function( conditionIdString, eventFields, limitName ){

        var limit = null;

        var limits = this.GetConditionLimits( conditionIdString, eventFields );

        if ( isDefined( limits ) ){
            if ( isDefined( limits[ limitName ] ) ){
                var limit = limits[ limitName ];
            }
        }

        return limit;
    }

    /**
     * Return the minimum time to wait until two cycles have had the chance to run
     */
    this.GetMinimumRunTime = function () {
        // Run for Two Cycles
        var cycleTime = this.GetAlarmTester().GetCycleTime() * 2;
        var minimumTime = new UaDateTime( this.TestLocalStartTime );
        minimumTime.addSeconds( cycleTime );

        var minimumRunTime = UaDateTime.utcNow().msecsTo( minimumTime );
        if ( minimumRunTime < 1 ) {
            // wait( 0 ) should not break anything
            minimumRunTime = 0;
        }

        return minimumRunTime;
    }

    this.Initialize();
}