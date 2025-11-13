var gServerCapabilities;
if( gServerCapabilities === undefined ) {
    gServerCapabilities = new Object();
}

gServerCapabilities = { 
    _configured: false,
    Debug: parseInt( readSetting( "/Server Test/NodeIds/Static/HA Profile/Debug" ) ) !== 0 ? true : false,
    Endpoints: [],
    MaxStringLength: parseInt( readSetting( "/Server Test/Capabilities/Max String Length" ).toString() ),
    MaxSecureChannels: parseInt( readSetting( "/Server Test/Capabilities/Max SecureChannels" ).toString() ),
    MaxSupportedSubscriptions: parseInt( readSetting( "/Server Test/Capabilities/Max Supported Subscriptions" ).toString() ),
    MaxSupportedMonitoredItems: parseInt( readSetting( "/Server Test/Capabilities/Max Supported MonitoredItems" ).toString() ),
    MaxPublishRequestsPerSession: parseInt( readSetting( "/Server Test/Capabilities/Max Publish Requests per Session" ).toString() ),
    FastestPublishIntervalSupported: parseInt( readSetting( "/Server Test/Capabilities/Fastest Publish Interval Supported" ).toString() ),
    FastestSamplingIntervalSupported: parseInt( readSetting( "/Server Test/Capabilities/Fastest Sampling Interval Supported" ).toString() ),
    RetransmissionQueueSizePerSession: parseInt( readSetting( "/Server Test/Capabilities/Retransmission QueueSize per Session" ).toString() ),
    SecurityNone_Enabled: parseInt( readSetting( "/Server Test/Capabilities/SecurityNone Enabled" ) ) !== 0 ? true : false,
    ServerDiagnostics_EnabledFlag:  parseInt( readSetting( "/Server Test/DiagnosticInfo Response Testing" ) ) !== 0 ? true : false,

    toString: function() {
        var str = "ServerCapabilities (cached):\n";
        for( var s in this ) {
            if( typeof this[s] != "function" ) str += "\t" + s + ": " + this[s] + "\n";
        }
        return( str );
    },

    // Retrieves the capabilities of the Server.
    GetServerCapabilties: function( session ) {
        // only do this once, so use our "Configured" flag
        if( this._configured ) return( false );
        if( session === undefined || session === null ) throw( "gServerCapabilitiesCache::GetServerCapabilties() session not specified." );
        var ReadHelper = new ReadService( { Session: session } );
        print( "Obtaining the ServerCapabilities..." );
        
        // read and set OperationLimits.MaxNodesPerRead first, so the upcoming Read will work if it's below 44
        var maxNodesPerReadInfo = MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRead ) ] )[0];
        if( ReadHelper.Execute( { NodesToRead: maxNodesPerReadInfo, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ), SuppressMessaging: true } ) ) {
            this.OperationLimits = new Object();
            this.OperationLimits.MaxNodesPerRead = maxNodesPerReadInfo.Value.Value.toUInt32();
        }

        // we know the nodeIds, so just try and read them directly while expecting all to succeed because they're mandatory
        var items = MonitoredItem.fromNodeIds( [ 
                // server capabilities
                new UaNodeId( Identifier.Server_ServerCapabilities ),
                new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ),
                new UaNodeId( Identifier.Server_ServerCapabilities_ServerProfileArray ),
                new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray ),
                new UaNodeId( Identifier.Server_ServerCapabilities_MinSupportedSampleRate ),
                new UaNodeId( Identifier.Server_ServerCapabilities_MaxBrowseContinuationPoints ),
                new UaNodeId( Identifier.Server_ServerCapabilities_MaxQueryContinuationPoints ),
                new UaNodeId( Identifier.Server_ServerCapabilities_MaxHistoryContinuationPoints ),
                new UaNodeId( Identifier.Server_ServerCapabilities_SoftwareCertificates ),
                new UaNodeId( Identifier.Server_ServerCapabilities_MaxArrayLength ),                // 9
                new UaNodeId( Identifier.Server_ServerCapabilities_MaxStringLength ),

                // operation limits
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRead ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerHistoryReadData ),       // not defined
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerHistoryReadEvents ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerWrite ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerHistoryUpdateData ),     // not defined (15)
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerHistoryUpdateEvents ),   // not defined
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerMethodCall ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerBrowse ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRegisterNodes ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerTranslateBrowsePathsToNodeIds ), //20
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerNodeManagement ),
                new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxMonitoredItemsPerCall ),

                // history server capabilities
                new UaNodeId( Identifier.HistoryServerCapabilities_AccessHistoryDataCapability ), //23
                new UaNodeId( Identifier.HistoryServerCapabilities_AccessHistoryEventsCapability),
                new UaNodeId( Identifier.HistoryServerCapabilities_MaxReturnDataValues ),
                new UaNodeId( Identifier.HistoryServerCapabilities_MaxReturnEventValues ),
                new UaNodeId( Identifier.HistoryServerCapabilities_InsertDataCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_ReplaceDataCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_UpdateDataCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_DeleteRawCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_DeleteAtTimeCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_InsertEventCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_ReplaceEventCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_UpdateEventCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_DeleteEventCapability ),
                new UaNodeId( Identifier.HistoryServerCapabilities_InsertAnnotationCapability ),

                // server status
                new UaNodeId( Identifier.Server_ServerStatus_BuildInfo ),
                new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ),
                new UaNodeId( Identifier.Server_ServerStatus_SecondsTillShutdown ),
                new UaNodeId( Identifier.Server_ServerStatus_ShutdownReason ),
                new UaNodeId( Identifier.Server_ServerStatus_StartTime ),
                new UaNodeId( Identifier.Server_ServerStatus_State ),

                // namespace array
                new UaNodeId( Identifier.Server_NamespaceArray )
                ] );
        // Read all of the above nodes so that we can cache them within our server object
        items[0].AttributeId = Attribute.BrowseName;
        var expectations = [];
        for( var i=0; i<items.length; i++ ) expectations.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) );
        if( ReadHelper.Execute( { NodesToRead: items, OperationResults: expectations, SuppressMessaging: true } ) ) {
            this._configured = true;
            this.ServerDiagnostics_EnabledFlag = items[1].Value.StatusCode.isGood()? UaVariantToSimpleType( items[1].Value.Value ) : false;
            // server capabilities
            this.ServerProfileArray = items[2].Value.Value.toStringArray();
            this.LocaleIdArray = items[3].Value.Value.toStringArray();
            this.DefaultLocaleId = "";
            if ( isDefined( this.LocaleIdArray) && isDefined( this.LocaleIdArray.length ) && this.LocaleIdArray.length > 0 ){
                this.DefaultLocaleId = this.LocaleIdArray[0];
            }
            this.MinSupportedSampleRate = items[4].Value.Value.toDouble();
            this.MaxBrowsecontinuationPoints = items[5].Value.Value.toUInt16();
            this.MaxQueryContinuationPoints = items[6].Value.Value.toUInt16();
            this.MaxHistoryContinuationPoints = items[7].Value.Value.toUInt16();
            this.SoftwareCertificates = items[8].Value.Value.clone(); // TODO
            this.MaxArrayLength = items[9].Value.Value.toUInt32();
            this.MaxStringLength = items[10].Value.Value.toUInt32();

            // operation limits
            this.OperationLimits = new Object();
            this.OperationLimits.MaxNodesPerRead = items[11].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerHistoryReadData = items[12].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerHistoryReadEvents = items[13].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerWrite = items[14].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerHistoryUpdateData = items[15].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerHistoryUpdateEvents = items[16].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerMethodCall = items[17].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerBrowse = items[18].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerRegisterNodes = items[19].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerTranslateBrowsePathsToNodeIds = items[20].Value.Value.toUInt32();
            this.OperationLimits.MaxNodesPerNodeManagement = items[21].Value.Value.toUInt32();
            this.OperationLimits.MaxMonitoredItemsPerCall = items[22].Value.Value.toUInt32();

            // history server capabilities
            this.HistoryServerCapabilities = new Object();
            this.HistoryServerCapabilities.AccessHistoryDataCapability = items[23].Value.Value.toBoolean();
            this.HistoryServerCapabilities.AccessHistoryEventsCapability = items[24].Value.Value.toBoolean();
            this.HistoryServerCapabilities.MaxReturnDataValues   = items[25].Value.Value.toUInt32();
            this.HistoryServerCapabilities.MaxReturnEventValues  = items[26].Value.Value.toUInt32();
            this.HistoryServerCapabilities.InsertDataCapability  = items[27].Value.Value.toBoolean();
            this.HistoryServerCapabilities.ReplaceDataCapability = items[28].Value.Value.toBoolean();
            this.HistoryServerCapabilities.UpdateDataCapability  = items[29].Value.Value.toBoolean();
            this.HistoryServerCapabilities.DeleteRawCapability   = items[30].Value.Value.toBoolean();
            this.HistoryServerCapabilities.DeleteAtTimeCapability = items[31].Value.Value.toBoolean();
            this.HistoryServerCapabilities.InsertEventCapability  = items[32].Value.Value.toBoolean();
            this.HistoryServerCapabilities.ReplaceEventCapability = items[33].Value.Value.toBoolean();
            this.HistoryServerCapabilities.UpdateEventCapability  = items[34].Value.Value.toBoolean();
            this.HistoryServerCapabilities.DeleteEventCapability  = items[35].Value.Value.toBoolean();
            this.HistoryServerCapabilities.InsertAnnotationCapability = items[36].Value.Value.toBoolean();

            // server status
            // 5 items here, but we don't need to store them; we just want to read their value and assure the quality is Good.

            // namespace array
            if( items[43].Value.StatusCode.isGood() ) {
                setNamespaceArray( items[43].Value.Value.toStringArray() );
                this.NamespaceArray = items[43].Value.Value.toStringArray();
            }
        }

        if( ReadHelper.Response.Results[0].StatusCode.isBad() ) addNotSupported( "ServerCapabilities are not supported." );
        ReadHelper = null;
    }// this.GetServerCapabilties = function( session )
};