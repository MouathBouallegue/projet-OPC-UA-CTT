include( "./library/Base/safeInvoke.js" );
include("./library/Information/ObjectModelHelper.js");

function AggregateHelperService() {

    //#region Definitions    
    /*
    
    Structures Used
    
    RequestEntries = 
    {
        StartEntry: A Request Entry that handles the start of data
        EndEntry: A Request Entry that handles the end of data
        BadDataEntry: A Request Entry that has bad data in the middle of the sample.
    }
    
    RequestEntry = 
    {
        Request: raw request,
        RawResults: raw results,
        RequestType: Inform the request what type it is, Start End or BadData
        EarliestTime: Earliest time in sample,
        LatestTime: Latest time in sample,
    
        StartRequestTime: First time to request data for multiple node requests.  
                        For StartEntry, this can be equal to Earliest time in sample.
                        For EndEntry, this should be twenty values from the end.
        EndRequestTime: End time to request data for multiple node requests.  
                        For StartEntry, this should be 100 before the end. 
                        For EndEntry, it can be equal to LatestTime.
    
        RawCacheId : Raw Cache Id, 
    
        Node: Array of information pertaining to a specific node in the Request Entry            
    }
    
    Node = 
    {
        Index
        Name
        FirstValueInHistory
        LastValueInHistory
        StartRequestTime
        EndRequestTime
        BadDataIndexes[]
        ConfiguredBadDataTime
        FoundContiguousBadData
        ContiguousBadData  StartIndex/EndIndex
        ConsecutiveGoodValuesStartIndex used by test 006.  Search data and find the first two consecutive data values that have good status.
                                                            Save the first index.
    };
    
    Test.AggregateTestData.RawDataCache.Cache   // Cache of requestEntries.
    Test.AggregateTestData.RawDataCache.Cache[index].StartEntry   // Start Entry for desired node id(s).
    Test.AggregateTestData.RawDataCache.Cache[index].EndEntry   // End Entry for desired node id(s).
    Test.AggregateTestData.RawDataCache.Cache[index].BadDataEntry   // Bad Entry for desired node id(s).
    
    Test.AggregateTestData.RawDataCache.ItemMap   // Map Node Id to Cached requestEntries.
    
    Test.AggregateTestData.SupportedAggregates // Aggregates supported by the server under test
    
    */

    //#endregion

    //#region Constants/Enumerations    

    const LONGER_TIME_DIFFERENTIAL = 10000;
    const SHORTER_TIME_DIFFERENTIAL = 1000;
    const FIND_SETTING_STRING = "/Server Test/NodeIds/Static/HA Profile/Aggregates/"
    const START_OF_BAD_DATA_STRING = "StartOfBadData"

    // This assumes there are at least 120 values.  What if there are only 19?  Then the whole thing falls apart.
    const START_END_OFFSET = 20
    const TYPICAL_QUERY_COUNT = 100 + START_END_OFFSET;
    const MORE_QUERY_COUNT = TYPICAL_QUERY_COUNT * 3;

    const hasProperty = new UaNodeId( Identifier.HasProperty );
    const hasComponent = new UaNodeId( Identifier.HasComponent );
    const hasHistoricalConfiguration = new UaNodeId( Identifier.HasHistoricalConfiguration );
    const hasTypeDefinition = new UaNodeId( Identifier.HasTypeDefinition );
    const historicalDataConfiguration = new UaNodeId( Identifier.HistoricalDataConfigurationType );
    const aggregateDataConfiguration = new UaNodeId( Identifier.AggregateConfigurationType );

    this.RequestEntryDefinition = {
        StartEntry: "StartEntry",
        EndEntry: "EndEntry",
        BadDataEntry: "BadDataEntry"
    }

    this.AggregateTimeDefinition = {
        StartBeforeEnd: "StartBeforeEnd",
        EndBeforeStart: "EndBeforeStart",
        StartEqualsEnd: "StartEqualsEnd",
        StartAndEndBeforeData: "StartAndEndBeforeData",
        StartAndEndAfterData: "StartAndEndAfterData",
        StartingBoundNotFound: "StartingBoundNotFound",
        StartingBoundBad: "StartingBoundBad",
        StartingBoundUncertain: "StartingBoundUncertain",
        EndingBoundNotFound: "EndingBoundNotFound",
        NoDataInRange: "NoDataInRange"
    }

    this.AggregateProcessIntervalDefinition = {
        IntervalZero: "IntervalZero",
        IntervalOne: "IntervalOne",
        IntervalConfigured: "IntervalConfigured",
        IntervalTenIntervals: "IntervalTenIntervals",
        IntervalNoData: "IntervalNoData",
        NoDataInRange: "NoDataInRange"
    }

    this.AggregateRequestDefinition = {
        StartRequest: "StartRequest",
        EndRequest: "EndRequest",
        BadOrStartRequest: "BadOrStartRequest",
        BadOrEndRequest: "BadOrEndRequest",
        BadDataStartRequest: "BadDataStartRequest",
        BadDataEndRequest: "BadDataEndRequest"
    }

    this.AggregateBoundingDefinition = {
        All: "All",
        None: "None",
        Bounding: "Bounding",
        Simple: "Simple",
        Interpolated: "Interpolated"
    }

    this.AggregateValueIndexDefinition = {
        First: "First",
        Last: "Last"
    }

    this.AggregateStatusDefinition = {
        IsGood: "IsGood",
        IsBad: "IsBad",
        IsUncertain: "IsUncertain"
    }

    this.AggregateBoundingType = {
        None: "None",
        Simple: "Simple",
        Interpolated: "Interpolated"
    }

    this.AggregateDataType = {
        Numeric: "Numeric",
        Boolean: "Boolean",
        NonNumeric: "NonNumeric"
    }

    //#endregion

    //#region Variables


    /**
     * @typedef {object} ConfiguredHistoricalAccessVariables
     * @param {object} MonitoredItem - Readable item for the Historical Access variable
     * @param {string} NodeIdString - NodeId of the Configured Historical Access Variable
     * @param {object} ModelObject - Model Object of the Historical Access variable
     * @param {bool} Historical - Does the configured variable support Historical requests
     * @param {KeyPairCollection} Configurations - All HA Configurations supported by this Historical Access variable
     * @param {bool} ValidConfiguration - Does the configured variable have a valid Aggregate Configuration
     * @param {string} ConfigurationNodeId - NodeId as string of the default AggregateConfiguration.
     * @param {AggregateConfiguration} AggregateConfiguration - Javascript object with the actual configuration parameters
     */

    this.ConfiguredItems = null;

    // Aggregate Configurations stored as KeyPairCollection under Test.AggregateConfigurations

    /**
     * @typedef {object} AggregateConfiguration
     * @param {byte} PercentDataGood - PercentDataGood
     * @param {byte} PercentDataBad - PercentDataBad
     * @param {bool} TreatUncertainAsBad - TreatUncertainAsBad
     * @param {bool} UseSlopedExtrapolation - UseSlopedExtrapolation
     * @param {bool} Stepped - Stepped Interpolation
     */

    /**
     * @typedef {object} AggregateConfigurationObject
     * @param {byte} NodeId - NodeId of the AggregateConfiguration
     * @param {string} Name - BrowseName of the AggregateConfiguration
     * @param {object} ModelObject - Model Object of the AggregateConfiguration
     * @param {AggregateConfiguration} AggregateConfiguration - Javascript object with the actual configuration parameters
     */

    this.Debug = false;

    //#endregion

    //#region Initialization

    this.Initialize = function ( aggregateName ) {

        print( "Starting Aggregate Conformance Unit " + aggregateName );

        var CUVariables = new Object();

        CUVariables.AggregateName = aggregateName;
        CUVariables.Items = this.GetItems( aggregateName );

        if ( !isDefined( CUVariables.Items.length ) || CUVariables.Items.length === 0 ) {
            addSkipped( "No History items configured for Aggregate testing. Aborting Testing. Check settings." );
            stopCurrentUnit();
        }
        else {
            if ( !Test.Connect() ) {
                addError( "Unable to connect to Server. Aborting tests." );
                stopCurrentUnit();
            }
            else {
                var supportedAggregates = this.GetSupportedAggregates();
                if ( !supportedAggregates.Get( aggregateName ) ) {
                    addWarning( "Server does not support aggregate " + aggregateName );
                    stopCurrentUnit();
                }

                CUVariables.Debug = gServerCapabilities.Debug;
                CUVariables.MaxNodes = this.GetMaxNodesPerHistoryReadData();

                if ( !isDefined( Test.AggregateTestData ) || !isDefined( Test.AggregateTestData.RawDataCache ) ) {
                    this.CreateRawDataCache( CUVariables );
                    if ( CUVariables.Debug ) {
                        this.printCachedValues();
                    }
                }
            }
        }

        return CUVariables;
    }

    this.GetItems = function ( aggregateName ) {
        var items = [];

        // Does this aggregate support nonNumerics?
        var types = [ "Integer", "Float", "Double" ];
        
        if ( this.AddBooleanType( aggregateName ) ){
            types.push( "Boolean" );
        }

        if ( this.AggregateSupportsNonNumericAndDiscrete( aggregateName ) ) {
            types.push( "NonNumeric" );
        }

        var numbers = [ "One", "Two" ];

        // Get all the items
        for ( var typeIndex = 0; typeIndex < types.length; typeIndex++ ) {
            for ( var index = 0; index < numbers.length; index++ ) {
                var item = MonitoredItem.fromSettings( "/Server Test/NodeIds/Static/HA Profile/Aggregates/" +
                    types[ typeIndex ] + numbers[ index ] );

                if ( item.length > 0 ) {
                    items.push( item[ 0 ] );
                }
            }
        }

        var configuredItems = this.BuildAggregateConfiguration( items );
        var usableItems = [];

        var configuredItemsMap = new KeyPairCollection();
        configuredItems.forEach(function(configuredItem){
            configuredItemsMap.Set( configuredItem.NodeIdString, configuredItem);

            if ( isDefined( configuredItem.Historical ) && configuredItem.Historical == true ){
                if ( !isDefined( configuredItem.ValidConfiguration ) || configuredItem.ValidConfiguration == true ){
                    usableItems.push( configuredItem.MonitoredItem );
                }
            }
        });

        this.ConfiguredItems = configuredItemsMap;

        return usableItems;        
    }

    this.BuildAggregateConfiguration = function( items ){

        var objectModelHelper = new ObjectModelHelper();


        var configuredItems = [];

        items.forEach( function( item ) {
            var nodeIdString = item.NodeId.toString();
            var modelItem = objectModelHelper.GetObject( nodeIdString );

            var configuredItem = {
                MonitoredItem: item,
                NodeIdString: nodeIdString,
                ModelObject: modelItem,
                Historical: false,
                ValidConfiguration: null,
                Configurations: null,
                ConfigurationNodeId: null,
                AggregateConfiguration: null
            };

            configuredItems.push( configuredItem );

            if ( isDefined( modelItem ) ){
                // Get the attributes, and check accesstype
                var attributes = modelItem.AttributeValues;
                if ( isDefined( attributes ) ){
                    var accessLevel = attributes.getAttributeValue( Attribute.AccessLevel );
                    if ( isDefined( accessLevel ) ){
                        var accessLevelValue = accessLevel.toByte();
                        if ( isDefined( accessLevelValue ) ){
                            if ( accessLevelValue | AccessLevel.HistoryRead == AccessLevel.HistoryRead ){
                                configuredItem.Historical = true;
                            }else{
                                addError( "Configured aggregate item " + nodeIdString + " is not configured for History Reads");    
                            }
                        }else{
                            addError( "Unable to get AccessLevel Value for configured aggregate item " + nodeIdString );    
                        }
                    }else{
                        addError( "Unable to get AccessLevel for configured aggregate item " + nodeIdString );    
                    }
                }else{
                    addError( "Unable to get attributes for configured aggregate item " + nodeIdString );
                }

            }else{
                addError( "Unable to find information about configured aggregate item " + nodeIdString );
            }
        });

        configuredItems.forEach( function( configuredItem ){
            // Previous attempt says that I can add to the object.
            var configurations = new KeyPairCollection();
            for ( var index = 0; index < configuredItem.ModelObject.ReferenceDescriptions.length; index++ ) {
                var description = configuredItem.ModelObject.ReferenceDescriptions[ index ];
                if ( description.IsForward ) {
                    if ( description.ReferenceTypeId.equals( hasHistoricalConfiguration ) ) {
                        var subConfigNodeId = description.NodeId.NodeId.toString();
                        var subConfigObject = objectModelHelper.GetObject( subConfigNodeId );
                        if ( isDefined( subConfigObject ) ){
                             configurations.Set( subConfigNodeId, subConfigObject );
                        }else{
                            addError( "Unable to find potential HA Configuration object " + subConfigNodeId );
                        }
                    }
                } else {
                    if ( description.ReferenceTypeId.equals( hasProperty ) ) {
                        var parentConfigNodeId = description.NodeId.NodeId.toString();
                        var parentConfigObject = objectModelHelper.GetObject( parentConfigNodeId );
                        if ( isDefined( parentConfigObject ) ){
                             configurations.Set( parentConfigNodeId, parentConfigObject );
                        }else{
                            addError( "Unable to find potential HA Configuration object " + parentConfigNodeId );
                        }
                    }
                }
            }

            if ( configurations.Length() > 0 ) {
                configuredItem.Configurations = configurations;
            }else{
                addError( nodeIdString + " does not have any HA Configuration" );
                configuredItem.ValidConfiguration = false;
            }
        } )

        return configuredItems;
    }

    this.TranslateConfiguration = function ( objectModelHelper, config ) {
        var configuration = null;

        if ( !isDefined( Test.AggregateConfigurations ) ){
            Test.AggregateConfigurations = new KeyPairCollection();
        }

        if ( isDefined( config.NodeId ) ){
            configuration = Test.AggregateConfigurations.Get( config.NodeId.toString() );
            if ( !isDefined( configuration ) ){

                // Do the work
                var browseName = "";
                if ( isDefined( config.AttributeValues ) ) {
                    var browseNameVariant = config.AttributeValues.getAttributeValue( Attribute.BrowseName );
                    if ( isDefined( browseNameVariant ) ) {
                        var qualifiedName = browseNameVariant.toQualifiedName();
                        if ( isDefined( qualifiedName ) ) {
                            browseName = qualifiedName.Name;
                        }
                    }
                }

                configuration = {
                    NodeIdString: config.NodeId.toString(),
                    Name: browseName,
                    ModelObject: config,
                    AggregateConfiguration: null,
                    Valid: false
                };

                var success = false;
                var aggregateConfig = null;
                var stepped = null;
                var referenceDescriptions = config.ReferenceDescriptions;
                for ( var index = 0; index < referenceDescriptions.length; index++ ) {
                    var referenceDescription = referenceDescriptions[ index ];
                    if ( referenceDescription.IsForward ) {
                        if ( referenceDescription.ReferenceTypeId.equals( hasComponent ) ) {
                            if ( !isDefined( aggregateConfig ) ) {
    
                                var potential = objectModelHelper.GetObject( referenceDescription.NodeId.NodeId.toString() );
    
                                if ( isDefined( potential ) ) {
                                    var potentialReferenceDescriptions = potential.ReferenceDescriptions;
                                    for ( var potentialIndex = 0; potentialIndex < potentialReferenceDescriptions.length; potentialIndex++ ) {
                                        var potentialReferenceDescription = potentialReferenceDescriptions[ potentialIndex ];
                                        if ( potentialReferenceDescription.IsForward ) {
                                            if ( potentialReferenceDescription.ReferenceTypeId.equals( hasTypeDefinition ) ) {
                                                if ( potentialReferenceDescription.NodeId.NodeId.equals(
                                                    aggregateDataConfiguration ) ) {
                                                    aggregateConfig = potential;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if ( referenceDescription.ReferenceTypeId.equals( hasProperty ) ) {
                            if ( !isDefined( stepped ) ) {
                                if ( referenceDescription.BrowseName.Name == "Stepped" ) {
                                    var potential = objectModelHelper.GetObject( referenceDescription.NodeId.NodeId.toString() );
    
                                    if ( isDefined( potential ) ) {
                                        stepped = potential;
                                    }
                                }
                            }
                        }
                    }
                    if ( isDefined( aggregateConfig ) && isDefined( stepped ) ) {
                        break;
                    }
                }
    
                if ( isDefined( aggregateConfig ) && isDefined( stepped ) ) {
    
                    // Need to read the values
                    var nodeIdValueMap = new KeyPairCollection();
    
                    var steppedMonitoredItem = MonitoredItem.fromNodeIds( stepped.NodeId )[ 0 ];
                    nodeIdValueMap.Set( "Stepped", steppedMonitoredItem );
    
                    var translated = new Object();
                    var success = true;
    
                    var descriptions = aggregateConfig.ReferenceDescriptions;
                    for ( var index = 0; index < descriptions.length; index++ ) {
                        var referenceDescription = descriptions[ index ];
                        if ( referenceDescription.IsForward ) {
                            if ( referenceDescription.ReferenceTypeId.equals( hasProperty ) ) {
                                var monitoredItem = MonitoredItem.fromNodeIds( referenceDescription.NodeId.NodeId )[ 0 ];
                                nodeIdValueMap.Set( referenceDescription.BrowseName.Name, monitoredItem );
                            }
                        }
                    }
    
                    if ( ReadHelper.Execute( { NodesToRead: nodeIdValueMap.Values() } ) ) {
                        nodeIdValueMap.Iterate( function ( property, monitoredItem ) {
                            if ( monitoredItem.Value.StatusCode.isGood() ) {
                                if ( property == "PercentDataBad" ) {
                                    translated.PercentDataBad = monitoredItem.Value.Value.toByte();
                                } else if ( property == "PercentDataGood" ) {
                                    translated.PercentDataGood = monitoredItem.Value.Value.toByte();
                                } else if ( property == "TreatUncertainAsBad" ) {
                                    translated.TreatUncertainAsBad = monitoredItem.Value.Value.toBoolean();
                                } else if ( property == "UseSlopedExtrapolation" ) {
                                    translated.UseSlopedExtrapolation = monitoredItem.Value.Value.toBoolean();
                                } else if ( property == "Stepped" ) {
                                    translated.Stepped = monitoredItem.Value.Value.toBoolean();
                                }
                            }
                        } );
    
                        if ( isDefined( translated.PercentDataBad ) &&
                            isDefined( translated.PercentDataGood ) &&
                            isDefined( translated.TreatUncertainAsBad ) &&
                            isDefined( translated.UseSlopedExtrapolation ) &&
                            isDefined( translated.Stepped ) ) {
                                configuration.Valid = true;
                                configuration.AggregateConfiguration = translated;
                                success = true;
                        } else {
                            addError( "Unexpected error translating Aggregate Configuration" );
                        }
                    } else {
                        addError( "Unable to read HA configuration parameters" );
                    }
                } else {
                    addError( "Unable to find mandatory component" );
                }

                Test.AggregateConfigurations.Set( configuration.NodeIdString, configuration );
            }

            translated = Test.AggregateConfigurations.Get( config.NodeId.toString() );
        }

        return configuration;
    }

    this.AddBooleanType = function( aggregateName ){
        var add = true;
        if ( aggregateName == "Average" ){
            add = false;
        }
        return add;
    }

    this.GetNonNumericItems = function () {
        var items = [];
        var numbers = [ "One", "Two" ];

        for ( var index = 0; index < numbers.length; index++ ) {
            var item = MonitoredItem.fromSettings( "/Server Test/NodeIds/Static/HA Profile/Aggregates/NonNumeric" +
                numbers[ index ] );

            if ( item.length > 0 ) {
                items.push( item[ 0 ] );
            }
        }

        return items;
    }

    this.GetMaxNodesPerHistoryReadData = function () {
        var maxNodes = 1;
        if ( isDefined( gServerCapabilities ) &&
            isDefined( gServerCapabilities.OperationLimits ) &&
            isDefined( gServerCapabilities.OperationLimits.MaxNodesPerHistoryReadData ) ) {
            maxNodes = gServerCapabilities.OperationLimits.MaxNodesPerHistoryReadData;
        }
        return maxNodes;
    }

    this.CreateRawDataCache = function ( variables ) {

        if ( !isDefined( Test.AggregateTestData.RawDataCache ) ) {
            // Do the raw Data Request(s), and store the results
            // This does't work for subscriptions, only history

            Test.AggregateTestData.RawDataCache = new Object();

            Test.AggregateTestData.RawDataCache.Cache = [];
            // Item Map will map each Item Node id to the requestEntry stored in the cache.
            Test.AggregateTestData.RawDataCache.ItemMap = new KeyPairCollection();

            var startTime = new UaDateTime();
            startTime.addMilliSeconds( 1 );
            var endTime = UaDateTime.utcNow();

            var keepGoing = true;
            var nodesQueried = 0;

            while ( keepGoing ) {

                var numberOfItemsToQuery = this.GetNumberOfItemsToQuery( variables, nodesQueried );

                var startQueryIndex = nodesQueried;
                var nodesToQuery = [];
                var nodeIndexesInRequest = [];

                for ( var index = 0; index < numberOfItemsToQuery; index++ ) {
                    var variablesIndex = index + startQueryIndex;
                    nodesToQuery.push( variables.Items[ variablesIndex ] );
                    nodeIndexesInRequest.push( variablesIndex );
                }

                // Make a copy of the items
                var readItems = MonitoredItem.Clone( nodesToQuery );

                var requestEntries = this.CreateRequestEntries( variables, readItems,
                    nodeIndexesInRequest, startTime, endTime );

                this.UpdateVariables( variables, requestEntries, nodesQueried );

                Test.AggregateTestData.RawDataCache.Cache.push( requestEntries );

                for ( var index = 0; index < numberOfItemsToQuery; index++ ) {
                    var variablesIndex = index + startQueryIndex;
                    var nodeIdString = variables.Items[ variablesIndex ].NodeId.toString();
                    Test.AggregateTestData.RawDataCache.ItemMap.Set( nodeIdString, requestEntries );
                }

                nodesQueried += numberOfItemsToQuery;

                if ( nodesQueried == variables.Items.length ) {
                    keepGoing = false;
                }
            }
        }
    }

    this.GetBadStartTime = function ( item ) {
        // Make a query twice the size of the configured processingInterval.
        // Then look for the first bad data.
        // If no bad data is found, then search the raw data - which will probably take longer.
        // If there is no processing interval, use a default of one minute.

        if ( item.BadDataExists ) {
            var requestEntry = Test.AggregateTestData.RawDataCache.ItemMap.Get( lookup );

            if ( isDefined( requestEntry ) ) {
                var processingInterval = this.GetProcessingInterval( 0,
                    this.AggregateProcessIntervalDefinition.IntervalConfigured );

                if ( processingInterval <= 0 ) {
                    processingInterval = 30000;
                }

                var readItems = this.CopyItems( item );

                var startTime = new UaDateTime( item.InitialBadDataTimestamp );
                startTime.addMilliSeconds( -processingInterval );
                var endTime = new UaDateTime( item.InitialBadDataTimestamp );
                endTime.addMilliSeconds( processingInterval );

                var historyReadParameters = {
                    NodesToRead: readItems,
                    TimestampsToReturn: TimestampsToReturn.Source,
                    ReleaseContinuationPoints: false,
                    HistoryReadDetails: UaReadRawModifiedDetails.New(
                        {
                            IsReadModified: false,
                            StartTime: startTime,
                            EndTime: endTime,
                            NumValuesPerNode: 200,
                            ReturnBounds: false
                        } )
                };

                var result = ExecuteAggregateQueryReadHelper.Execute( { Request: historyReadParameters, Cache: true } );

                if ( !Assert.True( result.status, "Unable to obtain history values for bad data. Please check settings." ) ) {
                    stopCurrentUnit();
                }

            }
        }
    }

    this.GetNumberOfItemsToQuery = function ( variables, nodesQueried ) {
        var numberOfItemsToQuery = variables.Items.length - nodesQueried;

        if ( numberOfItemsToQuery > variables.MaxNodes ) {
            numberOfItemsToQuery = variables.MaxNodes;
        }
        return numberOfItemsToQuery;
    }

    this.CreateRequestEntries = function ( variables, readItems, nodeIndexesInRequest, startTime, endTime ) {

        var requestEntries = new Object();

        requestEntries.StartEntry = this.RawDataQuery( variables, readItems, nodeIndexesInRequest, startTime, endTime );
        requestEntries.StartEntry.RequestType = this.RequestEntryDefinition.StartEntry;
        this.PopulateRequestTimes( requestEntries.StartEntry );


        // Now do the bad Entry.
        requestEntries.EndEntry = this.GetEndData( variables, readItems, nodeIndexesInRequest, startTime, endTime );
        if ( isDefined( requestEntries.EndEntry ) ) {
            requestEntries.EndEntry.RequestType = this.RequestEntryDefinition.EndEntry;
            this.PopulateRequestTimes( requestEntries.EndEntry );
        } else {
            addError( "End Data not found" );
            stopCurrentUnit();
        }

        // Now do the bad Entry.
        requestEntries.BadDataEntry = this.GetBadData( variables, readItems, nodeIndexesInRequest );
        if ( isDefined( requestEntries.BadDataEntry ) ) {
            requestEntries.BadDataEntry.RequestType = this.RequestEntryDefinition.BadDataEntry;
            this.PopulateRequestTimes( requestEntries.BadDataEntry );
        }

        return requestEntries;
    }

    this.GetEndData = function ( variables, readItems, nodeIndexesInRequest, startTime, endTime ) {

        var requestEntry = null;

        var reverseEntry = this.RawDataQuery( variables, readItems, nodeIndexesInRequest, endTime, startTime );

        if ( isDefined( reverseEntry ) && isDefined( reverseEntry.EarliestTime ) ) {

            var keepGoing = true;
            var valuesToRequest = MORE_QUERY_COUNT;

            while ( keepGoing ) {
                var potentialEndEntry = this.RawDataQuery( variables, readItems, nodeIndexesInRequest,
                    reverseEntry.EarliestTime, UaDateTime.utcNow(), valuesToRequest );

                // Now walk through the results, and see if any data contains the maximum.
                // If so, then double the items to request and start again.
                var maxTotalCount = 0;

                for ( var index = 0; index < potentialEndEntry.RawResults.length; index++ ) {
                    var historyData = potentialEndEntry.RawResults[ index ].HistoryData.toHistoryData();
                    if ( historyData ) {
                        if ( historyData.DataValues.length > maxTotalCount ) {
                            maxTotalCount = historyData.DataValues.length;
                        }
                    } else {
                        addLog( "No Raw Data" );
                        stopCurrentUnit();
                    }
                }

                if ( maxTotalCount >= valuesToRequest ) {
                    valuesToRequest = valuesToRequest + MORE_QUERY_COUNT;
                    print( "End Data not found - requesting " + valuesToRequest + " values" );
                } else {
                    print( "End Data found " + maxTotalCount + " values found as maximum" );
                    keepGoing = false;
                    requestEntry = potentialEndEntry;
                }
            }
        }

        return requestEntry;
    }

    this.GetBadData = function ( variables, readItems, nodeIndexesInRequest ) {
        // Algorithm
        // For each item, get the bad data time, if one is configured.
        // What to if there is not one configured?  Ignore the test?  Search everything?
        // With start time, query from that time to now for 100 values
        // Find bad data, then look for contiguous bad data until good data is found.
        // Then do another query from that point to now for 100 values.  This will provide the proper end data.
        // Then reverse the query from start time to beginning of time for 100 values.
        // Then query from the start time of the second query to the end of the first query.
        // Then validate the actual bad data times.  Ideally, there is good, bad, then good
        // if an array of bad data indexes are stored, then we would have a start bad data, and an end bad data.
        // Hopefully (bad assumption) there is good data at the beginning and the end of the sample
        // Otherwise a new algorithm is necessary.  But start with this.

        var performFinalQuery = false;
        var endOfTime = UaDateTime.utcNow();
        var startTime = UaDateTime.utcNow();
        var beginningOfTime = new UaDateTime();
        var latestTime = new UaDateTime();

        // Store this to add to the Nodes in the request entry
        var configuredBadDataStartTimes = [];

        for ( var itemIndex = 0; itemIndex < readItems.length; itemIndex++ ) {

            var item = readItems[ itemIndex ];

            var configuredTime = this.GetStartBadDataTime( item );

            configuredBadDataStartTimes.push( configuredTime );

            if ( configuredTime > beginningOfTime ) {

                var startRequestEntry = this.RawDataQuery( variables, item, nodeIndexesInRequest[ itemIndex ], configuredTime, endOfTime );

                var times = this.GetBadDataTimes( startRequestEntry );

                if ( isDefined( times ) ) {

                    var afterBadDataEntry = this.RawDataQuery( variables, item, nodeIndexesInRequest[ itemIndex ], times.EndBadDataTime, endOfTime );

                    var reverseRequestEntry = this.RawDataQuery( variables, item, nodeIndexesInRequest[ itemIndex ], configuredTime, beginningOfTime );

                    if ( isDefined( afterBadDataEntry ) && isDefined( afterBadDataEntry.LatestTime ) &&
                        isDefined( reverseRequestEntry ) && isDefined( reverseRequestEntry.EarliestTime ) ) {

                        if ( reverseRequestEntry.EarliestTime < startTime ) {
                            startTime = reverseRequestEntry.EarliestTime;
                        }
                        if ( afterBadDataEntry.LatestTime > latestTime ) {
                            latestTime = afterBadDataEntry.LatestTime;
                        }

                        performFinalQuery = true;

                    } else {
                        addWarning( "Unable to determine bad data timespan for item " + item.NodeSetting );
                    }
                } else {
                    addWarning( "Unable to determine bad data times for item " + item.NodeSetting );
                }

            } else {
                addWarning( "Bad Data time configured for item " + item.NodeSetting );
            }
        }

        if ( performFinalQuery ) {

            var badDataRequestEntry = this.RawDataQuery( variables, readItems, nodeIndexesInRequest,
                startTime, latestTime, MORE_QUERY_COUNT );

            if ( isDefined( badDataRequestEntry ) &&
                isDefined( badDataRequestEntry.EarliestTime ) &&
                isDefined( badDataRequestEntry.LatestTime ) &&
                isDefined( badDataRequestEntry.Nodes ) &&
                isDefined( badDataRequestEntry.Nodes.length ) ) {

                for ( var index = 0; index < badDataRequestEntry.Nodes.length; index++ ) {
                    badDataRequestEntry.Nodes[ index ].ConfiguredBadDataTime = configuredBadDataStartTimes[ index ];
                }

                if ( this.GetBadIndexes( badDataRequestEntry ) ) {
                    return badDataRequestEntry;
                } else {
                    addWarning( "No bad Data found" );
                }
            } else {
                addError( "Unable to retrieve bad data for item" + item.NodeSetting );
            }
        }
    }

    this.GetBadDataTimes = function ( requestEntry ) {
        var foundStartOfBadData = false;
        var foundEndOfBadData = false;

        var startTime = null;
        var endTime = null;

        var historyData = requestEntry.RawResults[ 0 ].HistoryData.toHistoryData();
        if ( isDefined( historyData ) ) {

            var results = historyData.DataValues;

            for ( var resultIndex = 0; resultIndex < results.length; resultIndex++ ) {
                var result = results[ resultIndex ];

                var status = result.StatusCode.isGood();

                if ( status ) {
                    if ( foundStartOfBadData && !foundEndOfBadData ) {
                        foundEndOfBadData = true;
                        // Done
                        break;
                    }
                } else {
                    if ( !foundStartOfBadData ) {
                        foundStartOfBadData = true;
                        startTime = result.SourceTimestamp;
                    }
                    endTime = result.SourceTimestamp;
                }
            }
        }

        if ( foundStartOfBadData && foundEndOfBadData ) {
            return {
                StartBadDataTime: startTime,
                EndBadDataTime: endTime
            };
        }
    }

    this.GetBadIndexes = function ( requestEntry ) {

        var allBadIndexes = [];
        var foundBadData = false;

        for ( var itemIndex = 0; itemIndex < requestEntry.RawResults.length; itemIndex++ ) {
            var node = requestEntry.Nodes[ itemIndex ];
            var itemBadIndexes = [];

            var historyData = requestEntry.RawResults[ itemIndex ].HistoryData.toHistoryData();

            if ( isDefined( historyData ) && isDefined( historyData.DataValues ) ) {
                for ( var valueIndex = 0; valueIndex < historyData.DataValues.length; valueIndex++ ) {
                    if ( !historyData.DataValues[ valueIndex ].StatusCode.isGood() ) {
                        itemBadIndexes.push( valueIndex );
                        foundBadData = true;
                    }
                }
            }
            node.BadDataIndexes = itemBadIndexes;
            this.GetContiguousBadIndexes( requestEntry, itemIndex );
            // TODO delete when node confirmed
            allBadIndexes.push( itemBadIndexes );
        }

        // TODO delete when node confirmed
        if ( foundBadData ) {
            requestEntry.BadIndexes = allBadIndexes;
        }

        return foundBadData;
    }

    this.GetContiguousBadIndexes = function ( requestEntry, nodeIndex ) {
        // There should be a contiguous block of bad data somewhere
        // It could be that there is only one index, in which case
        // It will not be possible to do the bad data and uncertain tests
        // Find the first and last indexes of the bad block of data.

        var node = null;

        if ( isDefined( requestEntry ) &&
            isDefined( requestEntry.Nodes ) &&
            isDefined( requestEntry.Nodes.length ) &&
            nodeIndex < requestEntry.Nodes.length ) {

            node = requestEntry.Nodes[ nodeIndex ];
        }

        var calculate = false;
        if ( !isDefined( node.FoundContiguousBadData ) ) {
            calculate = true;
        }

        if ( calculate ) {

            if ( isDefined( node.ConfiguredBadDataTime ) &&
                isDefined( node.BadDataIndexes ) &&
                isDefined( node.BadDataIndexes.length ) &&
                node.BadDataIndexes.length > 0 ) {

                var contiguousBlocks = [];
                var firstValue = -1;
                var lastValue = -1;

                for ( var index = 0; index < node.BadDataIndexes.length; index++ ) {
                    var currentValue = node.BadDataIndexes[ index ];

                    if ( firstValue >= 0 ) {
                        var expectedNextValue = lastValue + 1;
                        if ( currentValue == expectedNextValue ) {
                            // Contiguous
                            lastValue = currentValue;
                        } else {
                            // End of Contiguous data
                            if ( firstValue != lastValue ) {
                                var firstAndLast = [];
                                firstAndLast.push( firstValue );
                                firstAndLast.push( lastValue );
                                contiguousBlocks.push( firstAndLast );
                            }
                            firstValue = currentValue;
                            lastValue = currentValue;
                        }
                    } else {
                        firstValue = currentValue;
                        lastValue = firstValue;
                    }
                }

                // Last ones
                if ( firstValue >= 0 && lastValue >= 0 && firstValue != lastValue ) {
                    var firstAndLast = [];
                    firstAndLast.push( firstValue );
                    firstAndLast.push( lastValue );
                    contiguousBlocks.push( firstAndLast );
                }

                var longestLength = -1;
                var timeToConfiguredTime = Infinity;
                var closestToConfiguredTime = -1;

                for ( var index = 0; index < contiguousBlocks.length; index++ ) {
                    // TODO confirm - this looks for the longest contiguous
                    // But I think I want the closest to the configured.
                    var pair = contiguousBlocks[ index ];
                    // var difference = pair[1] - pair[0];
                    // if ( difference >= longestLength ){
                    //     longestLength = difference;

                    // Find out how close the start index is to the configured start time.

                    // check only for testing purposes
                    // There is no way we could be here without data
                    var historyData = requestEntry.RawResults[ nodeIndex ].HistoryData.toHistoryData();
                    var valueTimeStamp = historyData.DataValues[ pair[ 0 ] ].SourceTimestamp;
                    // There must be a configured bad data time
                    var difference = Math.abs( node.ConfiguredBadDataTime.msecsTo( valueTimeStamp ) );
                    if ( difference < timeToConfiguredTime ) {
                        timeToConfiguredTime = difference;
                        closestToConfiguredTime = index;
                    }
                    // }
                }

                // check only for testing purposes
                if ( closestToConfiguredTime >= 0 ) {
                    node.FoundContiguousBadData = true;
                    node.ContiguousBadData = new Object();
                    node.ContiguousBadData.StartIndex = contiguousBlocks[ closestToConfiguredTime ][ 0 ];
                    node.ContiguousBadData.EndIndex = contiguousBlocks[ closestToConfiguredTime ][ 1 ];
                } else {
                    node.FoundContiguousBadData = false;
                }
            } else {
                node.FoundContiguousBadData = false;
            }
        }

        var contiguous = null;

        if ( node.FoundContiguousBadData === true ) {
            contiguous = node.ContiguousBadData;
        }

        return contiguous;
    }

    this.GetStartBadDataTime = function ( item ) {
        var beginningOfTime = new UaDateTime();
        var badDataTime = new UaDateTime();
        var variableName = item.NodeSetting.substring( FIND_SETTING_STRING.length );
        var settingName = FIND_SETTING_STRING + START_OF_BAD_DATA_STRING + variableName;
        var settingVariant = readSetting( settingName );
        var setting = settingVariant.toString();
        if ( isDefined( setting ) && isDefined( setting.length ) && setting.length > 0 ) {
            badDataTime = UaDateTime.fromString( setting );
            if ( badDataTime == beginningOfTime ) {
                addWarning( "Start of bad data configured improperly for " + settingName );
            }
        } else {
            addWarning( "No start of bad data configured for item " + item.NodeSetting );
        }

        return badDataTime;
    }

    this.RawDataQuery = function ( variables, readItems, nodeIndexesInRequest, startTime, endTime, count ) {

        var success = true;

        var valueCount = TYPICAL_QUERY_COUNT;
        if ( isDefined( count ) && count > 0 ) {
            valueCount = count;
        }

        var timeFlowsBackwards = false;

        if ( endTime < startTime ) {
            timeFlowsBackwards = true;
        }

        var historyReadObject = new HistoryReadService( { Session: Test.Session.Session } );
        var items = this.CopyItems( readItems );

        print( "HAAggregateHelper::RawDataQuery Item length " + items.length +
            " startTime " + startTime.toString() +
            " endTime " + endTime.toString() +
            " timeFlowsBackwards " + timeFlowsBackwards.toString() +
            " valueCount " + valueCount.toString() );

        if ( historyReadObject.Execute( {
            NodesToRead: items,
            HistoryReadDetails: UaReadRawModifiedDetails.New(
                {
                    IsReadModified: false,
                    StartTime: startTime,
                    EndTime: endTime,
                    NumValuesPerNode: valueCount,
                    ReturnBounds: false
                } ),
            ReleaseContinuationPoints: false,
            SuppressMessaging: false,
            SuppressWarnings: false,
            SuppressErrors: false,
            Debug: variables.Debug,
            ClearServerContinuationPoints: true
        } ) ) {

            // make a unique copy of the request
            var request = historyReadObject.Request;
            // make a unique copy of the response
            var originalResults = historyReadObject.Response.Results;
            var rawResults = new UaHistoryReadResults( originalResults.length );

            // Set up information to save about a node for the request entry
            var nodes = [];

            for ( var index = 0; index < originalResults.length; index++ ) {

                var nodeIdString = request.NodesToRead[ index ].NodeId.toString();

                var node = new Object();
                node.Index = nodeIndexesInRequest[ index ];
                node.Name = nodeIdString;
                nodes.push( node );

                var itemResults = new UaHistoryReadResult( originalResults[ index ] );
                rawResults[ index ] = itemResults;

                var historyData = itemResults.HistoryData.toHistoryData();

                if ( isDefined( historyData ) &&
                    isDefined( historyData.DataValues ) &&
                    isDefined( historyData.DataValues.length ) &&
                    historyData.DataValues.length > 0 ) {
                    // There is no guarantee that history data will exist, for example the configured node id doesn't exist
                    //items[index].Value = historyData.DataValues;
                    var lastIndex = historyData.DataValues.length - 1;

                    // Status Message
                    print( "Raw Request for NodeId " + nodeIdString +
                        " has " + historyData.DataValues.length + " raw values." );

                    if ( timeFlowsBackwards ) {
                        node.FirstValueInHistory = historyData.DataValues[ lastIndex ];
                        node.LastValueInHistory = historyData.DataValues[ 0 ];
                    } else {
                        node.FirstValueInHistory = historyData.DataValues[ 0 ];
                        node.LastValueInHistory = historyData.DataValues[ lastIndex ];
                    }
                } else {
                    addError( "Unable to obtain earliest history values for NodeId " +
                        nodeIdString + ", verify node exists in server" );
                        success = false;
                        continue;
                    }
            }

            if ( success ){
                var requestEntry = {
                    Request: request,
                    RawResults: rawResults,
                    Nodes: nodes,
                    EarliestTime: null,
                    LatestTime: null,
                    RawCacheId: -1,
                };

                this.CalculateFirstLast( requestEntry );

                return requestEntry;
            }

        } else {
            addError( "Unable to obtain earliest history values." );
        }
    }

    this.CalculateFirstLast = function ( requestEntry ) {

        var startTime = UaDateTime.utcNow();
        var latestTime = new UaDateTime();

        for ( var index = 0; index < requestEntry.Nodes.length; index++ ) {

            var itemStartTime = requestEntry.Nodes[ index ].FirstValueInHistory.SourceTimestamp;
            var itemLastTime = requestEntry.Nodes[ index ].LastValueInHistory.SourceTimestamp;

            if ( itemStartTime < startTime ) {
                startTime = itemStartTime;
            }
            if ( itemLastTime > latestTime ) {
                latestTime = itemLastTime;
            }
        }

        requestEntry.EarliestTime = startTime;
        requestEntry.LatestTime = latestTime;
    }

    this.UpdateVariables = function ( variables, requestEntries, nodesQueried ) {
        // do some initial analysis of the data to help with tests in this CU.
        // record the first & last date in history for each item, and store that value within the item in property FirstValueInHistory.

        for ( var index = 0; index < requestEntries.StartEntry.Request.NodesToRead.length; index++ ) {
            var variablesIndex = index + nodesQueried;
            variables.Items[ variablesIndex ].FirstValueInHistory = requestEntries.StartEntry.Nodes[ index ].FirstValueInHistory;
            variables.Items[ variablesIndex ].LastValueInHistory = requestEntries.EndEntry.Nodes[ index ].LastValueInHistory;
            print( "Items[" + variablesIndex + "].FirstDateInHistory=" +
                variables.Items[ variablesIndex ].FirstValueInHistory.SourceTimestamp + "; LastDateInHistory=" +
                variables.Items[ variablesIndex ].LastValueInHistory.SourceTimestamp );

        }
    }

    //#endregion

    //#region Test Functionality

    this.AggregateQuery = function ( aggregateRequest, requestEntry, stepped ) {

        var result = null;

        if ( isDefined( Test.AggregateTestData.RawDataCache ) ) {

            var request = UaHistoryReadRequest.New( aggregateRequest );

            if ( requestEntry.RawCacheId < 0 ) {
                print( "Performing Aggregate Query with provided raw data" );
                result = ExecuteAggregateQueryReadResultsHelper.Execute( {
                    RawRequest: requestEntry.Request,
                    RawResults: requestEntry.RawResults,
                    AggregateRequest: request,
                    Stepped: stepped,
                    Cache: true
                } );

                if ( result.status === true ) {
                    requestEntry.RawCacheId = result.rawDataId;
                }
            } else {
                print( "Performing Aggregate Query with Cached Data" );
                result = ExecuteAggregateQueryCachedHelper.Execute( {
                    RawDataId: requestEntry.RawCacheId,
                    AggregateRequest: request,
                    Stepped: stepped
                } );
            }

            if ( result.status !== true && result.statuscode.StatusCode != StatusCode.BadInvalidArgument ) {
                addError( "Unable to perform Aggregate Calculation. Aborting tests." );
                stopCurrentUnit();
            }
        } else {
            addError( "No raw history data available.  Unable to perform Aggregate Calculation. Aborting tests." );
            stopCurrentUnit();
        }

        return result;
    }

    this.PrintRequest = function ( request ) {

        print( "Aggregate Request: " );
        print( "  Nodes and Aggregates" );
        for ( var index = 0; index < request.NodesToRead.length; index++ ) {
            print( "Index [" + index + "] Node " + request.NodesToRead[ index ].NodeId.toString() +
                " Aggregate " + request.HistoryReadDetails.AggregateTypes[ index ].toString() );
        }

        print( "  HistoryReadDetails" );
        print( "    StartTime " + request.HistoryReadDetails.StartTime.toString() );
        print( "    EndTime   " + request.HistoryReadDetails.EndTime.toString() );
        print( "    ProcessingInterval " + request.HistoryReadDetails.ProcessingInterval );
        print( "    Configuration" );
        print( "      UseServerCapabilitiesDefaults " + request.HistoryReadDetails.AggregateConfiguration.UseServerCapabilitiesDefaults );
        print( "      TreatUncertainAsBad " + request.HistoryReadDetails.AggregateConfiguration.TreatUncertainAsBad );
        print( "      PercentDataGood " + request.HistoryReadDetails.AggregateConfiguration.PercentDataGood );
        print( "      PercentDataBad " + request.HistoryReadDetails.AggregateConfiguration.PercentDataBad );
        print( "      UseSlopedExtrapolation " + request.HistoryReadDetails.AggregateConfiguration.UseSlopedExtrapolation );

        print( "  TimeStampsToReturn " + request.TimestampsToReturn );
    }

    this.PerformAggregateCheck = function ( aggregateRequest, requestEntry, stepped, addErrors ) {
        // This does both the server call, and the CTT call, and compares the results
        var result = new Object();
        result.status = false;
        result.actualStatus = false;
        result.expectedStatus = false;

        var serverReadRequest = this.CreateProcessedDetailsRequest( aggregateRequest );
        var cttReadRequest = this.CreateProcessedDetailsRequest( aggregateRequest );

        var serverResult = ExecuteAggregateQueryReadHelper.Execute( {
            Request: serverReadRequest,
            Cache: false
        }
        );

        if ( Assert.True( serverResult.status, "HistoryRead for read processed data Failed" ) ) {
            result.actualStatus = true;
            result.actualResults = serverResult.results;

            var queryResult = this.AggregateQuery( cttReadRequest, requestEntry, stepped );

            result.expectedResults = queryResult.results;
            result.expectedStatus = true;
            result.statusCode = queryResult.statusCode;

            var printResults = true;
            result.status = this.CompareValues( result, printResults );

            if ( result.status !== true ) {
                if ( addErrors ) {
                    addError( "Query did not result in identical readings." );
                }

                if ( !printResults ) {
                    printResults = true;
                    this.CompareValues( result, printResults );
                }
            }
        }

        return result;
    }

    this.PerformSingleNodeTest = function ( variables, processingIntervalDefinition, timeDefinition,
        configurationMask, requestDefinition, addErrorCheck ) {

        var addErrors = true;
        if ( isDefined( addErrorCheck ) && addErrorCheck == false ) {
            addErrors = false;
        }

        var result = new Object;
        result.status = false;
        result.aggregateResults = [];

        if ( !isDefined( Test.AggregateTestData ) ||
            !isDefined( Test.AggregateTestData.RawDataCache ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.Cache ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.Cache.length ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.ItemMap ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.ItemMap.Length ) ) {
            addLog( "Raw Data Cache Unavailable. Aborting" );
            stopCurrentUnit();
            return result;
        }

        // Iterate through all items to do the aggregate check

        var aggregates = this.GetSupportedAggregates();

        var aggregate = aggregates.Get( variables.AggregateName );

        if ( aggregate == null ) {
            addError( "Aggregate " + variables.AggregateName + " not supported by server" );
            stopCurrentUnit();
            return result;
        }

        var status = true;

        if ( variables.Debug ) {
            print( "Running Single Node Test for aggregate " + aggregate.Name );
        }

        for ( var itemIndex = 0; itemIndex < variables.Items.length; itemIndex++ ) {

            var item = this.CopyItem( variables.Items[ itemIndex ] );
            var itemName = item.NodeId.toString();
            var itemConfiguration = this.GetItemConfiguration( itemName );

            if ( !isDefined( itemConfiguration ) ){
                addError( "Unable to find Aggregate configuration for " + itemName );
                continue;
            }

            var aggregateConfiguration = this.MergeDefaultConfiguration( itemConfiguration, configurationMask );

            var requestEntries = Test.AggregateTestData.RawDataCache.ItemMap.Get( itemName );
            var requestEntry = this.GetRequestEntry( requestEntries, requestDefinition );

            if ( isDefined( requestEntry ) ) {

                var aggregateTypes = [];
                aggregateTypes.push( aggregate.Type );

                var nodeToRead = [];
                nodeToRead.push( item );

                // Create Aggregate Request
                var processedRequest = {
                    Name: "ReadProcessedDetails", // just to get the HAStructureHelpers to work.
                    StartTime: this.GetSingleStartTime( requestEntry, itemIndex, timeDefinition ),
                    EndTime: this.GetSingleEndTime( requestEntry, itemIndex, timeDefinition ),
                    ProcessingInterval: this.GetSingleProcessingInterval( requestEntry, itemIndex,
                        processingIntervalDefinition, timeDefinition ),
                    AggregateTypes: aggregateTypes,
                    AggregateConfiguration: aggregateConfiguration
                };

                // Create Read Request
                var request = {
                    NodesToRead: nodeToRead,
                    HistoryReadDetails: processedRequest,
                    TimestampsToReturn: TimestampsToReturn.Source,
                    Debug: variables.Debug,
                };

                var aggregateResults = AggregateHelper.PerformAggregateCheck(
                    request, requestEntry, aggregateConfiguration.Stepped, addErrors );

                result.aggregateResults.push( aggregateResults );

                if ( aggregateResults.status ) {
                    if ( variables.Debug ) {
                        print( "Aggregate " + aggregate.Name + " test for node " +
                            item.NodeId.toString() + " Completed successfully." );
                    }
                } else {
                    status = false;
                    addError( "Aggregate " + aggregate.Name + " test for node " +
                        item.NodeId.toString() + " Failed." );
                }
            } else {
                addWarning( "Unable to perform test, no request entry found" );
            }
        }

        if ( variables.Debug ) {
            print( "Completed Single Node Test for aggregate " + aggregate.Name );
        }

        result.status = status;

        return result;
    }

    this.PerformMultipleNodeTest = function ( variables, processingIntervalDefinition, timeDefinition,
        configurationMask, requestDefinition, addErrorCheck ) {

        var addErrors = true;
        if ( isDefined( addErrorCheck ) && addErrorCheck == false ) {
            addErrors = false;
        }

        var result = new Object;
        result.status = false;
        result.aggregateResults = [];

        if ( !isDefined( Test.AggregateTestData ) ||
            !isDefined( Test.AggregateTestData.RawDataCache ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.Cache ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.Cache.length ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.ItemMap ) ||
            !isDefined( Test.AggregateTestData.RawDataCache.ItemMap.Length ) ) {
            addLog( "Raw Data Cache Unavailable. Aborting" );
            stopCurrentUnit();
            return result;
        }

        var aggregates = this.GetSupportedAggregates();

        var aggregate = aggregates.Get( variables.AggregateName );

        if ( aggregate == null ) {
            addError( "Aggregate " + variables.AggregateName + " not supported by server" );
            stopCurrentUnit();
            return result;
        }

        var status = true;

        if ( variables.Debug ) {
            print( "Running Multi Node Test for aggregate " + aggregate.Name );
        }

        var aggregateConfigurations = [];
        if ( !this.GetMultipleConfigurations( variables.Items, configurationMask, aggregateConfigurations ) ){
            // Nothing to do
            addSkipped("There are no identical configurations that can be used with a multiple node test")
            return result;
        }

        for( var configIndex = 0; configIndex < aggregateConfigurations.length; configIndex++ ){
            var configObject = aggregateConfigurations[ configIndex ];
            if ( configObject.Items.length > 1 ){
                var itemLookup = new KeyPairCollection();
                configObject.Items.forEach( function( item ){
                    itemLookup.Set( item.NodeId.toString(), item );
                });

                for ( var rawRequestIndex = 0; rawRequestIndex < Test.AggregateTestData.RawDataCache.Cache.length; rawRequestIndex++ ) {

                    var requestEntries = Test.AggregateTestData.RawDataCache.Cache[ rawRequestIndex ];
                    var requestEntry = this.GetRequestEntry( requestEntries, requestDefinition );
        
                    if ( isDefined( requestEntry ) ) {
        
                        var nodesToCopy = [];
                        var aggregateTypes = [];
        
                        // Get node ids
                        for ( var nodeIndex = 0; nodeIndex < requestEntry.Nodes.length; nodeIndex++ ) {
                            var originalItemIndex = requestEntry.Nodes[ nodeIndex ].Index;
                            var possibleNodeId = variables.Items[ originalItemIndex ];
                            if ( itemLookup.Contains( possibleNodeId.NodeId.toString() ) ){
                                nodesToCopy.push( variables.Items[ originalItemIndex ] );
                                aggregateTypes.push( aggregate.Type );
                            }
                        }
        
                        // Create Aggregate Request
                        var processedRequest = {
                            StartTime: this.GetMultipleStartTime( requestEntry, timeDefinition ),
                            EndTime: this.GetMultipleEndTime( requestEntry, timeDefinition ),
                            ProcessingInterval: this.GetMultipleProcessingInterval( requestEntry,
                                processingIntervalDefinition, timeDefinition ),
                            AggregateTypes: aggregateTypes,
                            AggregateConfiguration: new UaAggregateConfiguration.New( configObject.Configuration ) 
                        };
        
                        // Create Request
                        var request = {
                            NodesToRead: this.CopyItems( nodesToCopy ),
                            HistoryReadDetails: processedRequest,
                            TimestampsToReturn: TimestampsToReturn.Source,
                            Debug: variables.Debug,
                        };
        
                        var aggregateResults = AggregateHelper.PerformAggregateCheck(
                            request, requestEntry, configObject.Configuration.Stepped, addErrors );
        
                        result.aggregateResults.push( aggregateResults );
        
                        if ( aggregateResults.status ) {
                            if ( variables.Debug ) {
                                print( "Aggregate " + aggregate.Name + " test for multi node Completed successfully." );
                            }
                        } else {
                            status = false;
                            if ( addErrors ) {
                                addError( "Aggregate " + aggregate.Name + " test for multi node Failed." );
                            }
                        }
                    } else {
                        addWarning( "No Request entry.  Unable to perform test" );
                    }
                }
        


            }else{
                print("Unable to test " + configObject.Items[0].NodeId.toString() + " due to unique aggregate configuration" );
            }
        }

        if ( variables.Debug ) {
            print( "Completed Multi Node Test for aggregate " + aggregate.Name );
        }

        result.status = status;

        return result;
    }

    this.GetMultipleConfigurations = function( items, configurationMask, list ){

        var foundMultiple = false;
        for( var index = 0; index < items.length; index++ ){
            var item = items[ index ]
            var nodeIdString = item.NodeId.toString();
            var itemConfiguration = this.GetItemConfiguration( nodeIdString );
            var configuration = this.MergeDefaultConfiguration( itemConfiguration, configurationMask );
            if ( isDefined( configuration ) ){
                // Does this configuration already exist in the map?
                var exists = false;
                for( var listIndex = 0; listIndex < list.length; listIndex++ ){
                    var itemConfiguration = list[ listIndex ];
                    if ( this.CompareConfigurations( itemConfiguration.Configuration, configuration ) ){
                        exists = true;
                        itemConfiguration.Items.push( item );
                        foundMultiple = true;
                        break;
                    }
                }

                if ( !exists ){
                    var itemList = [];
                    itemList.push( item );
                    list.push( {Configuration: configuration, Items: itemList });
                }

            }else{
                addError( "Unable to get configuration for nodeId " + nodeIdString );
            }
        }

        return foundMultiple;
    }

    this.CompareConfigurations = function( one, two ){
        var areEqual = false;

        if ( isDefined( one ) && isDefined( two ) ){
            var equalCount = 0;
            var keys = Object.keys( one );
            keys.forEach( function ( parameter ) {
                var parameterValue = one[ parameter ];
                var testParameter = two[ parameter ];
                if ( isDefined( parameterValue ) && isDefined( testParameter ) ) {
                    if( parameterValue === testParameter ){
                        equalCount++;
                    }
                }
            } );

            if ( keys.length == equalCount ){
                areEqual = true;
            }
        }
        
        return areEqual;
    }
    
    this.GetStartRequestStartTime = function( variables ){
        var itemName = variables.Items[ 0 ].NodeId.toString();
        var requestEntries = Test.AggregateTestData.RawDataCache.ItemMap.Get( itemName );
        var requestEntry = this.GetRequestEntry( requestEntries, this.AggregateRequestDefinition.StartRequest );

        if ( isDefined( requestEntry ) && 
            isDefined( requestEntry.Nodes ) && 
            isDefined( requestEntry.Nodes[ 0 ] ) && 
            isDefined( requestEntry.Nodes[ 0 ].FirstValueInHistory ) && 
            isDefined( requestEntry.Nodes[ 0 ].FirstValueInHistory.SourceTimestamp ) ) {
            return requestEntry.Nodes[ 0 ].FirstValueInHistory.SourceTimestamp;
        }else{
            throw("Unexpected Error retrieving requestEntry");
            stopCurrentUnit();
        }
    }

    this.PerformMismatchTest = function ( variables, moreAggregates ) {
        var result = true;

        var aggregates = this.GetSupportedAggregates();
        var aggregate = aggregates.Get( variables.AggregateName );

        var requiredItemsCount = 2;

        if ( !isDefined( variables.Items ) ||
            !isDefined( variables.Items.length ) ||
            variables.Items.length < requiredItemsCount ) {
            addWarning( "Not enough items to do test, there should be at least " + requiredItemsCount + " Items" );
        } else if ( aggregate == null ) {
            addWarning( "Aggregate " + variables.AggregateName + " not supported by server" );
        } else {

            result = false;

            var aggregates = [];
            var nodes = [];

            var aggregateLength = variables.Items.length;
            if ( moreAggregates ) {
                // Normal Aggregate count, one less item
                var nodesToCopy = variables.Items.length - 1;
                for ( var index = 0; index < nodesToCopy; index++ ) {
                    nodes.push( this.CopyItem( variables.Items[ index ] ) );
                }
            } else {
                // Normal Node Cound, one less aggregate
                aggregateLength -= 1;
                nodes = this.CopyItems( variables.Items );
            }

            var aggregates = [];
            for ( var index = 0; index < aggregateLength; index++ ) {
                aggregates.push( aggregate.Type );
            }

            if ( variables.Debug ) {
                print( "Mismatch test Node Count " + nodes.length + " Aggregate count " + aggregates.length );
            }

            var startTime = this.GetStartRequestStartTime( variables );
            var interval = Settings.ServerTest.NodeIds.Static.HAProfile.Aggregates.ProcessingInterval;
            var endTime = new UaDateTime( startTime );
            endTime.addMilliSeconds( interval * 10 );

            var processedRequest = {
                StartTime: startTime,
                EndTime: endTime,
                ProcessingInterval: interval,
                AggregateTypes: aggregates,
                AggregateConfiguration: UaAggregateConfiguration.New( this.GetDefaultConfiguration() )
            };

            // Create Request
            var request = {
                NodesToRead: nodes,
                HistoryReadDetails: UaReadProcessedDetails.New( processedRequest ),
                TimestampsToReturn: TimestampsToReturn.Source,
                ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadAggregateListMismatch ),
                ReleaseContinuationPoints: false,
                ClearServerContinuationPoints: true,
                Debug: variables.Debug,
            };

            HistoryReadHelper.Execute( request );

            var historyResponse = HistoryReadHelper.Response;

            if ( isDefined( historyResponse ) &&
                isDefined( historyResponse.ResponseHeader ) &&
                isDefined( historyResponse.ResponseHeader.ServiceResult ) ) {
                if ( historyResponse.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadAggregateListMismatch ) {
                    result = true;
                } else {
                    addError( "Unexpected status " + historyResponse.Response.ServiceResult.toString() +
                        " Expected BadAggregateListMismatch" );
                }
            } else {
                addError( "Unable to complete test" );
            }
        }

        return result;
    }

    this.PerformExpectedErrorTest = function ( variables, testItems, configuration, expectedErrorCode, couldBeGood ) {

        result = false;

        var supportedAggregates = this.GetSupportedAggregates();
        var aggregate = supportedAggregates.Get( variables.AggregateName );

        var aggregates = [];

        for ( var index = 0; index < testItems.length; index++ ) {
            aggregates.push( aggregate.Type );
        }

        var startTime = this.GetStartRequestStartTime( variables );
        var interval = Settings.ServerTest.NodeIds.Static.HAProfile.Aggregates.ProcessingInterval;
        var endTime = new UaDateTime( startTime );
        endTime.addMilliSeconds( interval * 10 );

        var processedRequest = {
            StartTime: startTime,
            EndTime: endTime,
            ProcessingInterval: interval,
            AggregateTypes: aggregates,
            AggregateConfiguration: UaAggregateConfiguration.New( configuration )
        };

        // Create Request
        var request = {
            NodesToRead: testItems,
            HistoryReadDetails: UaReadProcessedDetails.New( processedRequest ),
            TimestampsToReturn: TimestampsToReturn.Source,
            ReleaseContinuationPoints: false,
            ClearServerContinuationPoints: true,
            Debug: variables.Debug,
        };

        result = HistoryReadHelper.Execute( request );

        if ( variables.Debug ) {
            print( "History Read Result = " + result );
        }

        // Need to grab the response
        var historyResponse = HistoryReadHelper.Response;
        var serviceResult = historyResponse.ResponseHeader.ServiceResult;
        if ( serviceResult.isGood() ) {

            var results = historyResponse.Results;

            for ( var index = 0; index < results.length; index++ ) {
                var statusCode = results[ index ].StatusCode;

                if ( statusCode.StatusCode != expectedErrorCode ) {
                    if ( couldBeGood ) {
                        if ( statusCode.isBad() ) {
                            addError( "Unexpected Status code " + statusCode.toString() );
                            result = false;
                        }
                    } else {
                        addError( "Unexpected Status code " + statusCode.toString() );
                        result = false;
                    }
                }
            }
        } else {
            addError( "Unexpected History Read Service Error " + serviceResult.toString() );
            result = false;
        }

        return result;
    }


    this.GetRequestEntry = function ( requestEntries, requestDefinition ) {
        var definition = requestDefinition;
        if ( !isDefined( requestDefinition ) ) {
            definition = this.AggregateRequestDefinition.StartRequest;
        }

        var requestEntry = null;

        if ( definition == this.AggregateRequestDefinition.StartRequest ) {
            requestEntry = requestEntries.StartEntry;
        } else if ( definition == this.AggregateRequestDefinition.EndRequest ) {
            requestEntry = requestEntries.EndEntry;
        } else if ( definition == this.AggregateRequestDefinition.BadDataStartRequest ||
            definition == this.AggregateRequestDefinition.BadDataEndRequest ) {
            requestEntry = requestEntries.BadDataEntry;
            if ( !isDefined( requestEntries.BadDataEntry ) ) {
                addWarning( "Unable to perform test, no bad data entry found." );
            }
        } else if ( definition == this.AggregateRequestDefinition.BadOrStartRequest ) {
            if ( isDefined( requestEntries.BadDataEntry ) ) {
                requestEntry = requestEntries.BadDataEntry;
            } else {
                print( "Requested Bad Data Entry - Bad Data Entry no found, using start data" )
                requestEntry = requestEntries.StartEntry;
            }
        } else if ( definition == this.AggregateRequestDefinition.BadOrEndRequest ) {
            if ( isDefined( requestEntries.BadDataEntry ) ) {
                requestEntry = requestEntries.BadDataEntry;
            } else {
                print( "Requested Bad Data Entry - Bad Data Entry no found, using end data" )
                requestEntry = requestEntries.EndEntry;
            }
        } else if ( definition == this.AggregateRequestDefinition.BadOrEndRequest ) {
            requestEntry = requestEntries.EndEntry;
        }

        if ( !isDefined( requestEntry ) ) {
            throw ( "GetRequestEntry failed due to incorrect test configuration" );
        }

        return requestEntry;
    }

    this.GetStartTime = function ( requestEntry, itemIndex, initialTime, finalTime, timeDefinition ) {

        var startTime = null;

        if ( timeDefinition == this.AggregateTimeDefinition.StartBeforeEnd ||
            timeDefinition == this.AggregateTimeDefinition.StartEqualsEnd ||
            timeDefinition == this.AggregateTimeDefinition.EndingBoundNotFound ) {
            startTime = new UaDateTime( initialTime );
        } else if ( timeDefinition == this.AggregateTimeDefinition.EndBeforeStart ) {
            startTime = finalTime;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartAndEndBeforeData ) {
            var timestamp = new UaDateTime( initialTime );
            timestamp.addMilliSeconds( -LONGER_TIME_DIFFERENTIAL );
            startTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartAndEndAfterData ) {
            // Start after the last value
            var timestamp = new UaDateTime( finalTime );
            timestamp.addMilliSeconds( SHORTER_TIME_DIFFERENTIAL );
            startTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundNotFound ) {
            // Start before the first value.
            var timestamp = new UaDateTime( initialTime );
            timestamp.addMilliSeconds( -1 );
            startTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundBad ||
            timeDefinition == this.AggregateTimeDefinition.StartingBoundUncertain ) {

            // The starting time is the start of the first bad value
            // Then end time will be harder, as the first interval should contain all bad data?  
            // That's not true for every case, but it should work

            var badIndexes = this.GetContiguousBadIndexes( requestEntry, itemIndex );
            if ( isDefined( badIndexes ) && isDefined( badIndexes.StartIndex ) ) {
                // Start Index is start of bad data for StartingBoundBad
                // Same indexes for both.
                // For uncertain, add a millisecond around both sides
                // That is subtract one millisecond for start time,
                // and add one millisecond for end time.
                var startIndex = badIndexes.StartIndex;
                startTime = new UaDateTime( this.GetValueTimestamp( requestEntry, itemIndex, startIndex ) );
                if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundUncertain ) {
                    startTime.addMilliSeconds( -1 );
                }
            } else {
                addWarning( "Unable to do test - no bad data found" );
            }
        } else if ( timeDefinition == this.AggregateTimeDefinition.NoDataInRange ) {
            var firstGoodIndex = this.GetTwoConsecutiveValuesStartIndex( requestEntry, itemIndex );
            startTime = new UaDateTime( this.GetValueTimestamp( requestEntry, itemIndex, firstGoodIndex ) );
            startTime.addMilliSeconds( 1 );
        }

        return startTime;
    }

    this.GetEndTime = function ( requestEntry, itemIndex, initialTime, finalTime, timeDefinition ) {

        var endTime = null;

        if ( timeDefinition == this.AggregateTimeDefinition.StartBeforeEnd ||
            timeDefinition == this.AggregateTimeDefinition.StartingBoundNotFound ) {
            endTime = new UaDateTime( finalTime );
        } else if ( timeDefinition == this.AggregateTimeDefinition.EndBeforeStart ||
            timeDefinition == this.AggregateTimeDefinition.StartEqualsEnd ) {
            endTime = new UaDateTime( initialTime );
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartAndEndBeforeData ) {
            var timestamp = new UaDateTime( initialTime );
            timestamp.addMilliSeconds( -SHORTER_TIME_DIFFERENTIAL );
            endTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartAndEndAfterData ) {
            var timestamp = new UaDateTime( finalTime );
            timestamp.addMilliSeconds( LONGER_TIME_DIFFERENTIAL );
            endTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.EndingBoundNotFound ) {
            var timestamp = new UaDateTime( finalTime );
            timestamp.addMilliSeconds( 1 );
            endTime = timestamp;
        } else if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundUncertain ||
            timeDefinition == this.AggregateTimeDefinition.StartingBoundBad ) {

            var startTime = new UaDateTime( this.GetStartTime( requestEntry, itemIndex, initialTime, finalTime, timeDefinition ) );
            var interval = this.GetProcessingInterval( requestEntry, itemIndex, -1, null, timeDefinition );

            var potentialEndTime = new UaDateTime( startTime );
            potentialEndTime.addMilliSeconds( interval * 10 );

            if ( potentialEndTime.msecsTo( finalTime ) < 0 ) {
                endTime = new UaDateTime( finalTime );
            } else {
                endTime = potentialEndTime;
            }
        } else if ( timeDefinition == this.AggregateTimeDefinition.NoDataInRange ) {
            var firstGoodIndex = this.GetTwoConsecutiveValuesStartIndex( requestEntry, itemIndex );
            endTime = new UaDateTime( this.GetValueTimestamp( requestEntry, itemIndex, firstGoodIndex + 1 ) );
            endTime.addMilliSeconds( -1 );
        }

        return endTime;
    }

    this.GetSingleStartTime = function ( requestEntry, itemIndex, timeDefinition ) {

        return this.GetStartTime( requestEntry, itemIndex,
            requestEntry.Nodes[ itemIndex ].StartRequestTime,
            requestEntry.Nodes[ itemIndex ].EndRequestTime,
            timeDefinition );
    }

    this.GetSingleEndTime = function ( requestEntry, itemIndex, timeDefinition ) {
        return this.GetEndTime( requestEntry, itemIndex,
            requestEntry.Nodes[ itemIndex ].StartRequestTime,
            requestEntry.Nodes[ itemIndex ].EndRequestTime,
            timeDefinition );
    }

    this.GetMultipleStartTime = function ( requestEntry, timeDefinition ) {
        return this.GetStartTime( requestEntry, 0,
            requestEntry.StartRequestTime,
            requestEntry.EndRequestTime,
            timeDefinition );
    }

    this.GetMultipleEndTime = function ( requestEntry, timeDefinition ) {
        return this.GetEndTime( requestEntry, 0,
            requestEntry.StartRequestTime,
            requestEntry.EndRequestTime,
            timeDefinition );
    }

    this.GetTwoConsecutiveValuesStartIndex = function ( requestEntry, itemIndex ) {

        if ( !requestEntry.Nodes[ itemIndex ].ConsecutiveGoodValuesStartIndex ) {
            var historyData = requestEntry.RawResults[ itemIndex ].HistoryData.toHistoryData();
            if ( historyData ) {
                var values = historyData.DataValues;
                var firstGoodIndex = -1;
                for ( var index = 0; index < values.length; index++ ) {
                    if ( values[ index ].StatusCode.isGood() ) {
                        if ( firstGoodIndex < 0 ) {
                            firstGoodIndex = index;
                        } else {
                            // Done
                            requestEntry.Nodes[ itemIndex ].ConsecutiveGoodValuesStartIndex = firstGoodIndex;
                            break;
                        }
                    } else {
                        firstGoodIndex = -1;
                    }
                }
            }
        }

        return requestEntry.Nodes[ itemIndex ].ConsecutiveGoodValuesStartIndex;
    }

    this.PopulateRequestTimes = function ( requestEntry ) {

        if ( isDefined( requestEntry ) && isDefined( requestEntry.RequestType ) ) {

            if ( requestEntry.RequestType == this.RequestEntryDefinition.StartEntry ) {

                requestEntry.StartRequestTime = requestEntry.EarliestTime;
                requestEntry.EndRequestTime = this.CalculateTimeSpan( requestEntry.RequestType,
                    requestEntry.EarliestTime, requestEntry.LatestTime );

                for ( var index = 0; index < requestEntry.Nodes.length; index++ ) {
                    var node = requestEntry.Nodes[ index ];
                    node.StartRequestTime = node.FirstValueInHistory.SourceTimestamp;
                    node.EndRequestTime = this.CalculateTimeSpan( requestEntry.RequestType,
                        node.FirstValueInHistory.SourceTimestamp,
                        node.LastValueInHistory.SourceTimestamp );
                }
            } else if ( requestEntry.RequestType == this.RequestEntryDefinition.EndEntry ) {

                requestEntry.StartRequestTime = this.CalculateTimeSpan( requestEntry.RequestType,
                    requestEntry.EarliestTime, requestEntry.LatestTime );
                requestEntry.EndRequestTime = requestEntry.LatestTime;

                for ( var index = 0; index < requestEntry.Nodes.length; index++ ) {
                    var node = requestEntry.Nodes[ index ];
                    node.StartRequestTime = this.CalculateTimeSpan( requestEntry.RequestType,
                        node.FirstValueInHistory.SourceTimestamp,
                        node.LastValueInHistory.SourceTimestamp );
                    node.EndRequestTime = node.LastValueInHistory.SourceTimestamp;
                }

            } else if ( requestEntry.RequestType == this.RequestEntryDefinition.BadDataEntry ) {

                requestEntry.StartRequestTime = this.CalculateTimeSpan(
                    this.RequestEntryDefinition.StartEntry,
                    requestEntry.EarliestTime, requestEntry.LatestTime );
                requestEntry.EndRequestTime = this.CalculateTimeSpan( this.RequestEntryDefinition.EndEntry,
                    requestEntry.EarliestTime, requestEntry.LatestTime );

                for ( var index = 0; index < requestEntry.Nodes.length; index++ ) {
                    var node = requestEntry.Nodes[ index ];
                    node.StartRequestTime = this.CalculateTimeSpan(
                        this.RequestEntryDefinition.StartEntry,
                        node.FirstValueInHistory.SourceTimestamp,
                        node.LastValueInHistory.SourceTimestamp );
                    node.EndRequestTime = this.CalculateTimeSpan(
                        this.RequestEntryDefinition.EndEntry,
                        node.FirstValueInHistory.SourceTimestamp,
                        node.LastValueInHistory.SourceTimestamp );
                }
            }
        }
    }

    this.CalculateTimeSpan = function ( requestEntryDefinition, start, end ) {
        var span = start.msecsTo( end );
        var startSpan = span * 0.20;
        var endSpan = span * 0.80;
        var returnValue = new UaDateTime( start );

        if ( requestEntryDefinition == this.RequestEntryDefinition.StartEntry ) {
            returnValue.addMilliSeconds( startSpan );
        } else if ( requestEntryDefinition == this.RequestEntryDefinition.EndEntry ) {
            returnValue.addMilliSeconds( endSpan );
        } else {
            throw ( "CalculateEightyPercent programming error" );
        }

        return returnValue;
    }

    this.GetProcessingInterval = function ( requestEntry, itemIndex, range, processingIntervalDefinition, timeDefinition ) {

        var interval = 0;

        // check timeDefinition first, it overrules for certain cases

        if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundBad ||
            timeDefinition == this.AggregateTimeDefinition.StartingBoundUncertain ) {

            // interval is time from the first bad value to the last bad value
            var node = requestEntry.Nodes[ itemIndex ];
            var startTime = new UaDateTime( this.GetValueTimestamp( requestEntry, itemIndex, node.ContiguousBadData.StartIndex ) );
            var endTime = new UaDateTime( this.GetValueTimestamp( requestEntry, itemIndex, node.ContiguousBadData.EndIndex ) );

            if ( timeDefinition == this.AggregateTimeDefinition.StartingBoundUncertain ) {
                startTime.addMilliSeconds( -1 );
                endTime.addMilliSeconds( 1 );
            }
            interval = startTime.msecsTo( endTime );
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalZero ) {
            interval = 0;
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalOne ) {
            interval = 1;
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalConfigured ) {
            interval = Settings.ServerTest.NodeIds.Static.HAProfile.Aggregates.ProcessingInterval;
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalTenIntervals ) {
            var interval = parseInt( range / 10 );
            print( "Ten Intervals range = " + range + " interval = " + interval );
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalGreaterThanRange ) {
            interval = 1 + range;
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.IntervalNoData ) {
            interval = LONGER_TIME_DIFFERENTIAL - SHORTER_TIME_DIFFERENTIAL
        } else if ( processingIntervalDefinition == this.AggregateProcessIntervalDefinition.NoDataInRange ) {
            var startTime = this.GetStartTime( requestEntry, itemIndex, null, null, timeDefinition );
            var endTime = this.GetEndTime( requestEntry, itemIndex, null, null, timeDefinition );
            interval = startTime.msecsTo( endTime );
        }

        return interval;
    }

    this.GetSingleProcessingInterval = function ( requestEntry, itemIndex, processingIntervalDefinition, timeDefinition ) {
        var range = Math.abs(
            requestEntry.Nodes[ itemIndex ].StartRequestTime.msecsTo(
                requestEntry.Nodes[ itemIndex ].EndRequestTime ) );
        return this.GetProcessingInterval( requestEntry, itemIndex, range, processingIntervalDefinition, timeDefinition );
    }

    this.GetMultipleProcessingInterval = function ( requestEntry, processingIntervalDefinition, timeDefinition ) {

        var range = Math.abs( requestEntry.StartRequestTime.msecsTo( requestEntry.EndRequestTime ) );
        return this.GetProcessingInterval( requestEntry, -1, range, processingIntervalDefinition, timeDefinition );
    }

    this.CopyItems = function ( items ) {

        var readItems = [];

        if ( isDefined( items.length ) ) {
            for ( var index = 0; index < items.length; index++ ) {
                readItems.push( this.CopyItem( items[ index ] ) );
            }
        } else {
            readItems.push( this.CopyItem( items ) );
        }

        return readItems;
    }

    this.CopyItem = function ( item ) {
        var cloned = MonitoredItem.Clone( item );

        cloned.FirstValueInHistory = item.FirstValueInHistory;
        cloned.LastValueInHistory = item.LastValueInHistory;

        return cloned;
    }

    this.GetSupportedAggregates = function () {

        if ( !isDefined( Test.AggregateTestData ) ) {
            Test.AggregateTestData = new Object();
        }

        if ( !isDefined( Test.AggregateTestData.SupportedAggregates ) ) {

            var hasComponent = new UaNodeId( Identifier.HasComponent );
            var organizes = new UaNodeId( Identifier.Organizes );

            var aggregateBranch = MonitoredItem.fromNodeIds(
                new UaNodeId( Identifier.Server_ServerCapabilities_AggregateFunctions ) )[ 0 ];
            aggregateBranch.BrowseDirection = BrowseDirection.Forward;

            if ( BrowseHelper.Execute( { NodesToBrowse: aggregateBranch } ) &&
                BrowseHelper.Response.Results.length > 0 &&
                BrowseHelper.Response.Results[ 0 ].References.length > 0 ) {

                var references = BrowseHelper.Response.Results[ 0 ].References;

                var aggregates = new KeyPairCollection();

                for ( var index = 0; index < references.length; index++ ) {
                    var reference = references[ index ];
                    if ( reference.ReferenceTypeId.equals( hasComponent ) ||
                        reference.ReferenceTypeId.equals( organizes ) ) {

                        aggregates.Set( reference.BrowseName.Name,
                            {
                                Type: reference.NodeId.NodeId,
                                Name: reference.BrowseName.Name
                            } );

                        if ( gServerCapabilities.Debug ) {
                            print( "Aggregate '" + reference.BrowseName.Name + "' found in 'AggregateFunctions'." );
                        }
                    }
                }

                Test.AggregateTestData.SupportedAggregates = aggregates;
            }
        }

        if ( !Test.AggregateTestData.SupportedAggregates ) {
            Test.AggregateTestData.SupportedAggregates = new Object();
            addSkipped( "Aggregates not found in server. Aborting Testing. Check settings." );
            stopCurrentUnit();
        }

        return Test.AggregateTestData.SupportedAggregates;
    }

    this.Bad_GetDefaultConfiguration = function () {

        return {
            UseServerCapabilitiesDefaults: true,
            TreatUncertainAsBad: true,
            PercentDataGood: 100,
            PercentDataBad: 100,
            UseSlopedExtrapolation: true
        };
    }

    /**
     * Get a null configuration.
     * This allows a specific test to change one of the parameters to a specific value.
     * Each Historical variable can have a distinct Default configuration, and this mechanism
     * allows a test to set one parameter, and a merge function can put together the variable defaults
     * as well as the desired specific parameter.
     * @returns an empty Configuration.  
     */
    this.GetDefaultConfiguration = function () {

        return {
            UseServerCapabilitiesDefaults: null,
            TreatUncertainAsBad: null,
            PercentDataGood: null,
            PercentDataBad: null,
            UseSlopedExtrapolation: null,
            UseSteppedInterpolation: null
        };
    }

    this.MergeDefaultConfiguration = function ( itemConfiguration, testConfiguration ) {

        var merged = null;

        if ( isDefined( itemConfiguration ) && isDefined( testConfiguration ) ){
            merged = new Object();
            Object.keys( itemConfiguration ).forEach( function ( parameter ) {
                var testParameter = testConfiguration[ parameter ];
                if ( isDefined( testParameter ) ) {
                    merged[ parameter ] = testParameter;
                } else {
                    merged[ parameter ] = itemConfiguration[ parameter ];
                }
            } );
        }

        return merged;
    }

    this.GetItemConfiguration = function( nodeIdString ){
        var itemConfiguration = null;
        var configuredItem = this.ConfiguredItems.Get( nodeIdString );
        if ( isDefined( configuredItem ) && configuredItem.Historical === true ){
            if ( !isDefined( configuredItem.ValidConfiguration ) ){
                // Go Look up what you need.
                if ( isDefined( configuredItem.Configurations ) ){
                    var translate = this.TranslateConfiguration;
                    var objectModelHelper = new ObjectModelHelper();
                    configuredItem.Configurations.Iterate( function( nodeIdString, configurationObject ){
                        var configuration = translate( objectModelHelper, configurationObject );
                        if ( isDefined( configuration ) && configuration.Valid === true ){
                            if ( configuration.Name == "HA Configuration" ){
                                configuredItem.AggregateConfiguration = configuration;
                                configuredItem.ConfigurationNodeId = nodeIdString;
                                configuredItem.ValidConfiguration = true;
                            }
                        }
                    });
                }
            }

            if ( configuredItem.ValidConfiguration === true ){
                itemConfiguration = configuredItem.AggregateConfiguration.AggregateConfiguration;
            }
        }

        return itemConfiguration;
    }


    this.GetValueTimestamp = function ( requestEntry, nodeIndex, valueIndex ) {

        var historyData = requestEntry.RawResults[ nodeIndex ].HistoryData.toHistoryData();
        return historyData.DataValues[ valueIndex ].SourceTimestamp;
    }

    this.CreateProcessedDetailsRequest = function ( aggregateRequest ) {
        // The structures to build the request in HAStructureHelper are not very friendly.
        // Basically the system is designed to work on passing a plain object that has the internals already created.
        // Not sure how to fix this.


        return {
            NodesToRead: aggregateRequest.NodesToRead,
            HistoryReadDetails: UaReadProcessedDetails.New( {
                Name: "ReadProcessedDetails",
                StartTime: aggregateRequest.HistoryReadDetails.StartTime,
                EndTime: aggregateRequest.HistoryReadDetails.EndTime,
                ProcessingInterval: aggregateRequest.HistoryReadDetails.ProcessingInterval,
                AggregateTypes: aggregateRequest.HistoryReadDetails.AggregateTypes,
                AggregateConfiguration: UaAggregateConfiguration.New( aggregateRequest.HistoryReadDetails.AggregateConfiguration )
            } ),
            TimestampsToReturn: TimestampsToReturn.Source
        };

    }

    //#endregion

    //#region Test Verification

    this.CompareValues = function ( result, debug ) {

        var success = false;
        if ( result.actualStatus === true && result.expectedStatus === true ) {

            var serverReadResults = result.actualResults;
            var cttReadResults = result.expectedResults;

            if ( serverReadResults.length === cttReadResults.length ) {
                success = true;
                for ( var index = 0; index < serverReadResults.length; index++ ) {

                    var loopStatus = false;
                    print( "CompareValues Index [" + ( index + 1 ) + "] out of [" + serverReadResults.length + "]" );
                    var serverReadResult = serverReadResults[ index ];
                    var cttReadResult = cttReadResults[ index ];

                    if ( serverReadResult.StatusCode.equals( cttReadResult.StatusCode ) ) {

                        if ( cttReadResult.StatusCode.StatusCode != StatusCode.BadInvalidArgument ) {
                            var serverHistoryData = serverReadResult.HistoryData.toHistoryData();
                            var cttHistoryData = cttReadResult.HistoryData.toHistoryData();

                            if ( this.CompareHistoryData( serverHistoryData, cttHistoryData, debug ) ) {
                                loopStatus = true;
                            }
                        } else {
                            // This is still a success
                            loopStatus = true;
                            print( "Server and CTT have status codes of BadInvalidArgument" );
                        }
                    } else {
                        print( "Server Status [" + serverReadResult.StatusCode +
                            "] not equal to ctt status [" + cttReadResult.StatusCode + "]" );
                    }
                    if ( !loopStatus ) {
                        success = false;
                    }
                }
            } else {
                print( "Server Read Results length [" + serverReadResults.length +
                    "] not equal to ctt read results length [" + cttReadResults.length + "]" );
            }
        } else {
            print( "Perform Aggregate Check unable to get data - actual status ["
                + result.actualStatus + "] expected status [" + result.expectedStatus + "]" );
        }

        return success;
    }

    this.CompareHistoryData = function ( serverHistoryData, cttHistoryData, debug ) {
        var success = false;

        if ( isDefined( serverHistoryData ) ) {
            if ( isDefined( cttHistoryData ) ) {
                if ( serverHistoryData.DataValues.length == cttHistoryData.DataValues.length ) {
                    success = true;
                    for ( var index = 0; index < serverHistoryData.DataValues.length; index++ ) {
                        var serverValue = serverHistoryData.DataValues[ index ];
                        var cttValue = cttHistoryData.DataValues[ index ];

                        if ( !this.equals( serverValue, cttValue ) ) {
                            print( "server Value not equal to expected ctt value (index [" + index + "])" );
                            success = false;
                        }

                        if ( debug === true ) {
                            print( "Server Value = " + this.GetDataValueString( serverValue ) );
                            print( "   CTT Value = " + this.GetDataValueString( cttValue ) );
                        }
                    }
                } else {
                    print( "Server History Data length [" + serverHistoryData.DataValues.length +
                        "] not equal to ctt History Data length [" + cttHistoryData.DataValues.length + "]" );
                }
            } else {
                print( "Unable to get ctt history data" );
            }
        } else {
            print( "Unable to get server history data" );
        }

        return success;
    }

    this.GetDataValueString = function ( value ) {
        var message =
            " Value = " + value.Value.toString() +
            " status = " + value.StatusCode.toString() +
            " source timestamp = " + value.SourceTimestamp.toString();
        return message;
    }

    // resultIndex is for singlenode test
    // itemIndex is for multinode test
    this.GetDataValue = function ( results, resultIndex, itemIndex, valueIndexDefinition ) {
        var dataValue = null;

        // look at ctt results
        var historyData = results.aggregateResults[ resultIndex ].actualResults[ itemIndex ].HistoryData.toHistoryData();

        if ( historyData ) {
            var indexValue = 0;
            if ( valueIndexDefinition == this.AggregateValueIndexDefinition.Last ) {
                indexValue = historyData.DataValues.length - 1;
            }

            if ( indexValue < historyData.DataValues.length ) {
                dataValue = historyData.DataValues[ indexValue ];
            }
        }

        return dataValue;
    }


    this.equals = function ( server, ctt ) {
        var equals = false;

        if ( server.StatusCode.equals( ctt.StatusCode ) &&
            server.SourceTimestamp.equals( ctt.SourceTimestamp ) ) {

            if ( server.Value.equals( ctt.Value ) ) {
                equals = true;
            } else {
                var result = Math.abs( server.Value - ctt.Value );
                if ( result < 0.01 ) {
                    equals = true;
                }
            }
        }

        return equals;
    }

    //#endregion

    //#region Test Helpers

    this.GetNodesFromRequestEntry = function ( requestEntry ) {
        var nodes = [];
        for ( var nodeIndex = 0; nodeIndex < requestEntry.Nodes.length; nodeIndex++ ) {
            var variableIndex = requestEntry.Nodes[ nodeIndex ].Index;
            nodes.push( CUVariables.Items[ variableIndex ] );
        }
        return this.CopyItems( nodes );
    }

    this.CreateAggregateTypeArray = function ( type, count ) {
        var types = [];
        for ( var index = 0; index < count; index++ ) {
            types.push( type );
        }
        return types;
    }

    this.SupportsInterpolativeBounding = function ( aggregateName ) {
        var interpolativeAggregate = false;

        if ( aggregateName == "Interpolative" ||
            aggregateName == "TimeAverage" ||
            aggregateName == "Total" ) {
            interpolativeAggregate = true;
        }

        return interpolativeAggregate;
    }

    this.GetAggregateBounding = function ( aggregateName ) {
        var BoundingType = this.AggregateBoundingType.None;

        if ( this.SupportsInterpolativeBounding( aggregateName ) ) {
            BoundingType = this.AggregateBoundingType.Interpolated;
        } else if ( this.SupportsSimpleBounding( aggregateName ) ) {
            BoundingType = this.AggregateBoundingType.Simple;
        }

        return BoundingType;
    }

    this.SupportsSimpleBounding = function ( aggregateName ) {
        var simpleAggregate = false;

        if ( aggregateName == "TimeAverage2" ||
            aggregateName == "Total2" ||
            aggregateName == "Minimum2" ||
            aggregateName == "Maximum2" ||
            aggregateName == "MinimumActualTime2" ||
            aggregateName == "MaximumActualTime2" ||
            aggregateName == "DurationInStateZero" ||
            aggregateName == "DurationInStateNonZero" ||
            aggregateName == "StartBound" ||
            aggregateName == "EndBound" ||
            aggregateName == "DeltaBounds" ||
            aggregateName == "WorstQuality2" ||
            aggregateName == "PercentBad" ||
            aggregateName == "PercentGood" ||
            aggregateName == "Range2" ||
            aggregateName == "DurationBad" ||
            aggregateName == "DurationGood" ) {
            simpleAggregate = true;
        }

        return simpleAggregate;
    }

    this.SupportsBounding = function ( aggregateName ) {
        return !this.SupportsNoBounding( aggregateName );
    };

    this.SupportsNoBounding = function ( aggregateName ) {
        var nonBounding = false;
        if (
            aggregateName == "Average" ||
            aggregateName == "Minimum" ||
            aggregateName == "Maximum" ||
            aggregateName == "MinimumActualTime" ||
            aggregateName == "MaximumActualTime" ||
            aggregateName == "Range" ||
            aggregateName == "AnnotationCount" ||
            aggregateName == "Count" ||
            aggregateName == "Start" ||
            aggregateName == "End" ||
            aggregateName == "Delta" ||
            aggregateName == "WorstQuality" ||
            aggregateName == "StandardDeviationSample" ||
            aggregateName == "VarianceSample" ||
            aggregateName == "StandardDeviationPopulation" ||
            aggregateName == "VariancePopulation" ||
            aggregateName == "NumberOfTransitions" ) {
            nonBounding = true;
        }

        return nonBounding;
    }

    this.StatusCodeHasBitSet = function ( statusCode, aggregateBit ) {
        var hasBitSet = false;

        var isolateBit = statusCode.StatusCode & aggregateBit;
        if ( isolateBit > 0 ) {
            hasBitSet = true;
        }

        return hasBitSet;
    }

    this.CheckResultsForStatusPerBounding = function ( aggregateName, results, valueIndexDefinition, expectations ) {

        var BoundingType = this.GetAggregateBounding( aggregateName );

        var statusDefinition = expectations.None;
        if ( BoundingType == this.AggregateBoundingDefinition.Simple ) {
            statusDefinition = expectations.Simple;
        } else if ( BoundingType == this.AggregateBoundingDefinition.Interpolated ) {
            statusDefinition = expectations.Interpolated;
        }

        return this.CheckStatusResults( results, valueIndexDefinition, statusDefinition );
    }

    this.CheckResultsForStatus = function ( aggregateName, results,
        BoundingDefinition, valueIndexDefinition, statusDefinition ) {

        var success = true;

        if ( this.ShouldDoCheck( aggregateName, BoundingDefinition ) ) {
            success = this.CheckStatusResults( results, valueIndexDefinition, statusDefinition );
        }

        return success;
    }

    this.CheckStatusResults = function ( results, valueIndexDefinition, statusDefinition ) {
        var success = false;

        if ( results.status === true ) {

            success = true;

            for ( var index = 0; index < results.aggregateResults.length; index++ ) {
                var dataValue = this.GetDataValue( results, index, 0, valueIndexDefinition );
                if ( dataValue != null ) {
                    if ( statusDefinition == this.AggregateStatusDefinition.IsGood ) {
                        if ( !dataValue.StatusCode.isGood() ) {
                            success = false;
                        }
                    } else if ( statusDefinition == this.AggregateStatusDefinition.IsBad ) {
                        if ( !dataValue.StatusCode.isBad() ) {
                            success = false;
                        }
                    } else if ( statusDefinition == this.AggregateStatusDefinition.IsUncertain ) {
                        if ( !dataValue.StatusCode.isUncertain() ) {
                            success = false;
                        }
                    }
                } else {
                    print( "CheckStatusResults Unable to retrieve data value" );
                    success = false;
                }
            }
        } else {
            print( "CheckStatusResults Original Test Failed" );
        }

        return success;
    }

    this.CheckResultsForAggregateBit = function ( aggregateName, results,
        BoundingDefinition, valueIndexDefinition, aggregateBit ) {

        var success = false;

        if ( results.status === true ) {

            success = true;

            if ( this.ShouldDoCheck( aggregateName, BoundingDefinition ) ) {
                for ( var index = 0; index < results.aggregateResults.length; index++ ) {
                    var dataValue = this.GetDataValue( results, index, 0, valueIndexDefinition );
                    if ( dataValue != null ) {
                        if ( !AggregateHelper.StatusCodeHasBitSet( dataValue.StatusCode, aggregateBit ) ) {
                            success = false;
                        }
                    } else {
                        print( "CheckResultsForAggregateBit Unable to retrieve data value" );
                        success = false;
                    }
                }
            }
        }

        return success;
    }

    this.CheckResultsForDataValuesSize = function ( results, expectedCount ) {
        // Only for Single Node check

        var success = false;

        if ( results.status === true ) {

            success = true;

            for ( var resultIndex = 0; resultIndex < results.aggregateResults.length; resultIndex++ ) {
                var serverResults = results.aggregateResults[ resultIndex ];
                for ( var itemIndex = 0; itemIndex < serverResults.length; itemIndex++ ) {
                    var historyData = serverResults[ itemIndex ].HistoryData.toHistoryData();

                    if ( historyData ) {
                        if ( historyData.DataValues.length != expectedCount ) {
                            success = false;
                            print( "CheckResultsForDataValuesSize Unexpected results size" );
                        }
                    } else {
                        print( "CheckResultsForDataValuesSize Unable to retrieve history data" );
                        success = false;
                    }
                }
            }
        }

        return success;
    }

    this.ShouldDoCheck = function ( aggregateName, boundingDefinition ) {
        var doCheck = false;

        if ( boundingDefinition == this.AggregateBoundingDefinition.All ) {
            doCheck = true;
        } else if ( boundingDefinition == this.AggregateBoundingDefinition.Bounding &&
            this.SupportsBounding( aggregateName ) ) {
            doCheck = true;
        } else if ( boundingDefinition == this.AggregateBoundingDefinition.Simple &&
            this.SupportsSimpleBounding( aggregateName ) ) {
            doCheck = true;
        } else if ( boundingDefinition == this.AggregateBoundingDefinition.Interpolative &&
            this.SupportsInterpolativeBounding( aggregateName ) ) {
            doCheck = true;
        } else if ( boundingDefinition == this.AggregateBoundingDefinition.None &&
            this.SupportsNoBounding( aggregateName ) ) {
            doCheck = true;
        }

        return doCheck;
    }

    this.AggregateSupportsNumeric = function ( aggregateName ) {
        var numericAggregate = false;
        if ( aggregateName == "Interpolative" ||
            aggregateName == "Average" ||
            aggregateName == "TimeAverage" ||
            aggregateName == "TimeAverage2" ||
            aggregateName == "Total" ||
            aggregateName == "Minimum" ||
            aggregateName == "Maximum" ||
            aggregateName == "MinimumActualTime" ||
            aggregateName == "MaximumActualTime" ||
            aggregateName == "Range" ||
            aggregateName == "Total2" ||
            aggregateName == "Minimum2" ||
            aggregateName == "Maximum2" ||
            aggregateName == "MinimumActualTime2" ||
            aggregateName == "MaximumActualTime2" ||
            aggregateName == "Range2" ||
            aggregateName == "StartBound" ||
            aggregateName == "EndBound" ||
            aggregateName == "Delta" ||
            aggregateName == "DeltaBounds" ||
            aggregateName == "StandardDeviationSample" ||
            aggregateName == "VarianceSample" ||
            aggregateName == "StandardDeviationPopulation" ||
            aggregateName == "VariancePopulation" ||
            this.AggregateSupportsNonNumericAndDiscrete( aggregateName ) ) {
            numericAggregate = true;
        }

        return numericAggregate;
    }

    this.AggregateSupportsDiscrete = function ( aggregateName ) {
        var discreteAggregate = false;
        if ( aggregateName == "DurationInStateZero" ||
            aggregateName == "DurationInStateNonZero" ||
            this.AggregateSupportsNonNumericAndDiscrete( aggregateName ) ) {
            discreteAggregate = true;
        }
        return discreteAggregate;
    }

    this.AggregateSupportsNonNumericAndDiscrete = function ( aggregateName ) {
        var other = false;

        if ( aggregateName == "AnnotationCount" ||
            aggregateName == "Count" ||
            aggregateName == "NumberOfTransitions" ||
            aggregateName == "Start" ||
            aggregateName == "End" ||
            aggregateName == "DurationGood" ||
            aggregateName == "DurationBad" ||
            aggregateName == "PercentGood" ||
            aggregateName == "PercentBad" ||
            aggregateName == "WorstQuality" ||
            aggregateName == "WorstQuality2" ) {
            other = true;
        }

        return other;
    }

    this.GetItemsOfDataType = function ( variables, dataTypeDefinition ) {
        var items = [];

        for ( var index = 0; index < variables.Items.length; index++ ) {
            var item = variables.Items[ index ];
            var nonNumericIndex = item.NodeSetting.indexOf( "NonNumeric" );
            var booleanIndex = item.NodeSetting.indexOf( "Boolean" );

            if ( dataTypeDefinition == this.AggregateDataType.Numeric ) {
                if ( nonNumericIndex < 0 && booleanIndex < 0 ) {
                    items.push( this.CopyItem( item ) );
                }
            } else if ( dataTypeDefinition == this.AggregateDataType.Boolean ) {
                if ( booleanIndex >= 0 ) {
                    items.push( this.CopyItem( item ) );
                }
            } else if ( dataTypeDefinition == this.AggregateDataType.NonNumeric ) {
                if ( nonNumericIndex >= 0 ) {
                    items.push( this.CopyItem( item ) );
                }
            }
        }

        return items;
    }

    this.IsAggregateSupported = function ( variables ) {
        var isSupported = false;

        var aggregates = this.GetSupportedAggregates();
        var aggregate = aggregates.Get( variables.AggregateName );

        if ( isDefined( aggregate ) && isDefined( aggregate.Type ) ) {
            isSupported = true;
        }

        return isSupported;
    }

    //#endregion

    //#region Aggregate Supporting...

    this.SupportsUncertain = function ( aggregate ) {
        var supportsUncertain = true;

        if ( aggregate.Name == "Average" ||
            aggregate.Name == "AnnotationCount" ||
            aggregate.Name == "DurationGood" ||
            aggregate.Name == "DurationBad" ||
            aggregate.Name == "PercentGood" ||
            aggregate.Name == "PercentBad" ||
            aggregate.Name == "WorstQuality" ||
            aggregate.Name == "WorstQuality2" ) {
            supportsUncertain = false;
        }

        return supportsUncertain;
    }

    this.SetupItems = function ( variables, aggregate ) {

    }

    //#endregion


    //#region Test Debugging

    // print out all raw values

    // print out start stop times and lengths

    this.printCachedValues = function () {
        print( "DEBUG - Cached Values, there are " + Test.AggregateTestData.RawDataCache.Cache.length + " requestEntries in the cache" )
        for ( var index = 0; index < Test.AggregateTestData.RawDataCache.Cache.length; index++ ) {
            this.printRequestEntries( Test.AggregateTestData.RawDataCache.Cache[ index ] );
        }
    }

    this.printRequestEntries = function ( requestEntries ) {

        return;
        print( "" );
        print( "DEBUG - Print Request Entries" );
        print( "" );
        this.printRequestEntriesNodes( requestEntries );
        print( "" );
        this.printRequestEntriesTimes( requestEntries );
        print( "" );
        this.printRequestEntriesValues( requestEntries );
    }

    this.printRequestEntriesTimes = function ( requestEntries ) {
        this.printRequestEntryTimes( "Start", requestEntries.StartEntry );
        this.printRequestEntryTimes( "Bad", requestEntries.BadDataEntry );
        this.printRequestEntryTimes( "End", requestEntries.EndEntry );
    }

    this.printRequestEntryTimes = function ( type, requestEntry ) {
        print( type + " Start Time [ " + requestEntry.EarliestTime + " ]" );
        print( type + " End   Time [ " + requestEntry.LatestTime + " ]" );
    }

    this.printRequestEntriesNodes = function ( requestEntries ) {
        this.printRequestEntryNodes( "Start", requestEntries.StartEntry );
        this.printRequestEntryNodes( "End", requestEntries.EndEntry );
        this.printRequestEntryNodes( "Bad", requestEntries.BadDataEntry );
    }

    this.printRequestEntryNodes = function ( type, requestEntry ) {

        print( type + " NodeIds" );
        for ( var index = 0; index < requestEntry.Request.NodesToRead.length; index++ ) {
            print( "Index [" + index + "] Node Id " + requestEntry.Request.NodesToRead[ index ].NodeId.toString() );
        }
    }




    this.printRequestEntriesValues = function ( requestEntries ) {

        // Need to do this for each node.
        for ( var index = 0; index < requestEntries.StartEntry.Nodes.length; index++ ) {
            var nodeIdString = requestEntries.StartEntry.Nodes[ index ].Name;
            print( "\r\nValues for NodeId " + nodeIdString + "\r\n" );

            var valueMap = new KeyPairCollection();

            this.printRequestEntryValues( "Start", requestEntries.StartEntry, valueMap, index );
            this.printBadDataDetails( requestEntries.BadDataEntry, index );
            this.printRequestEntryValues( "Bad", requestEntries.BadDataEntry, valueMap, index );
            this.printRequestEntryValues("End", requestEntries.EndEntry, valueMap, index);

            this.printRequestEntryMapValues(valueMap, nodeIdString);
        }
    }

    this.printBadDataDetails = function ( requestEntry, nodeIndex ) {

        var node = requestEntry.Nodes[ nodeIndex ];

        print( "\r\nBad Entry Details - Node " + node.Name );

        if ( isDefined( node.ConfiguredBadDataTime ) ) {
            print( "Configured Bad Data Time " + node.ConfiguredBadDataTime.toString() );
        } else {
            print( "Unconfigured Bad Data Time" );
        }

        if ( isDefined( node.FoundContiguousBadData ) ) {
            if ( node.FoundContiguousBadData ) {
                if ( isDefined( node.ContiguousBadData ) ) {
                    // There must be data
                    var historyData = requestEntry.RawResults[ nodeIndex ].HistoryData.toHistoryData();

                    print( "Bad Data starts at index [" + node.ContiguousBadData.StartIndex + "] = " +
                        historyData.DataValues[ node.ContiguousBadData.StartIndex ].SourceTimestamp.toString() );
                    print( "Bad Data ends at index [" + node.ContiguousBadData.EndIndex + "] = " +
                        historyData.DataValues[ node.ContiguousBadData.EndIndex ].SourceTimestamp.toString() + "\r\n " );
                } else {
                    print( "No contiguous bad data" );
                }
            } else {
                print( "No Bad Data found" );
            }
        } else {
            print( "Contiguous Bad Data not found" );
        }
    }

    this.printRequestEntryValues = function ( type, requestEntry, valueMap, itemIndex ) {

        var historyData = requestEntry.RawResults[ itemIndex ].HistoryData.toHistoryData();

        if ( historyData ) {

            var values = historyData.DataValues;

            print( "\r\n" + type + " has " + values.length + " values\r\n" );

            for ( var index = 0; index < values.length; index++ ) {
                var value = values[ index ];
                var timeStamp = value.SourceTimestamp.toString();

                print( "Index [" + index + "] Source timestamp = " + timeStamp +
                    " Value = " + value.Value.toString() +
                    " status = " + value.StatusCode.toString() );

                if ( valueMap.Get( timeStamp ) == null ) {
                    valueMap.Set( timeStamp, value );
                }
            }
        } else {
            print( "No Values for " + type );
        }
    }

    this.printRequestEntryMapValues = function ( valueMap, nodeId ) {

        var values = valueMap.Values();

        print( "\r\nThere are " + values.length + " unique values for node id " + nodeId + "\r\n" );

        for ( var index = 0; index < values.length; index++ ) {
            var value = values[ index ];
            print( "Source timestamp = " + value.SourceTimestamp.toString() +
                " Value = " + value.Value.toString() +
                " status = " + value.StatusCode.toString() );
        }

    }

    //#endregion
}
