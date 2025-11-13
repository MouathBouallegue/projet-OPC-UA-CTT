include( "./library/AlarmsAndConditions/AlarmUtilities.js" )
include( "./library/AlarmsAndConditions/AlarmType.js" )
include( "./library/AlarmsAndConditions/AlarmInstance.js" )
include( "./library/AlarmsAndConditions/AlarmThread.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

/**
 * Alarm tester was meant to be the main function for Alarms and Conditions
 * It is the main entry point for for all model testing of Alarm Types and Instances
 * It is the placeholder for the AlarmUtilities which is used extensively in alarm testing
 * It is the placeholder for the main AlarmThread used in Alarm Testing.
 * It exists as an object for the entirety of Alarm Testing
 */
function AlarmTester () {

    this.AlarmUtilities = null;
    this.AlarmThreadHolder = null;
    this.AlarmType = null;
    this.AlarmInstance = null;
    this.DataItems = null;
    this.DeleteDataAfterCycleSeconds = null;
    this.DefaultCycleTime = 60;
    this.CycleMultiplier = 3;
    this.NormalStateValues = new KeyPairCollection();
    this.DeviceTimeDifferential = null;

    this.FoundConditions = new KeyPairCollection();
    this.InputNodes = new KeyPairCollection();

    this.AlarmTypesWithSetpoints = [
        UaNodeId( Identifier.ExclusiveDeviationAlarmType ).toString(),
        UaNodeId( Identifier.NonExclusiveDeviationAlarmType ).toString()
    ];

    //#region Initialization      

    /**
     * Initialize builds the cache map, retrieves the local cache map, 
     * Retrieves all supported alarm types, and Alarm instanced for each type.
     */
    this.Initialize = function () {

        if ( !isDefined( Test.Alarm ) ) {
            Test.Alarm = new Object();
        }

        this.GetAlarmUtilities();

        var alarmTypes = this.GetAlarmType().GetSupportedAlarmTypes();
        this.GetAlarmInstance().BuildAlarmInstances( alarmTypes );
    }

    /**
     * Retrieve the Alarm Utilities Object
     * @returns {Object}
     */
    this.GetAlarmUtilities = function () {
        if ( !isDefined( this.AlarmUtilities ) ) {
            this.AlarmUtilities = new AlarmUtilities();
        }

        return this.AlarmUtilities;
    }

    /**
     * Retrieve the Alarm Type test Object for testing Alarm Types
     * @returns {Object}
     */
    this.GetAlarmType = function () {
        if ( !isDefined( this.AlarmType ) ) {
            this.AlarmType = new AlarmType( this.GetAlarmUtilities() );
        }

        return this.AlarmType;
    }

    /**
     * Retrieve all Alarm Types
     * @returns {Object}
     */
    this.GetSupportedAlarmTypes = function () {
        return this.GetAlarmType().GetSupportedAlarmTypes();
    }


    /**
     * Retrieve the Alarm Instance test Object for testing Alarm Instances
     */
    this.GetAlarmInstance = function () {
        if ( !isDefined( this.AlarmInstance ) ) {
            this.AlarmInstance = new AlarmInstance( this.GetAlarmUtilities() );
        }

        return this.AlarmInstance;
    }

    //#endregion

    //#region Threading

    // The tester object will provide a simple mechanism for starting and stopping the thread.
    // However it is not designed to provide complete flexibility.  A Conformance unit is expected
    // to deal with the intracacies of working with the thread, and should not use the tester functionality
    // if more complicated scenarios are desired.

    /**
     * @typedef {Object} AlarmThreadHolder
     * @property {KeyPairCollection} SelectFields - a map of event fields for the Event Item
     * @property {UaNodeId} EventItem - the event item for monitoring Events
     * @property {Object} AlarmThread - the AlarmThread object for interacting with the thread
     */

    /**
     * Creates and starts an Alarm Thread.  This thread could be the default created
     * by a conformance unit, or an extra thread for specific scenarios.  As such,
     * it needs to be quite flexible in terms of the args that are used in this function,
     * and functions that this calls.
     * 
     * @param {KeyPairCollection} args.SelectFields - A custom map of select event fields for use by the created thread 
     * @param {KeyPairCollection} args.ExtraFields - A custom map of extra select event fields for use by the created thread 
     * @param {UaNodeId} [EventItem] - A custom event item for the thread, otherwise Server will be used as the event item
     * @param {Session} [Session] - A predefined session for the thread, otherwise the conformance unit session will be used.
     * @param {Object} [Filter] - A predefined filter for the event monitor item, otherwise a default filter.
     * @returns {AlarmThreadHolder}
     */
    this.StartAlarmThread = function ( args ) {
        if ( !isDefined( this.AlarmThreadHolder ) ) {

            this.AlarmThreadHolder = new Object();

            if ( isDefined( args ) && isDefined( args.SelectFields ) ) {
                this.AlarmThreadHolder.SelectFields = args.SelectFields;
            } else {
                this.AlarmThreadHolder.SelectFields = this.CreateAllSelectFields();
            }

            if ( isDefined( args ) && isDefined( args.ExtraFields ) ) {
                args.ExtraFields.Iterate( function ( key, field, args ) {
                    var selectFields = args.SelectFields;
                    field.Index = selectFields.Length();
                    selectFields.Set( key, field );
                }, { SelectFields: this.AlarmThreadHolder.SelectFields } );
            }

            if ( isDefined( args ) && isDefined( args.EventItem ) ) {
                this.AlarmThreadHolder.EventItem = args.EventItem;
            } else {
                this.AlarmThreadHolder.EventItem = new UaNodeId( Identifier.Server );
            }

            this.AlarmThreadHolder.AlarmThread = new AlarmThread();
            var session = null;
            var instanciateHelpers = false;
            var dataItems = null;
            if ( isDefined( args ) && isDefined( args.Session ) ) {
                session = args.Session;
                print( "Start Alarm Thread using session id " + session.SessionId );
            } else {
                if ( isDefined( args ) && isDefined( args.UseUnitSession ) ) {
                    session = isDefined( Test.Session.Session ) ? Test.Session.Session : Test.Session;
                } else {
                    dataItems = this.GetDataItems();
                    instanciateHelpers = true;
                }
            }

            var whereClause = null;
            if ( isDefined( args ) && isDefined( args.WhereClause ) ) {
                whereClause = args.WhereClause;
            }

            var monitoredItems = null;
            if ( isDefined( args ) && isDefined( args.MonitoredItems ) ) {
                monitoredItems = args.MonitoredItems;
            }

            if ( dataItems.Length() > 0 ) {
                if ( !isDefined( monitoredItems ) ) {
                    monitoredItems = [];
                }

                dataItems.Values().forEach( function ( dataItemValue ) {
                    print( "Adding configured data item " + dataItemValue.Item.NodeId.toString() );
                    monitoredItems.push( dataItemValue.Item );
                } );
            }

            this.AlarmThreadHolder.AlarmThread.Start( {
                Session: session,
                EventNodeId: this.AlarmThreadHolder.EventItem,
                SelectFields: this.AlarmThreadHolder.SelectFields,
                InstanciateHelpers: instanciateHelpers,
                WhereClause: whereClause,
                MonitoredItems: monitoredItems
            } );

            this.AlarmThreadHolder.AlarmThread.StartPublish();
        }

        return this.AlarmThreadHolder;
    }

    /**
     * Reads the settings for all data items that need to be monitored by the Alarm Thread
     * @returns Map Items and Values keyed by the node id
     */
    this.GetDataItems = function () {
        if ( !isDefined( this.DataItems ) ) {
            var dataItems = new KeyPairCollection();
            var sources = Settings.ServerTest.AlarmsAndConditions.SupportedConditionTypes;
            for ( var setting in sources ) {
                var values = sources[ setting ];

                values.forEach( function ( nodeIdName ) {
                    if ( !dataItems.Contains( nodeIdName ) ) {
                        var item = MonitoredItem.fromNodeIds( UaNodeId.fromString( nodeIdName ) )[ 0 ];
                        dataItems.Set( nodeIdName, {
                            Item: item,
                            Values: []
                        } );
                        print( "BuildDataItems Setting " + setting + " value " + nodeIdName );
                    }
                } );
            }
            this.DataItems = dataItems;
        }

        return this.DataItems;
    }

    /**
     * Retrieve the maximum time in seconds that alarms and data should be stored.
     * All data and alarms previous to this time should be removed
     * @returns maximum time in seconds that alarms and data should be stored
     */
    this.GetDeleteOldDataTime = function () {
        if ( !isDefined( this.DeleteDataAfterCycleSeconds ) ) {
            var cycleTime = Settings.ServerTest.AlarmsAndConditions.AlarmCycleTime;
            if ( cycleTime <= 0 ) {
                cycleTime = this.DefaultCycleTime;
            }
            this.DeleteDataAfterCycleSeconds = cycleTime * this.CycleMultiplier;
        }

        return this.DeleteDataAfterCycleSeconds;
    }

    /**
     * Retrieve the timestamp of the oldest data to be stored
     * All data and alarms previous to this time should be removed
     * @returns oldest timestamp that alarms and data should be stored
     */
    this.GetOldDataTime = function () {
        var oldDataTime = UaDateTime.utcNow();
        oldDataTime.addSeconds( -( this.GetDeleteOldDataTime() ) );
        return oldDataTime;
    }


    /**
     * Retrieve the configured cycle time in milliseconds
     * @returns the configured cycle time in milliseconds
     */
    this.GetCycleTimeMilliSeconds = function () {
        return this.GetCycleTime() * 1000;
    }


    /**
     * Retrieve the configured cycle time in seconds
     * @returns the configured cycle time in seconds
     */
    this.GetCycleTime = function () {
        var cycleTime = this.DefaultCycleTime;
        var configuredCycleTime = Settings.ServerTest.AlarmsAndConditions.AlarmCycleTime;
        if ( configuredCycleTime > 0 ) {
            cycleTime = configuredCycleTime;
        }
        return cycleTime;
    }


    /**
     * Retrieve the total cycle time in milliseconds,
     * the configured time multiplied by the number of cycles to hold data 
     * @returns total cycle time in milliseconds
     */
    this.GetTotalCycleTimeMilliseconds = function () {
        return this.GetCycleTime() * this.CycleMultiplier * 1000;
    }

    /**
     * Retrieves, and creates if necessary, the Alarm thread holder used extensively by the AlarmCollector and tests
     * @param {object} args 
     * @returns {AlarmThreadHolder}
     */
    this.GetAlarmThreadHolder = function ( args ) {

        if ( !isDefined( Test.Alarm.AlarmThreadHolder ) ) {
            print( "AlarmTester::GetAlarmThreadHolder creating alarm thread" );
            Test.Alarm.AlarmThreadHolder = this.StartAlarmThread( args );
        }

        return Test.Alarm.AlarmThreadHolder;
    }

    /**
     * Stops the Alarm Thread
     */
    this.StopAlarmThread = function () {
        if ( isDefined( this.AlarmThreadHolder ) ) {
            this.AlarmThreadHolder.AlarmThread.End();
            this.AlarmThreadHolder = null;
        }
    }

    /**
     * Retrieves events received by the default event monitor in the alarm thread
     * @param {int} interval - the maximum time this function will wait to get events
     * @returns {UaEventBuffers}
     */
    this.WaitForEvents = function ( interval ) {

        var endTime = UaDateTime.utcNow();
        endTime.addMilliSeconds( interval );

        var scan = true;
        var events = null;

        while ( scan ) {
            if ( UaDateTime.utcNow() > endTime ) {
                scan = false;
            } else {
                var bufferResults = this.AlarmThreadHolder.AlarmThread.GetBuffer();
                if ( bufferResults.status ) {
                    if ( isDefined( bufferResults.events.length ) && bufferResults.events.length > 0 ) {
                        events = bufferResults.events;
                        scan = false;
                    }
                } else {
                    print( "AlarmTester:WaitForEvents Unable to get Events" );
                }
            }
            if ( scan ) {
                wait( 50 );
            }
        }

        var count = 0;
        if ( isDefined( events ) && isDefined( events.length ) ) {
            count = events.length;
        }

        return events;
    }

    /**
     * Removes one or more events from the alarm thread
     * @param {uint[]} events - ids of the events to remove from the alarm thread
     */
    this.RemoveEntry = function ( events ) {
        if ( isDefined( events.length ) ) {
            var eventIds = [];
            for ( var index = 0; index < events.length; index++ ) {
                var event = events[ index ];
                eventIds.push( event.EventHandle );
            }

            this.AlarmThreadHolder.AlarmThread.RemoveEntry( eventIds );
        }
    }

    //#endregion

    //#region FoundConditions

    /**
     * Adds a conditionId to the known map.
     * @param {object} Collector - Alarm Collector and Helper
     * @param {string} ConditionIdString - ConditionId in string form
     * @param {string} EventTypeString - Event Type in string format
     * @param {object} EventFields - Event
     */
    this.AddEvent = function ( args ) {
        var functionName = "AlarmTester::AddEvent";
        if ( !isDefined( args ) ) throw ( functionName + " args not specified." );
        if ( !isDefined( args.Collector ) ) throw ( functionName + " Collector not specified." );
        if ( !isDefined( args.ConditionIdString ) ) throw ( functionName + " ConditionIdString not specified." );
        if ( !isDefined( args.EventTypeString ) ) throw ( functionName + " EventTypeString not specified." );
        if ( !isDefined( args.EventFields ) ) throw ( functionName + " EventFields not specified." );

        // Look up alarm type
        var alarmType = this.GetSupportedAlarmTypes().Get( args.EventTypeString );
        if ( !alarmType ) {
            addError( functionName + " ConditionId " + args.ConditionIdString +
                " Unexpected alarm type " + args.EventTypeString + " not in model" );
            return;
        }

        // Tell the alarm type that there is a configured alarm.
        alarmType.EncounteredAlarm = true;
        if ( args.Collector.IsBranch(  args.EventFields, "BranchId" ) ){
            alarmType.EncounteredAlarmBranch = true;
        }

        if ( this.FoundConditions.Contains( args.ConditionIdString ) ) {
            // No Need to do anymore, it's already been done
            return;
        }

        this.FoundConditions.Set( args.ConditionIdString, new Object() );

        var itemsToCreate = [];
        var setpointIdString = "";

        var condition = this.FoundConditions.Get( args.ConditionIdString );

        // Setpoint?
        var specAlarmTypeId = alarmType.SpecAlarmTypeId;


        for ( var index = 0; index < this.AlarmTypesWithSetpoints.length; index++ ) {
            if ( this.AlarmTypesWithSetpoints[ index ] == specAlarmTypeId ) {
                var setpointNodeVariant = args.Collector.GetSelectField( args.EventFields, "SetpointNode" );
                if ( isDefined( setpointNodeVariant ) ) {
                    var setpointNodeId = setpointNodeVariant.toNodeId();
                    if ( isDefined( setpointNodeId ) && !UaNodeId.IsEmpty( setpointNodeId ) ) {
                        itemsToCreate.push( MonitoredItem.fromNodeIds( setpointNodeId )[ 0 ] );
                        setpointIdString = setpointNodeId.toString();
                    }
                }
                break;
            }
        }

        if ( isDefined( condition.NoneConfigured ) ) {
            // Unable to do anything with this
            return;
        }

        if ( !isDefined( condition.InputNode ) ) {
            var inputNodeId = args.Collector.GetSelectField( args.EventFields, "InputNode" ).toNodeId();

            if ( !isDefined( inputNodeId ) || UaNodeId.IsEmpty( inputNodeId ) ) {

                var configured = this.GetAlarmUtilities().GetAlarmInputNodes( specAlarmTypeId );
                if ( isDefined( configured ) && isDefined( configured.length ) && configured.length > 0 ) {
                    // TODO just take the first one
                    condition.InputNode = configured[ 0 ];

                } else {
                    condition.NoneConfigured = true;
                }
                return;
            }

            var inputNodeIdString = inputNodeId.toString();

            var dataItems = this.GetDataItems();
            var addInputNode = false;
            if ( dataItems.Get( inputNodeIdString ) ) {
                condition.InputNode = inputNodeIdString;
            } else {
                itemsToCreate.push( MonitoredItem.fromNodeIds( inputNodeId )[ 0 ] );
                addInputNode = true;
            }

            if ( itemsToCreate.length > 0 ) {

                var addItemSucceeded = "failed";
                var addItemResult = this.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CreateMonitoredItemsHelper.Execute( {
                    ItemsToCreate: itemsToCreate,
                    TimestampsToReturn: TimestampsToReturn.Both,
                    SubscriptionId: this.AlarmThreadHolder.AlarmThread.Subscription,
                    ThreadId: this.AlarmThreadHolder.AlarmThread.SessionThread.ThreadId
                } );
                var response = this.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CreateMonitoredItemsHelper.Response;
                var deviceTime = response.ResponseHeader.Timestamp;


                if ( addItemResult ) {
                    addItemSucceeded = "succeeded";
                    itemsToCreate.forEach( function ( item ) {
                        dataItems.Set( item.NodeId.toString(), {
                            Item: item,
                            DeviceAddTime: deviceTime,
                            Values: []
                        } );
                    } );
                    if ( addInputNode ) {
                        condition.InputNode = inputNodeIdString;
                    }

                    if ( setpointIdString.length > 0 ) {
                        condition.SetpointNode = setpointIdString;
                    }
                }

                itemsToCreate.forEach( function ( item ) {
                    print( "Add input node " + item.NodeId.toString() + " for conditionId " +
                        args.ConditionIdString + " " + addItemSucceeded + " at device time " + deviceTime.toString());
                } );
            }
        }
    }

    //#endregion

    //#region Alarm Tests

    /**
     * Compares the Alarm type defined by the server model to the nodeset definition
     * @param {string} typeId - type id to compare
     * @param {bool} compareSubTypes
     */
    this.CompareTypeTest = function ( typeId, compareSubTypes ) {
        return this.GetAlarmType().TypeCompare( typeId, compareSubTypes );
    }

    /**
     * Compares the Alarm instances defined by the server model to the nodeset definition
     * @param {string} typeId - type id to compare
     * @returns success or failure
     */
    this.CompareInstanceTest = function ( typeId ) {
        var alarmTypes = this.GetAlarmType().GetSupportedAlarmTypes();
        return this.GetAlarmInstance().InstanceCompare( typeId, alarmTypes );
    }

    //#endregion


    //#region Helpers

    /**
     * Creates select fields for all possible properties
     * @returns {KeyPairCollection}
     */
    this.CreateAllSelectFields = function () {
        return this.GetAlarmUtilities().CreateAllSelectFields(
            this.GetAlarmType().GetSupportedAlarmTypes() );
    }

    /**
     * Determines if a NormalState value has already been retrieved for the
     * specified Node Id
     * @param {string} nodeIdString - node id of the NormalState Variable
     * @returns 
     */
    this.NormalStateExists = function ( nodeIdString ) {
        return this.NormalStateValues.Contains( nodeIdString );
    }

    /**
     * Add a NormalState value to the internal storage
     * @param {string} nodeIdString - node id of the NormalState Variable
     * @param {UaVariant} variant value of the NomalState Variable
     */
    this.AddNormalState = function ( nodeIdString, variant ) {
        this.NormalStateValues.Set( nodeIdString, variant );
    }

    /**
     * Retrieves the NormalState Variant for the specified node Id
     * @param {string} nodeIdString - node id of the NormalState Variable
     * @returns UaVariant of the NormalState value
     */
    this.GetNormalStateVariant = function ( nodeIdString ) {
        var variant = new UaVariant();

        if ( this.NormalStateExists( nodeIdString ) ) {
            variant = this.NormalStateValues.Get( nodeIdString );
        }

        return variant;
    }

    /**
     * Retrieve a SelectField map of all mandatory properties for the specified alarmType
     * @param {string} alarmType - node id of the alarm/event type in string
     * @returns Map of fields keyed by name
     */
    this.GetMandatoryMap = function ( alarmType ) {
        var mandatory = true;
        return this.GetFieldMap( alarmType, mandatory );
    }

    /**
     * Retrieve a SelectField map of all mandatory and optional properties for the specified alarmType
     * @param {string} alarmType - node id of the alarm/event type in string
     * @returns Map of fields keyed by name
     */
    this.GetOptionalMap = function ( alarmType ) {
        var mandatory = false;
        return this.GetFieldMap( alarmType, mandatory );
    }

    /**
     * Retrieve a SelectField map of properties for the specified alarmType
     * @param {string} alarmType - node id of the alarm/event type in string
     * @param {boolean} mandatory - specifies whether to retrieve mandatory or optional properties
     * @returns Map of fields keyed by name
     */
    this.GetFieldMap = function ( alarmType, mandatory ) {
        var alarmTypes = this.GetSupportedAlarmTypes();
        var map = null;

        var existingAlarmType = alarmTypes.Get( alarmType );
        if ( isDefined( existingAlarmType ) ) {
            var specAlarmType = existingAlarmType.SpecAlarmTypeId;
            if ( isDefined( specAlarmType ) ) {
                map = this.GetAlarmUtilities().CreateSelectFields( specAlarmType, alarmTypes, mandatory );
            }
        }

        return map;
    }

    /**
     * Retrieves a local time that can be used in comparison with a server time.
     * Determines the time differential between the local and server time
     * @param {UaDateTime} deviceTime 
     * @returns {UaDateTime} local time based off time differential
     */
    this.GetLocalTimeFromDeviceTime = function(deviceTime){

        if ( !isDefined( this.DeviceTimeDifferential ) ){
            var itemToRead = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) )[0];
            itemToRead.AttributeId = Attribute.NodeClass;
            ReadHelper.Execute({NodesToRead: itemToRead});
            var postReadTime = UaDateTime.utcNow();
            var deviceTime = ReadHelper.Response.ResponseHeader.Timestamp;

            this.DeviceTimeDifferential = deviceTime.msecsTo( postReadTime );

            print("GetLocalTimeFromDeviceTime " + 
            " Device Time " + deviceTime.toString() + 
            " Post Time = " + postReadTime.toString() + 
            " differential = " + this.DeviceTimeDifferential );
        }

        var localTime = new UaDateTime( deviceTime );
        localTime.addMilliSeconds( this.DeviceTimeDifferential );
        return localTime;
    }

    /**
     * Debug Function that determines the enabled state for all instances
     * Not used for tests
     */
    this.CheckEnabledStates = function(){
        var readThis = [];
        var localDictionary = new KeyPairCollection();
        var alarmTypes = this.GetSupportedAlarmTypes();
        alarmTypes.Iterate( function( alarmTypeName, alarmType) { 
            if ( isDefined( alarmType.Instances ) ){
                alarmType.Instances.Iterate( function( conditionIdString, instance ){
                    var alarmNodeId = UaNodeId.fromString( conditionIdString )
                    var browsePath = UaBrowsePath.New( { 
                        StartingNode: alarmNodeId, 
                        RelativePathStrings: [ "EnabledState", "Id" ] } );
                    if ( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [ browsePath ] } ) ){
                        var response = TranslateBrowsePathsToNodeIdsHelper.Response;
                        if ( response.Results.length > 0 ){
                            var result = response.Results[0];
                            if ( result.StatusCode.isGood() ){
                                var targets = result.Targets;
                                var target = targets[ 0 ]; 
                                var nodeId = target.TargetId.NodeId;

                                readThis.push( {
                                    ConditionIdString: conditionIdString,
                                    EnabledIdNode: nodeId,
                                    Instance: instance
                                } );

                                localDictionary.Set(conditionIdString, {
                                    ConditionIdString: conditionIdString,
                                    EnabledIdNode: nodeId,
                                    Instance: instance
                                });
                            }
                        }
                    }
                } );
            }
        } );

        var items = [];
        readThis.forEach( function( pair ){
            var item = MonitoredItem.fromNodeIds( pair.EnabledIdNode )[ 0 ];
            items.push( item );
        });

        var disabledCount = 0;
        if ( items.length > 0 ){
            if ( ReadHelper.Execute({ NodesToRead: items } ) ){
                var readResults = ReadHelper.Response.Results;
                for( var index = 0; index < readResults.length; index++ ){
                    var readResult = readResults[ index ];
                    if ( readResult.StatusCode.isGood() ){
                        var enabled = readResult.Value.toBoolean();
                        readThis[index].Enabled = enabled;
                        print("CheckEnabledStates " + readThis[index].ConditionIdString + " Enabled value is " + readThis[index].Enabled);
                        if ( !enabled ){
                            disabledCount++;
                            var badObject = localDictionary.Get(readThis[index].ConditionIdString);
                            var badInstance = badObject.Instance;
                        }
                    } 
                }
            }
        }
       
    }


    //#endregion


    this.Initialize();
}
