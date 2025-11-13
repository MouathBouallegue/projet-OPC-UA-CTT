/*globals addError, addLog, addWarningOnce, ArrayToFormattedString, Attribute, BuiltInType,
  include, MonitoringMode, NodeIdSettings, print, Read, readSetting, TimestampsToReturn,
  UaDataValue, UaNodeId, UaQualifiedName
*/

include( "./library/Base/warnOnce.js" );
include( "./library/Base/UaVariantToSimpleType.js" );

var __clientHandle = null;
if( __clientHandle === null ) {
    __clientHandle = 0;
}
/* Object holding all parameters needed for a monitored item

    Methods:
        Clone                     = function( MonitoredItems )
        fromNodeIds               = function( Nodes, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        fromSetting               = function( settingName, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        fromSettings              = function( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        SafelySetValueTypeUnknown = function( newValue, sessionObject )
        SafelySetValueTypeKnown   = function( newValue, dataType )
        SetBrowseOptions          = function( browseDirection, includeSubtypes, nodeClassMask, referenceTypeId, resultMask )
        toIdsArray                = function( MonitoredItems )
        toNodeIds                 = function( monitoredItems )
        toString                  = function()
        SetValueMax = function()
        SetValueMin = function()
        SetValueMiddle = function()
        UserReadableName          = returns "<nodeid> (setting: <setting>)"
*/
function MonitoredItem( nodeId, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, nodeSetting ) {
    if( !isDefined( nodeId ) ) throw( "MonitoredItem::nodeId not specified." );

    // Core attributes
    this.NodeSetting = "";
    this.NodeId = null;
    this.ClientHandle = null;
    this.MonitoringMode = MonitoringMode.Reporting;
    this.MonitoredItemId = 0;
    this.IsCreated = false;
    this.DataType = null;
    this.Value = new UaDataValue();
    this.EURange = null;

    // Read() related attributes
    this.AttributeId = Attribute.Value;
    this.DataEncoding = new UaQualifiedName();

    // Array related properties
    this.IndexRange = "";
    this.IsArray = false;
    this.ArrayUpperBound = -1;

    // MonitoredItem related parameters
    this.DiscardOldest = true;
    this.Filter = null;
    this.QueueSize = 1;
    this.SamplingInterval = Settings.ServerTest.Capabilities.FastestSamplingIntervalSupported;
    this.RevisedSamplingInterval = 0;
    this.TimestampsToReturn = TimestampsToReturn.Both;

    // Subscription related parameters
    this.SubscriptionId = 0;

    // Browse related parameters
    this.BrowseDirection = BrowseDirection.Forward;
    this.IncludeSubtypes = false;
    this.NodeClass   = 0xff;
    this.ReferenceTypeId = null;
    this.ResultMask      = BrowseResultMask.All;
    this.ContinuationPoint = null;

    // OBJECT CONSTRUCTOR
    if( arguments.length > 0 )
    {
        if( nodeId                === undefined ) { throw( "[MonitoredItem] Argument error: nodeId cannot be invalid!" ); }
        if( nodeId.IdentifierType === undefined ) { throw( "[MonitoredItem] Argument error: nodeId does not appear to be of type NodeId" ); }
        if( clientHandle          === undefined ) clientHandle = MonitoredItem.GetNextClientHandle();

        this.NodeId = nodeId;
        this.ClientHandle = clientHandle;

        if( attributeId        !== undefined ) { this.AttributeId        = attributeId; }
        if( indexRange         !== undefined ) { this.IndexRange         = indexRange; }
        if( monitorMode        !== undefined ) { this.MonitoringMode     = monitorMode; } 
        if( discardOldest      !== undefined ) { this.DiscardOldest      = discardOldest; }
        if( filter             !== undefined ) { this.Filter             = filter; } 
        if( queue              !== undefined ) { this.QueueSize          = queue; }
        if( interval           !== undefined ) { this.SamplingInterval   = interval; }
        if( timestampsToReturn !== undefined ) { this.TimestampsToReturn = timestampsToReturn; }
        if( nodeSetting        !== undefined ) { this.NodeSetting        = nodeSetting; }
    }// if( arguments.length > 2 )

    this.UserReadableName = this.NodeId + " (setting: " + this.Setting + ")";

    // specifies all of the parameters needed for Browsing a Node.
    this.SetBrowse = function( direction, subtypes, classMask, referenceTypeId, resultsMask )
    {
        this.BrowseDirection = direction;
        this.IncludeSubtypes = subtypes;
        this.NodeClass   = classMask;
        this.ReferenceTypeId = referenceTypeId;
        this.ResultMask      = resultsMask;
    }

    this.toString = function()
    {
        var str = "MonitoredItemId: " + this.MonitoredItemId +
                "; NodeId: " + this.NodeId.toString();
        if( this.Value !== null )
        {
            if( this.Value.DataValues !== undefined )
            {
                str += "; Values: [" + this.Value.DataValues.length + "]";
            }
            else if( this.Value.length !== undefined )
            {
                str += "; Values: [" + this.Value.length + "]";
            }
            else
            {
                str += "; Values: " + this.Value.toString();
            }
        }
        if( this.ClientHandle !== null ){ str += "; ClientHandle: " + this.ClientHandle; }
        if( this.AttributeId !== null ){ str += "; AttributeId: " + this.AttributeId; }
        if( this.IndexRange !== "" ){ str += "; IndexRange: " + this.IndexRange; }
        if( this.DiscardOldest !== null ){ str += "; DiscardOldest: " + this.DiscardOldest; }
        if( this.QueueSize !== null ){ str += "; QueueSize: " + this.QueueSize; }
        if( this.SamplingInterval !== null ){ str += "; SamplingInterval: " + this.SamplingInterval; }
        if( this.TimestampsToReturn !== null ){ str += "; TimestampsToReturn: " + this.TimestampsToReturn; }
        if( this.Filter !== null ){ "; Filter: " + this.Filter; }
        if( this.BrowseDirection !== undefined && this.BrowseDirection !== null ){ str += "\n\tBrowseDirection: " + this.BrowseDirection; }
        if( this.IncludeSubtypes !== undefined && this.IncludeSubtypes !== null ){ str += "; IncludeSubtypes: " + this.IncludeSubtypes; }
        if( this.NodeClass !== undefined && this.NodeClass !== null ){ str += "; NodeClassMask: " + this.NodeClass; }
        if( this.ReferenceTypeId !== undefined && this.ReferenceTypeId !== null ){ str += "; ReferenceTypeId: " + this.ReferenceTypeId; }
        if( this.ResultMask !== undefined && this.ResultMask !== null ){ str += "; ResultMask: " + this.ResultMask; }
        return( str );
    };

    this.SafeNodeId = function() {
        if( this.NodeId === undefined || this.NodeId === null ){ return( "" ); }
        if( this.NodeId.toString().length > 100 ) return( this.NodeId.toString().substring( 0, 99 ) + "... (truncated)" );
        else return( this.NodeId.toString() );
    }

    // Clears the Value, Quality, timestampServer timestampDevice
    // e.g. ClearVQTT( "vqsd" );
    this.ClearVQTT = function( parameterString )
    {
        if( parameterString !== undefined && parameterString !== "" )
        {
            if( parameterString.toLowerCase().indexOf( "v" ) >= 0 )
            {
                print( "\tClearing item Value." );
                this.Value.Value = new UaVariant();
            }
            if( parameterString.toLowerCase().indexOf( "q" ) >= 0 )
            {
                print( "\tClearing item StatusCode." );
                this.Value.StatusCode.StatusCode = -1;
            }
            if( parameterString.toLowerCase().indexOf( "s" ) >= 0 )
            {
                print( "\tClearing item ServerTimestamp." );
                this.Value.ServerTimestamp = new UaDateTime();
            }
            if( parameterString.toLowerCase().indexOf( "d" ) >= 0 )
            {
                print( "\tClearing item SourceTimestamp." );
                this.Value.SourceTimestamp = new UaDateTime();
            }
        }
    }

    // Clones *this* object
    this.clone = function( args ) {
        return( MonitoredItem.Clone( this, args ) );
    }

    /*  Nathan Pocock; compliance@opcfoundation.org
        This function will set the value of the monitoredItem safely. It does this by correctly specifying the 
        data-type when setting value. A read is performed of the item first to retrieve the current value, which
        in turn will also provide the data-type information that we need to know.
        Function returns TRUE/FALSE to indicate success/fail.
    */
    this.SafelySetValueTypeUnknown = function( newValue, sessionObject ) {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetValueTypeUnknown() argument count error." ); }
        if( newValue === null || newValue === undefined || sessionObject === undefined || sessionObject === null ) { throw ("MonitoredItem.SafelySetValueTypeUnknown() argument null error." ); }
        var result = true; //return code
        var readHelper = new ReadService( { Session: sessionObject } );
        result = readHelper.Execute( { NodesToRead: this } );
        if( result ) setValue( this, newValue, this.Value.Value.DataType );
        return( result );
    };
    
    /*  Nathan Pocock; compliance@opcfoundation.org
        This function will correctly set the value of the node based on the specified data-type
    */
    this.SafelySetValueTypeKnown = function( newValue, dataType ) {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetValueTypeKnown() argument count error." ); }
        if( newValue === null || newValue === undefined || dataType === null || dataType === undefined ) { throw ("MonitoredItem.SafelySetValueTypeKnown() argument null error. [NewValue]=" + newValue + "; [dataType]=" + dataType + " (" + BuiltInType.toString( dataType ) + ")" ); }
        setValue( this, newValue, dataType );
        this.Value.ServerTimestamp = new UaDateTime();
        this.Value.SourceTimestamp = new UaDateTime();
    };
    
    this.SafelySetArrayTypeKnown = function( newValue, dataType )
    {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetArrayTypeKnown() argument count error." ); }
        if( newValue === null || newValue === undefined || dataType === null || dataType === undefined ) { throw ("MonitoredItem.SafelySetArrayTypeKnown() argument null error." ); }
        setValue( this, newValue, dataType, true );
    };

    this.SetBrowseOptions = function( browseDirection, includeSubtypes, nodeClassMask, referenceTypeId, resultMask )
    {
        if( browseDirection !== null ){ this.BrowseDirection = browseDirection; }
        if( includeSubtypes !== null ){ this.IncludeSubtypes = includeSubtypes; }
        if( nodeClassMask   !== null ){ this.NodeClass       = nodeClassMask; }
        if( referenceTypeId !== null ){ this.ReferenceTypeId = referenceTypeId; }
        if( resultMask      !== null ){ this.ResultMask      = resultMask; }
    };
};


/*  Takes an array of Nodes (UaNodes) and returns an array of  MonitoredItems.
    Parameters: 
        - Nodes              - array of NodeIds.
        - AttributeId        - AttributeId value.
        - IndexRange         - IndexRange string.
        - MonitorMode        - MonitoringMode value.
        - DiscardOldest      - True/False to DiscardOldest.
        - Filter             - Filter value.
        - Queue              - QueueSize value.
        - Interval           - Interval value.
        - TimestampsToReturn - TimestampsToReturn value.
*/
MonitoredItem.fromNodeIds = function( Nodes, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn ) {
    if( arguments.length < 1 ) throw( "ERROR, 1 PARAMETER REQUIRED! 'fromNodeIds'" );
    var monItems = [];
    if( Nodes !== null && Nodes !== undefined ) {
        if( Nodes.length === undefined ) Nodes = [ Nodes ];
        for( var i=0; i<Nodes.length; i++ ) {
            var newMI = new MonitoredItem( Nodes[i], MonitoredItem.GetNextClientHandle(), attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn );
            monItems.push( newMI );
        }
    }
    return monItems;
};

MonitoredItem.fromUaRefDescHelper = function( nodeId, browseDirection, includeSubTypes, helperObject ) {
    var m = new MonitoredItem( nodeId, 1 );
    m.BrowseDirection = browseDirection;
    m.IncludeSubtypes = includeSubTypes;
    m.NodeClass = helperObject.NodeClass;
    m.ReferenceTypeId = helperObject.ReferenceTypeId;
    return( m );
}

MonitoredItem.fromSetting  = function( settingName,  clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn ) {
    var mi = null;
    if( arguments.length < 1 ) throw( "Invalid argument length. Must specify a SettingName." );
    var settingValue = readSetting( settingName );
    if( settingValue !== undefined ) settingValue = settingValue.toString();
    if( settingValue !== undefined && settingValue !== "undefined" && settingValue.length > 0 ) {
        if( clientHandle === undefined || clientHandle === null || clientHandle === NaN ) clientHandle = MonitoredItem.GetNextClientHandle();
        var n = UaNodeId.fromString( settingValue );
        if( isDefined( n ) ) {
            mi = new MonitoredItem( n, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn );
            mi.NodeSetting = settingName;
        }
        else _warning.store( "Setting not configured properly: '" + settingName + "'.", undefined, true );
    }
    else _log.store( "Setting not configured: '" + settingName + "'.", undefined, true );
    return( mi );
};

MonitoredItem.fromSettings = function( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings, maxNumberNeeded ) {
    var mis = [];
    var floatItem;
    // make sure 'settingNames' is always an array!
    if (settingNames.push === undefined) settingNames = [settingNames];
    if (settingNames.length === 0) return (null);
    for (var s = 0; s < settingNames.length; s++) {
        if (settingNames[s].toString().search("Float") !== -1) {
            floatItem = settingNames[s];
            //addLog("This is a float, adding it at the end of the list to prevent other scripts from failing due to a resolution issue in the CTT for floats!");
            continue;
        }
        var mi = MonitoredItem.fromSetting(settingNames[s], undefined, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings);
        if (mi !== undefined && mi !== null) {
            mis.push(mi);
        }
    }
    if (floatItem !== undefined) {
        var mi = MonitoredItem.fromSetting(floatItem, undefined, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings);
        if (mi !== undefined && mi !== null) {
            mis.push(mi);
        }
    }
    if (maxNumberNeeded !== undefined && maxNumberNeeded !== null) {
        while (mis.length > maxNumberNeeded) mis.pop();
    }
    if ((Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems < mis.length) && (Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems != 0)) {
        while (mis.length > Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems) mis.pop();
    }
    return (mis);
};

MonitoredItem.GetAttributesAsNodes = function( nodeToClone, attributes ) {
    var nodes = [];
    for( a in attributes ) {
        var newNode = nodeToClone.clone();
        newNode.AttributeId = attributes[a];
        nodes.push( newNode );
    }
    return( nodes );
}

// takes an array of MonitoredItem objects and returns an array of NodeIds.
MonitoredItem.toNodeIds = function( monitoredItems )
{
    var nodeIds = [];
    if( monitoredItems !== undefined && monitoredItems !== null )
    {
        if( monitoredItems.length === undefined ){ monitoredItems = [monitoredItems]; }
        for( var mic=0; mic<monitoredItems.length; mic++ )
        {
            nodeIds.push( monitoredItems[mic].NodeId );
        }
    }
    return( nodeIds );
}

// Takes an array of MonitoredItems, and returns an array of JUST
// the monitoredItemIds (an array of Ints)
MonitoredItem.toIdsArray = function( MonitoredItems ) {
    var results = [];
    var currentPosition = 0;
    if( MonitoredItems !== undefined && MonitoredItems !== null ) {
        if( MonitoredItems.length !== undefined ) {
            for( var i=0; i<MonitoredItems.length; i++ ) results[currentPosition++] = MonitoredItems[i].MonitoredItemId;
        }
    }
    return( results );
};

/* Returns a specific number of monitored item objects, based on the values specified: 
   Number: how many items to return.
   Settings: which settings to use and clone-repeatedly */
MonitoredItem.GetRequiredNodes = function( args ) {
    if( args === undefined || args === null ) throw ( "MonitoredItem.GetRequiredNodes: args not specified." );
    if( args.Number === undefined || args.Number === null ) throw ( "MonitoredItem.GetRequiredNodes: number not specified." );
    if( args.SkipCreateSession === undefined || args.SkipCreateSession === null ) args.SkipCreateSession = false;
    
    if( args.Settings === undefined || args.Settings === null ) {
        var temp_settings = Settings.ServerTest.NodeIds.Static.All();
    }
    else {
        var temp_settings = JSON.parse( JSON.stringify( args.Settings ) ); // cloning args.Settings to not modify the passed ones by reference
    }
    
    for( var i=0; i<temp_settings.length; i++ ) if( isDefined( temp_settings[i] ) && readSetting( temp_settings[i] ).toString().length < 3 ) { temp_settings.splice( i, 1 ); i--; }
    if( args.Writable == true ) temp_settings = filterSettings( { SkipCreateSession: args.SkipCreateSession, Settings: temp_settings } );
    if( !isDefined( temp_settings ) ) return ( [] );
    var r = [];
    var i = args.Number;
    var o = 0;
    while( r.length < args.Number ){
        r = r.concat( temp_settings );
        if(o > i){break;}
        o++;
    }
    // now remove any excess
    while( r.length > args.Number ) r.pop();
    var items = [];
    for( var i=0; i<r.length; i++ ) items.push( MonitoredItem.fromSetting( r[i], 1 + i ) );
    return( items );
}

// Returns a duplicate of the specified MonitoredItem(s)
// args parameters:
//     IncludeValue 
MonitoredItem.Clone = function( MonitoredItems, args ) {
    if( MonitoredItems === undefined || MonitoredItems === null ) return( null );
    // single item?
    if( MonitoredItems.MonitoredItemId !== undefined ) {
        var newMi = new MonitoredItem( MonitoredItems.NodeId, MonitoredItems.ClientHandle, MonitoredItems.AttributeId,
            MonitoredItems.IndexRange, MonitoredItems.MonitoringMode, MonitoredItems.DiscardOldest,
            MonitoredItems.Filter, MonitoredItems.QueueSize, MonitoredItems.SamplingInterval, 
            MonitoredItems.TimestampsToReturn, MonitoredItems.NodeSetting );
        newMi.DataType = MonitoredItems.DataType;
        newMi.ClientHandle = MonitoredItem.GetNextClientHandle();
        newMi.NodeClass = MonitoredItems.NodeClass;
        newMi.Value = MonitoredItems.Value.clone();
        return( newMi );
    }
    else if( MonitoredItems.NodeId !== undefined ) {
        var newMi = new MonitoredItem( MonitoredItems.NodeId, MonitoredItem.GetNextClientHandle(), MonitoredItems.AttributeId );
        newMi.ClientHandle = MonitoredItem.GetNextClientHandle();
        return( newMi );
    }
    else if( MonitoredItems.length !== undefined ) {
        var mis = [];
        for( var m=0; m<MonitoredItems.length; m++ ) {
            mis[m] = new MonitoredItem( MonitoredItems[m].NodeId, MonitoredItems[m].ClientHandle,
                MonitoredItems[m].AttributeId, MonitoredItems[m].IndexRange, MonitoredItems[m].MonitoringMode,
                MonitoredItems[m].DiscardOldest, MonitoredItems[m].Filter, MonitoredItems[m].QueueSize,
                MonitoredItems[m].SamplingInterval, MonitoredItems[m].TimestampsToReturn, MonitoredItems[m].NodeSetting );
            mis[m].DataType = MonitoredItems[m].DataType;
            mis[m].ClientHandle = MonitoredItem.GetNextClientHandle();
            if( isDefined( args ) && isDefined( args.IncludeValue ) && args.IncludeValue ) mis[m].Value = MonitoredItems[m].Value.clone();
        }
        return( mis );
    }
    else return( null );
};

// Returns an array of strings where each string contains the settingName for each 
// monitoredItem specified in the parameter
MonitoredItem.GetSettingNames = function( MonitoredItems )
{
    var results = [];
    if( MonitoredItems !== undefined && MonitoredItems !== null )
    {
        if( MonitoredItems.length === undefined )
        {
            // turn this into an array
            MonitoredItems = [MonitoredItems];
        }
        for( var i=0; i<MonitoredItems.length; i++ )
        {
            results[i] = MonitoredItems[i].NodeSetting;
        }
    }
    return( results );
};

/**
 * This function can be used to set a new value to a MonitoredItem object.
 * 
 * @param node - (Required) A MonitoredItem object
 * @param newValue - (Required) The value that should be set. It can either be a scalar or an array
 * @param dataType - (Required) The Datatype of the new value. dataType and newValue must match, otherwise the function will fail unhandled.
 * @param isArray - (Optional) If not set, it is expected that the new value is a scalar. isArray and newValue must match, otherwise the function will fail unhandled.
 * 
 * @returns Void.
 */
function setValue( node, newValue, dataType, isArray ) {
    if( isArray === undefined || isArray === false ) {
        switch( dataType ) {
            case BuiltInType.Boolean:    node.Value.Value.setBoolean( newValue ); break;
            case BuiltInType.Byte:       node.Value.Value.setByte( newValue ); break;
            case BuiltInType.ByteString: {
                try{ node.Value.Value.setByteString( newValue ); }
                catch( ex ) { node.Value.Value.setByteString( newValue ); }
                break;
            }
            case BuiltInType.DateTime:       if( newValue === 0 ) newValue = UaDateTime.utcNow(); node.Value.Value.setDateTime( newValue ); break;
            case BuiltInType.Double:         node.Value.Value.setDouble( newValue ); break;
            case Identifier.Duration:        node.Value.Value.setDouble( newValue ); break;
            case BuiltInType.ExtensionObject:node.Value.Value.setExtensionObject( newValue ); break;
            case BuiltInType.Float:          node.Value.Value.setFloat( newValue ); break;
            case BuiltInType.Guid:           node.Value.Value.setGuid( newValue ); break;
            case BuiltInType.Int16:          node.Value.Value.setInt16( newValue ); break;
            case BuiltInType.Int32:          node.Value.Value.setInt32( newValue ); break;
            case BuiltInType.Int64:          node.Value.Value.setInt64( newValue ); break;
            case BuiltInType.LocalizedText:  node.Value.Value.setLocalizedText( newValue ); break;
            case Identifier.NodeId:          node.Value.Value.setNodeId( newValue ); break;
            case Identifier.Number:          node.Value.Value.setUInt16( newValue ); break;
            case BuiltInType.QualifiedName:  node.Value.Value.setQualifiedName( newValue ); break;
            case BuiltInType.SByte:          node.Value.Value.setSByte( newValue ); break;
            case BuiltInType.StatusCode:     node.Value.Value.setStatusCode( newValue ); break;
            case BuiltInType.String:         node.Value.Value.setString( newValue ); break;
            case BuiltInType.UInt16:         node.Value.Value.setUInt16( newValue ); break;
            case BuiltInType.UInt32:         node.Value.Value.setUInt32( newValue ); break;
            case BuiltInType.UInt64:         node.Value.Value.setUInt64( newValue ); break;
            case BuiltInType.UtcTime:        if( newValue === 0 ) newValue = UaDateTime.utcNow(); node.Value.Value.setDateTime( newValue ); break;
            case BuiltInType.XmlElement:     node.Value.Value.setXmlElement( newValue ); break;
            default:
                addError( "Invalid data-type: '" + dataType + "' (" + BuiltInType.toString( dataType ) + "). Value is unchanged. Associated NodeId: " + node.NodeId );
        }
    }
    else {
        // make sure the newValue is an array, if not then force it to become one
        if( newValue.length === undefined ){ newValue = [newValue]; }
        switch( dataType ) {
            case BuiltInType.Boolean:
                var x = new UaBooleans();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setBooleanArray( x );
                break;
            case BuiltInType.Byte:
                var x = new UaBytes();
                for( var i = 0; i < newValue.length; i++ ) { x[i] = newValue[i]; }
                node.Value.Value.setByteArray( x );
                break;
            case BuiltInType.ByteString:
                var x = new UaByteStrings();
                for( var i = 0; i < newValue.length; i++ ) { x[i] = newValue[i]; }
                node.Value.Value.setByteStringArray( x );
                break;
            case BuiltInType.SByte:
                var x = new UaSBytes();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setSByteArray( x );
                break;
            case BuiltInType.Int16:
                var x = new UaInt16s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt16Array( x );
                break;
            case BuiltInType.Int32:
                var x = new UaInt32s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt32Array( x );
                break;
            case BuiltInType.Int64:
                var x = new UaInt64s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt64Array( x );
                break;
            case BuiltInType.UInt16:
                var x = new UaUInt16s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt16Array( x );
                break;
            case BuiltInType.UInt32:
                var x = new UaUInt32s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt32Array( x );
                break;
            case BuiltInType.UInt64:
                var x = new UaUInt64s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt64Array( x );
                break;
            case BuiltInType.Double:
                var x = new UaDoubles();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setDoubleArray( x );
                break;
            case Identifier.Duration:
                var x = new UaDoubles();
                for( var i = 0; i < newValue.length; i++ ) { x[i] = newValue[i]; }
                node.Value.Value.setDoubleArray( x );
                break;
            case BuiltInType.Float:
                var x = new UaFloats();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setFloatArray( x );
                break;
            case BuiltInType.DateTime:
                if( newValue === 0 )
                {
                    newValue = UaDateTime.utcNow();
                }
                var x = new UaDateTimes();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setDateTimeArray( x );
                break;
            case BuiltInType.String:
                var x = new UaStrings();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setStringArray( x );
                break;
            case BuiltInType.ExtensionObject:
                var x = new UaExtensionObjects();
                for( var i = 0; i < newValue.length; i++ ) { x[i] = newValue[i]; }
                node.Value.Value.setExtensionObjectArray( x );
                break;
            case BuiltInType.XmlElement:
                var x = new UaXmlElements();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setXmlElementArray( x );
                break;
            default:
                addError( "Invalid Array data-type: '" + dataType + "' (" + BuiltInType.toString( dataType ) + "). No value set (leaving existing value in place)." );
        }
    }
}

MonitoredItem.GetNextClientHandle = function()
{
    return( ++__clientHandle );
}

/* Returns a string of values: parameters
    - Items - [array] of monitoredItem type */
MonitoredItem.GetValuesToString = function( args ) { 
    var s = "";
    if( isDefined( args ) && isDefined( args.Items ) ) {
        if( !isDefined( args.Items.length ) ) args.Items = [ args.Items ];
        for( var i=0; i<args.Items.length; i++ ) {
            s += "[" + i + "] " + args.Items[i].Value.Value.toString() + "; ";
        }
    }
    return( s );
}// MonitoredItem.GetValuesToString = function( args ) 

// Creates an array of MonitoredItem objects from an Array of BrowsePathTargets (TranslateBrowsePathsToNodeIds)
// Parameters:
//    - BrowsePathTargets [UaBrowsePathTargets]:
MonitoredItem.FromBrowsePathTargets = function( args ) {
    var items = [];
    if( isDefined( args ) && isDefined( args.BrowsePathTargets ) && isDefined( args.BrowsePathTargets.length ) ) {
        var nodeIds = []; // place to store the node ids
        for( var i=0; i<args.BrowsePathTargets.length; i++ ) nodeIds.push( args.BrowsePathTargets[i].NodeId.NodeId );
        items = MonitoredItem.fromNodeIds( nodeIds );
    }
    return( items );
}

// Creates an array of MonitoredItem objects from an array of BrowsePathResults.
// Parameters:
//    - BrowsePathResults [UaBrowsePathResults]: 
MonitoredItem.FromBrowsePathResults = function( args ) {
    var items = [];
    if( isDefined( args ) && isDefined( args.BrowsePathResults ) && isDefined( args.BrowsePathResults.length ) ) {
        var nodeIds = []; // place to store the node ids
        for( var i=0; i<args.BrowsePathResults.length; i++ ) {
            for( var t=0; t<args.BrowsePathResults[i].Targets.length; t++ ) nodeIds.push( args.BrowsePathResults[i].Targets[t].TargetId.NodeId );
        }
        items = MonitoredItem.fromNodeIds( nodeIds );
    }
    return( items );
}

MonitoredItem.fromSettingsExt = function( args ) {
    //function( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings, maxNumberNeeded ) {
    var mis = [];
    var floatItem;
    // make sure 'settingNames' is always an array!
    if( args.Settings.push === undefined ) args.Settings = [args.Settings];
    if( args.Writable == true ) args.Settings = filterSettings( { Settings: args.Settings, SkipCreateSession: args.SkipCreateSession } );
    if( !isDefined( args.Settings ) || args.Settings.length === 0 ) return ( [] );
    for( var s = 0; s < args.Settings.length; s++ ) {
        if( args.Settings[s].toString().search( "Float" ) !== -1 ) {
            floatItem = args.Settings[s];
            //addLog("This is a float, adding it at the end of the list to prevent other scripts from failing due to a resolution issue in the CTT for floats!");
            continue;
        }
        var mi = MonitoredItem.fromSetting( args.Settings[s], args.ClientHandle, args.AttributeId, args.IndexRange, args.MonitorMode, args.DiscardOldest, args.Filter, args.Queue, args.Interval, args.TimestampsToReturn, args.SuppressWarnings );
        if( mi !== undefined && mi !== null ) {
            mis.push( mi );
        }
    }
    if( floatItem !== undefined ) {
        var mi = MonitoredItem.fromSetting( floatItem, args.ClientHandle, args.AttributeId, args.IndexRange, args.MonitorMode, args.DiscardOldest, args.Filter, args.Queue, args.Interval, args.TimestampsToReturn, args.SuppressWarnings );
        if( mi !== undefined && mi !== null ) {
            mis.push( mi );
        }
    }
    if( args.MaxNumberNeeded !== undefined && maxNumberNeeded !== null ) {
        while( mis.length > args.MaxNumberNeeded ) mis.pop();
    }
    if( ( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems < mis.length ) && ( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems != 0 ) ) {
        while( mis.length > Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems ) mis.pop();
    }
    return ( mis );
};

function filterSettings( args ) {
    var fS_settings = args.Settings;
    var skipSession = args.SkipCreateSession;
    var fS_filteredSettings = [];
    var ownChannel = false;
    var ownSession = false;

    if( !isDefined( fS_settings ) || fS_settings == null ) {
        addError( "Argument fS_settings is missing in function selectWritableItems" );
        return ( null );
    }
    var fS_items = MonitoredItem.fromSettingsExt( { Settings: fS_settings } );
    if( !isDefined( fS_items ) || fS_items.length == 0 ) {
        print( "Setting (" + fS_settings + ") is not defined." );
        return ( null );
    }
    if( !isDefined( skipSession ) || skipSession == null ) skipSession = false;
    // we need to take a look on the AccessLevel of the nodes
    for( var i = 0; i < fS_items.length; i++ ) {
        fS_items[i].AttributeId = Attribute.UserAccessLevel;
    }
    // we need a session to read the AccessLevel, so let us check whether we are connected to server
    if( isDefined( Test.Channel ) ) {
        if( Test.Channel.Channel.IsConnected == true ) {
            // do we need to open a new session?
            if( skipSession == false ) {
                writableItemsSession = new CreateSessionService( { Channel: Test.Channel } );
                if( !writableItemsSession.Execute() ) return ( null );
                if( !ActivateSessionHelper.Execute( {
                    Session: writableItemsSession
                } ) ) {
                    CloseSessionHelper.Execute( { Session: writableItemsSession, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
                    return ( false );
                }
                else {
                    ownSession = true;
                    InstanciateHelpers( { Session: writableItemsSession } );
                }
            }
        }
        else {
            Test.Connect();
            ownChannel = true;
        }
    }
    else {
        Test.Connect();
        ownChannel = true;
    }
    // now we can read the AccessLevel
    ReadHelper.Execute( { NodesToRead: fS_items, SuppressMessaging: true } );
    // let`s find the all the writable items
    for( var i = 0; i < fS_items.length; i++ ) {
        if( ( AccessLevel.CurrentRead | AccessLevel.CurrentWrite ) == ( fS_items[i].Value.Value.toByte() & ( AccessLevel.CurrentRead | AccessLevel.CurrentWrite ) ) ) {
            fS_filteredSettings.push( fS_items[i].NodeSetting );
        }
    }
    // did we open a new Session? If yes let's close it.
    if( ownSession == true ) {
        CloseSessionHelper.Execute( { Session: writableItemsSession } );
    }
    // did we open a new Channel= If yes let's close it.
    if( ownChannel == true ) {
        Test.Disconnect( { SkipCloseSession: false } );
    }
    return ( fS_filteredSettings );
}