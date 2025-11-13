include( "./library/Information/BuildLocalCacheMap.js" );
include( "./library/PubSub/UADPMessageDissector.js" );

// ConnectionEndpointStatusEnum constants
var PubSubState = new Object();
PubSubState.Disabled = 0;
PubSubState.Paused = 1;
PubSubState.Operational = 2;
PubSubState.Error = 3;
PubSubState.PreOperational = 4;
var PubSubState_Names = [ "Disabled", "Paused", "Operational", "Error", "PreOperational" ];

const DataSetOrderingType_Undefined_0 = 0;
const DataSetOrderingType_AscendingWriterId_1 = 1;
const DataSetOrderingType_AscendingWriterIdSingle_2 = 2;

function refreshModelMap() {
    
    ClearModelCacheHelper.Execute();
    ClearRawDataCacheHelper.Execute();

    Test.Disconnect();
    
    BuildCacheMapServiceHelper = new BuildCacheMapService();
    BuildCacheMapServiceHelper.Execute();
    
    Test.Connect();
    
}

function orderNetworkMessagesBySequenceNumber( networkMessages ) {
    if( !isDefined( networkMessages ) ) throw( "orderNetworkMessagesBySequenceNumber(): No NetworkMessages defined" );
    if( !isDefined( networkMessages.length ) ) throw( "orderNetworkMessagesBySequenceNumber(): Passed NetworkMessages argument is not an array" );
    if( networkMessages.length == 0 ) throw( "orderNetworkMessagesBySequenceNumber(): Passed NetworkMessages array is empty" );
    for( var onm=0; onm<networkMessages.length - 1; onm++ ) {
        if( isDefined( networkMessages[onm].GroupHeader.SequenceNumber ) ) {
            if( networkMessages[onm].GroupHeader.SequenceNumber > networkMessages[onm+1].GroupHeader.SequenceNumber ) {
                var tempNetworkMessage = networkMessages[onm+1];
                networkMessages[onm+1] = networkMessages[onm];
                networkMessages[onm] = tempNetworkMessage;
                onm=0;
            }
        }
        else {
            addWarning( "orderNetworkMessagesBySequenceNumber(): Cannot order the passed NetworkMessages, as at least one of them do not define a SequenceNumber." );
            return networkMessages;
        }
    }
    return( networkMessages );
}

function FindAllInstancesOfType( type, includeSubtypes ) {
    if( !isDefined( type ) ) throw( "FindAllInstancesOfType() No type defined" );
    if( !isDefined( includeSubtypes ) ) var includeSubtypes = true;
    var modelMapHelper = new BuildLocalCacheMapService();
    var modelMap = modelMapHelper.GetModelMap();
    var result = [];
    var Instances = FindObjectsOfTypeHelper.Execute( { TypeToFind: type, IncludeSubTypes: includeSubtypes } );
    if( Instances.result ) {
        var mis = new MonitoredItem.fromNodeIds( Instances.nodes );
        for( var i=0; i < mis.length; i++ ) {
            mis[i].References = modelMap.Get( mis[i].NodeId );
            if( isDefined( mis[i].References ) ) {
                modelMapHelper.FindPaths( mis[i].References );
            }
            if( isDefined( mis[i].References ) && isDefined( mis[i].References.Paths ) ) {
                for ( var s=0; s<mis[i].References.Paths.length; s++ ) if( mis[i].References.Paths[s].indexOf( "/Types/" ) > -1 ) break;
                if( s === mis[i].References.Paths.length ) result.push( mis[i] );
            }
        }
    }
    return result;
}

function ReadAllPropertiesOfItem( mI, toSimpleType ) {
    if( !isDefined( mI ) ) throw( "ReadAllPropertiesOfItem(mI): No MonitoredItem defined to read properties from" );
    if( !isDefined( mI.NodeId ) ) throw( "ReadAllPropertiesOfItem(mI): Passed object appears to not be of type MonitoredItem" );
    if( !isDefined( toSimpleType ) ) var toSimpleType = true;
    var result = new Object();
    // Get all properties of the MonitoredItem
    mI.BrowseDirection = BrowseDirection.Forward;
    mI.ReferenceTypeId = new UaNodeId( Identifier.HasProperty );
    if( BrowseHelper.Execute( { NodesToBrowse: mI } ) ) {
        var allPropertyItems = [];
        for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
            allPropertyItems.push( new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId ) );
            allPropertyItems[allPropertyItems.length - 1].PropertyName = BrowseHelper.Response.Results[0].References[b].BrowseName.Name;
        }
        // Get all property values
        if( allPropertyItems.length > 0 ) {
            if( ReadHelper.Execute( { NodesToRead: allPropertyItems } ) ) {
                for( var s=0; s<allPropertyItems.length; s++ ) {
                    if( toSimpleType ) {
                        try {
                            result[allPropertyItems[s].PropertyName] = UaVariantToSimpleType( allPropertyItems[s].Value.Value );
                        }
                        catch( ex ){
                            result[allPropertyItems[s].PropertyName] = allPropertyItems[s].Value.Value;
                        }
                    }
                    else result[allPropertyItems[s].PropertyName] = allPropertyItems[s].Value.Value;
                }
            }
        }
    }
    return result;
}

function GetMessageSettings( mI ) {
    if( !isDefined( mI ) ) throw( "GetMessageSettings(mI): No MonitoredItem defined to get MessageSettings from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetMessageSettings(mI): Passed object appears to not be of type MonitoredItem" );
    var result = new Object();
    // Browse component MessageSettings
    mI.BrowseDirection = BrowseDirection.Forward;
    mI.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( BrowseHelper.Execute( { NodesToBrowse: mI } ) ) {
        mI_MessageSettings = null;
        for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
            if( BrowseHelper.Response.Results[0].References[b].BrowseName.Name == "MessageSettings" ) {
                mI_MessageSettings = new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId );
                break;
            }
        }
        if( isDefined( mI_MessageSettings ) ) result = ReadAllPropertiesOfItem( mI_MessageSettings );
        else addError( "GetMessageSettings(mI): Can't get MessageSettings from node '" + mI.NodeId + "'. Node has no HasComponent reference to 'MessageSettings'." );
    }
    return( result );
}

function GetDataSetWriterByDataSetWriterId( dataSetWriterId ) {
    if( !isDefined( dataSetWriterId ) ) throw( "GetDataSetWriterByDataSetWriterId(): No dataSetWriterId defined" );
    var result = null;
    var AllDataSetWriterTypeInstances = FindAllInstancesOfType( new UaNodeId( Identifier.DataSetWriterType ) );
    if( AllDataSetWriterTypeInstances.length > 0 ) {
        // Find the DataSetWriter with the desired dataSetWriterId
        for( var i=0; i<AllDataSetWriterTypeInstances.length; i++ ) {
            // Browse property dataSetWriterId
            AllDataSetWriterTypeInstances[i].BrowseDirection = BrowseDirection.Forward;
            if( BrowseHelper.Execute( { NodesToBrowse: AllDataSetWriterTypeInstances[i] } ) ) {
                for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
                    if( BrowseHelper.Response.Results[0].References[b].BrowseName.Name == "DataSetWriterId" ) {
                        var mI_DataSetWriterId = new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId );
                        // Check if the DataSetWriterId of this DataSetWriter is the desired one
                        if( ReadHelper.Execute( { NodesToRead: mI_DataSetWriterId } ) ) {
                            if( mI_DataSetWriterId.Value.Value.toUInt16() == dataSetWriterId ) {
                                result = AllDataSetWriterTypeInstances[i].clone();
                                break;
                            }
                        }
                    }
                }
            }
            if( isDefined( result ) ) break;
        }
    }
    return( result );
}

function GetWriterGroupByWriterGroupId( writerGroupId ) {
    if( !isDefined( writerGroupId ) ) throw( "GetWriterGroupByWriterGroupId(): No writerGroupId defined" );
    var result = null;
    var AllWriterGroupTypeInstances = FindAllInstancesOfType( new UaNodeId( Identifier.WriterGroupType ) );
    if( AllWriterGroupTypeInstances.length > 0 ) {
        // Find the WriterGroup with the desired writerGroupId
        for( var i=0; i<AllWriterGroupTypeInstances.length; i++ ) {
            // Browse property WriterGroupId
            AllWriterGroupTypeInstances[i].BrowseDirection = BrowseDirection.Forward;
            if( BrowseHelper.Execute( { NodesToBrowse: AllWriterGroupTypeInstances[i] } ) ) {
                for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
                    if( BrowseHelper.Response.Results[0].References[b].BrowseName.Name == "WriterGroupId" ) {
                        var mI_WriterGroupId = new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId );
                        // Check if the WriterGroupId of this WriterGroup is the desired one
                        if( ReadHelper.Execute( { NodesToRead: mI_WriterGroupId } ) ) {
                            if( mI_WriterGroupId.Value.Value.toUInt16() == writerGroupId ) {
                                result = AllWriterGroupTypeInstances[i].clone();
                                break;
                            }
                        }
                    }
                }
            }
            if( isDefined( result ) ) break;
        }
    }
    return( result );
}

function GetWriterGroupByWriterGroupIdFromConfig( writerGroupId, config ) {
    if( !isDefined( writerGroupId ) ) throw( "GetWriterGroupByWriterGroupIdFromConfig(): No writerGroupId defined" );
    if( !isDefined( config ) ) throw( "GetWriterGroupByWriterGroupIdFromConfig(): No config defined" );
    var result = [];
    
    if( config.Connections.length > 0 ) {
        for( var wg=0; wg<config.Connections[0].WriterGroups.length; wg++ ) {
            var writerGroup = config.Connections[0].WriterGroups[wg];
            if( writerGroup.WriterGroupId == writerGroupId )  {
                result = writerGroup;
                break;
            }
        }
    }
    else addError( "GetWriterGroupByWriterGroupIdFromConfig(): Given config contains no Connections" );
    
    return( result );
}

function GetDataSetReadersByWriterGroupIdFromConfig( writerGroupId, config ) {
    if( !isDefined( writerGroupId ) ) throw( "GetDataSetReadersByWriterGroupIdFromConfig(): No writerGroupId defined" );
    if( !isDefined( config ) ) throw( "GetDataSetReadersByWriterGroupIdFromConfig(): No config defined" );
    var result = [];
    
    if( config.Connections.length > 0 ) {
        for( var rg=0; rg<config.Connections[0].ReaderGroups.length; rg++ ) {
            for( var dsr=0; dsr<config.Connections[0].ReaderGroups[rg].DataSetReaders.length; dsr++ ) {
                var dataSetReader = config.Connections[0].ReaderGroups[rg].DataSetReaders[dsr];
                if( dataSetReader.WriterGroupId == writerGroupId ) result.push( dataSetReader );
            }
        }
    }
    else addError( "GetDataSetReadersByWriterGroupIdFromConfig(): Given config contains no Connections" );
    
    return( result );
}

function GetMessageSettingsByWriterGroupId( writerGroupId ) {
    if( !isDefined( writerGroupId ) ) throw( "GetMessageSettingsByWriterGroupId(): No writerGroupId defined" );
    var writerGroup = GetWriterGroupByWriterGroupId( writerGroupId );
    if( isDefined( writerGroup ) ) return( GetMessageSettings( writerGroup ) );
    else addLog( "GetMessageSettingsByWriterGroupId(): Can't find WriterGroup with WriterGroupId '" + writerGroupId + "' in the server." );
    return( null );
}

function GetMessageSettingsByDataSetWriterId( dataSetWriterId ) {
    if( !isDefined( dataSetWriterId ) ) throw( "GetMessageSettingsByDataSetWriterId(): No dataSetWriterId defined" );
    var dataSetWriter = GetDataSetWriterByDataSetWriterId( dataSetWriterId );
    if( isDefined( dataSetWriter ) ) return( GetMessageSettings( dataSetWriter ) );
    else addLog( "GetMessageSettingsByDataSetWriterId(): Can't find DataSetWriter with dataSetWriterId '" + dataSetWriterId + "' in the server." );
    return( null );
}

function GetDataSetWritersOfWriterGroup( mI ) {
    if( !isDefined( mI ) ) throw( "GetDataSetWritersOfWriterGroup(mI): No MonitoredItem defined to get DataSetWriters from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetDataSetWritersOfWriterGroup(mI): Passed object appears to not be of type MonitoredItem" );
    var result = [];
    // Browse HasDataSetWriter references
    mI.BrowseDirection = BrowseDirection.Forward;
    mI.ReferenceTypeId = new UaNodeId( Identifier.HasDataSetWriter );
    if( BrowseHelper.Execute( { NodesToBrowse: mI } ) ) {
        for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
            result.push( new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId ) );
            result[b].BrowseName = BrowseHelper.Response.Results[0].References[b].BrowseName;
        }
        if( result.length == 0 ) addLog( "GetDataSetWritersOfWriterGroup(mI): WriterGroupType instance '" + mI.NodeId + "' has no HasDataSetWriter references." );
    }
    return( result );
}

function GetPublisherIdForWriterGroup( mI ) {
    if( !isDefined( mI ) ) throw( "GetPublisherIdForWriterGroup(mI): No MonitoredItem defined to get PublisherId for" );
    if( !isDefined( mI.NodeId ) ) throw( "GetPublisherIdForWriterGroup(mI): Passed object appears to not be of type MonitoredItem" );
    var result = null;
    // Browse inverse HasWriterGroup(IsWriterGroupOf) references
    mI.BrowseDirection = BrowseDirection.Inverse;
    mI.ReferenceTypeId = new UaNodeId( Identifier.HasWriterGroup );
    if( BrowseHelper.Execute( { NodesToBrowse: mI } ) ) {
        var connections = [];
        for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
            connections.push( new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId ) );
        }
        if( connections.length == 0 ) addError( "GetPublisherIdForWriterGroup(mI): Can't get Connection for WriterGroupType instance '" + mI.NodeId + "', as it has no inverse HasWriterGroup(IsWriterGroupOf) reference." );
        else result = ReadAllPropertiesOfItem( connections[0], false ).PublisherId;
    }
    return( result );
}

function orderDataSetWritersbyDataSetOffset( dataSetWriters ) {
    if( !isDefined( dataSetWriters ) ) throw( "orderDataSetWritersbyDataSetOffset(): No DataSetWriter items defined" );
    if( !isDefined( dataSetWriters.length ) ) throw( "orderDataSetWritersbyDataSetOffset(): Passed dataSetWriters argument is not an array" );
    if( dataSetWriters.length == 0 ) throw( "orderDataSetWritersbyDataSetOffset(): Passed dataSetWriters array is empty" );
    // Get DataSetOffset for all dataSetWriters
    for( var i=0; i<dataSetWriters.length; i++ ) dataSetWriters[i].DataSetOffset = GetMessageSettings( dataSetWriters[i] ).DataSetOffset;
    // Order DataSetWriters
    for( var odsw=0; odsw<dataSetWriters.length - 1; odsw++ ) {
        if( isDefined( dataSetWriters[odsw].DataSetOffset ) ) {
            if( dataSetWriters[odsw].DataSetOffset > dataSetWriters[odsw+1].DataSetOffset ) {
                var tempDataSetWriter = dataSetWriters[odsw+1];
                dataSetWriters[odsw+1] = dataSetWriters[odsw];
                dataSetWriters[odsw] = tempDataSetWriter;
                odsw=0;
            }
        }
        else {
            addWarning( "orderDataSetWritersbyDataSetOffset(): Cannot order the passed DataSetWriter items, as the DataSetOffset of at least one of them could not be retrieved." );
            return dataSetWriters;
        }
    }
    return( dataSetWriters );
}

function orderDataSetReaderDataTypesByDataSetOffset( dataSetReaders ) {
    if( !isDefined( dataSetReaders ) ) throw( "orderDataSetReaderDataTypesByDataSetOffset(): No DataSetReaders defined" );
    if( !isDefined( dataSetReaders.length ) ) throw( "orderDataSetReaderDataTypesByDataSetOffset(): Passed dataSetReaders argument is not an array" );
    if( dataSetReaders.length == 0 ) throw( "orderDataSetReaderDataTypesByDataSetOffset(): Passed dataSetReaders array is empty" );
    // Get DataSetOffset for all dataSetReaders
    for( var i=0; i<dataSetReaders.length; i++ ) {
        dataSetReaders[i].DataSetOffset = dataSetReaders[i].MessageSettings.toUadpDataSetReaderMessageDataType().DataSetOffset;
    }
    // Order DataSetReaders
    for( var odsr=0; odsr<dataSetReaders.length - 1; odsr++ ) {
        if( isDefined( dataSetReaders[odsr].DataSetOffset ) ) {
            if( dataSetReaders[odsr].DataSetOffset > dataSetReaders[odsr+1].DataSetOffset ) {
                var tempDataSetReaders = dataSetReaders[odsr+1];
                dataSetReaders[odsr+1] = dataSetReaders[odsr];
                dataSetReaders[odsr] = tempDataSetReaders;
                odsr=0;
            }
        }
        else {
            addWarning( "orderDataSetReaderDataTypesByDataSetOffset(): Cannot order the passed DataSetReader items, as the DataSetOffset of at least one of them could not be retrieved." );
            return dataSetReaders;
        }
    }
    return( dataSetReaders );
}

function GetPublishedDataSetOfDataSetWriter( mI ) {
    if( !isDefined( mI ) ) throw( "GetPublishedDataSetOfDataSetWriter(mI): No MonitoredItem defined to get the PublishedDataSet from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetPublishedDataSetOfDataSetWriter(mI): Passed object appears to not be of type MonitoredItem" );
    var result = null;
    // Browse inverse DataSetToWriter (WriterToDataSet) references
    mI.BrowseDirection = BrowseDirection.Inverse;
    mI.ReferenceTypeId = new UaNodeId( Identifier.DataSetToWriter );
    if( BrowseHelper.Execute( { NodesToBrowse: mI } ) ) {
        for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
            result = new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId );
        }
        if( !isDefined( result ) ) addLog( "GetPublishedDataSetOfDataSetWriter(mI): DataSetWriterType instance '" + mI.NodeId + "' has no inverse DataSetToWriter references." );
    }
    return( result );
}

function calculateDataSetSizeByDataSetMetaData( uaDataSetMetaData ) {
    if( !isDefined( uaDataSetMetaData ) ) throw( "calculateDataSetSizeByDataSetMetaData(): No UaDataSetMetaData object defined to calculate a DataSet size with" );
    var result = 0;
    for( var i=0; i<uaDataSetMetaData.Fields.length; i++ ) {
        var fieldName = uaDataSetMetaData.Fields[i].Name;
        var fieldBuiltInType = uaDataSetMetaData.Fields[i].BuiltInType;
        var fieldValueRank = uaDataSetMetaData.Fields[i].ValueRank;
        var fieldDataTypeSize = 0;
        switch( fieldBuiltInType ) {
            case 1: // Boolean
                fieldDataTypeSize = 1;
                break;
            case 2: // SByte
                fieldDataTypeSize = 1;
                break;
            case 3: // Byte
                fieldDataTypeSize = 1;
                break;
            case 4: // Int16
                fieldDataTypeSize = 2;
                break;
            case 5: // UInt16
                fieldDataTypeSize = 2;
                break;
            case 6: // Int32
                fieldDataTypeSize = 4;
                break;
            case 7: // UInt32
                fieldDataTypeSize = 4;
                break;
            case 8: // Int64
                fieldDataTypeSize = 8;
                break;
            case 9: // UInt64
                fieldDataTypeSize = 8;
                break;
            case 10: // Float
                fieldDataTypeSize = 4;
                break;
            case 11: // Double
                fieldDataTypeSize = 8;
                break;
            case 12: // String
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'String' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 13: // DateTime
                fieldDataTypeSize = 8;
                break;
            case 14: // Guid
                fieldDataTypeSize = 16;
                break;
            case 15: // ByteString
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'ByteString' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 16: // XmlElement
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'XmlElement' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 17: // NodeId
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'NodeId' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 18: // ExpandedNodeId
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'ExpandedNodeId' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 19: // StatusCode
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'StatusCode' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 20: // QualifiedName
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'QualifiedName' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 21: // LocalizedText
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'LocalizedText' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 22: // ExtensionObject
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'ExtensionObject' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 23: // DataValue
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'DataValue' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 24: // Variant
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'Variant' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            case 25: // DiagnosticInfo
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType 'DiagnosticInfo' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' cannot be used in calculating DataSet size yet." );
                break;
            default:
                throw( "calculateDataSetSizeByDataSetMetaData(): BuiltInType of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' is unknown. Cannot calculate DataSet size." );
        }
        switch( fieldValueRank ) {
            case -1:
                result += fieldDataTypeSize;
                break;
            case 1:
                addWarning( "calculateDataSetSizeByDataSetMetaData(): ValueRank '1' of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' is not supported yet. For testing purposes, the size of the array is assumed to be set to 10." );
                result += fieldDataTypeSize * 10;
                break;
            default:
                throw( "calculateDataSetSizeByDataSetMetaData(): ValueRank of Field '" + fieldName + "' of DataSetMetaData '" + uaDataSetMetaData.Name + "' is not supported yet. Cannot calculate DataSet size." );
        }
    }
    // *TODO*: Calculate dataSetSizes from DataSetMetaData
    return result;
}

function GenerateDataSetReadersOfWriterGroupByWriterGroupId( writerGroupId ) {
    if( !isDefined( writerGroupId ) ) throw( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): No writerGroupId defined" );
    var result = new UaDataSetReaderDataTypes();
    var writerGroup = GetWriterGroupByWriterGroupId( writerGroupId );
    
    if( isDefined( writerGroup ) ) {
        var PublisherId = GetPublisherIdForWriterGroup( writerGroup );
        if( isDefined( PublisherId ) ) {
            var dataSetWriters = GetDataSetWritersOfWriterGroup( writerGroup );
            if( dataSetWriters.length > 0 ) {
                for( var dsw=0; dsw<dataSetWriters.length; dsw++ ) {
                    var dataSetWriterProperties = ReadAllPropertiesOfItem( dataSetWriters[dsw] );
                    
                    var dataSetWriterProperties_KeyValuePairs = new UaKeyValuePairs();
                    for( var dswp=0; dswp<dataSetWriterProperties.DataSetWriterProperties.length; dswp++ ) {
                        dataSetWriterProperties_KeyValuePairs[dswp] = dataSetWriterProperties.DataSetWriterProperties[dswp].toKeyValuePair();
                    }
                    
                    var dataSetWriterGroupMessageSettings = GetMessageSettings( writerGroup );
                    // initialize optional MessageSettings of WriterGroup if not available
                    if( !isDefined( dataSetWriterGroupMessageSettings ) ) {
                        dataSetWriterGroupMessageSettings.GroupVersion              = 0;
                        dataSetWriterGroupMessageSettings.DataSetOrdering           = 0;
                        dataSetWriterGroupMessageSettings.NetworkMessageContentMask = 0;
                        dataSetWriterGroupMessageSettings.SamplingOffset            = 0;
                        dataSetWriterGroupMessageSettings.PublishingOffset          = 0;
                    }
                    var dataSetWriterMessageSettings = GetMessageSettings( dataSetWriters[dsw] );
                    // initialize optional MessageSettings of DataSetWriter if not available
                    if( !isDefined( dataSetWriterMessageSettings ) ) {
                        dataSetWriterMessageSettings.DataSetMessageContentMask = 0;
                        dataSetWriterMessageSettings.ConfiguredSize            = 0;
                        dataSetWriterMessageSettings.NetworkMessageNumber      = 0;
                        dataSetWriterMessageSettings.DataSetOffset             = 0;
                    }
                    var dataSetWriterGroupProperties = ReadAllPropertiesOfItem( writerGroup );
                    var publishedDataSet = GetPublishedDataSetOfDataSetWriter( dataSetWriters[dsw] );
                    var publishedDataSetProperties = ReadAllPropertiesOfItem( publishedDataSet );
                    if( isDefined( publishedDataSet ) ) {
                        var dataSetMetaData = publishedDataSetProperties.DataSetMetaData;
                        if( isDefined( dataSetMetaData ) ) {
                            var uaDataSetMetaData = dataSetMetaData.toExtensionObject().toDataSetMetaDataType();
                            // Generate DataSetReader
                            result[dsw] = new UaDataSetReaderDataType();
                             result[dsw].DataSetFieldContentMask = dataSetWriterProperties.DataSetFieldContentMask;
                             result[dsw].DataSetMetaData = uaDataSetMetaData;
                             result[dsw].DataSetReaderProperties = dataSetWriterProperties_KeyValuePairs;
                             result[dsw].DataSetWriterId = dataSetWriterProperties.DataSetWriterId;
                             result[dsw].Enabled = true;
                             result[dsw].HeaderLayoutUri = dataSetWriterGroupProperties.HeaderLayoutUri;
                             result[dsw].KeyFrameCount = ( isDefined( dataSetWriterProperties.KeyFrameCount ) ) ? dataSetWriterProperties.KeyFrameCount : 0;
                             result[dsw].MessageReceiveTimeout = dataSetWriterGroupProperties.KeepAliveTime * result[dsw].KeyFrameCount;
                              var MessageSettings_Object = new UaUadpDataSetReaderMessageDataType();
                               MessageSettings_Object.GroupVersion              = dataSetWriterGroupMessageSettings.GroupVersion;
                               MessageSettings_Object.NetworkMessageNumber      = dataSetWriterMessageSettings.NetworkMessageNumber;
                               MessageSettings_Object.DataSetOffset             = dataSetWriterMessageSettings.DataSetOffset;
                               MessageSettings_Object.DataSetClassId            = ( isDefined( publishedDataSetProperties.DataSetClassId ) ) ? publishedDataSetProperties.DataSetClassId : new UaGuid.fromString( "{00000000-0000-0000-0000-000000000000}" );
                               MessageSettings_Object.NetworkMessageContentMask = dataSetWriterGroupMessageSettings.NetworkMessageContentMask;
                               MessageSettings_Object.DataSetMessageContentMask = dataSetWriterMessageSettings.DataSetMessageContentMask;
                               MessageSettings_Object.PublishingInterval        = dataSetWriterGroupProperties.PublishingInterval;
                               MessageSettings_Object.ReceiveOffset             = -1;
                               MessageSettings_Object.ProcessingOffset          = -1;
                             result[dsw].MessageSettings.setUadpDataSetReaderMessageDataType( MessageSettings_Object );
                             result[dsw].Name = "Reader_" + dataSetWriters[dsw].BrowseName.Name;
                             result[dsw].PublisherId = PublisherId;
                             // *TODO* Implement security
                             result[dsw].SecurityGroupId = "";
                             //result[dsw].SecurityKeyServices =
                             result[dsw].SecurityMode = MessageSecurityMode.None;
                             //result[dsw].SubscribedDataSet =
                             //result[dsw].TransportSettings =
                             result[dsw].WriterGroupId = writerGroupId;
                        }
                        else {
                            addError( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): Can't get DataSetMetaData from PublishedDataSet instance '" + publishedDataSet.NodeId + "'" );
                            return( false );
                        }
                    }
                    else {
                        addError( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): Can't get PublishedDataSet for DataSetWriter instance '" + dataSetWriters[dsw].NodeId + "' from the server." );
                        return( false );
                    }
                }
            }
            else addWarning( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): No HasDataSetWriter references found in WriterGroupType instance '" + writerGroup.NodeId + "'." );
        }
        else {
            addError( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): Can't get PublisherId for WriterGroupType instance '" + writerGroup.NodeId + "' in the server." );
            return( false );
        }
    }
    else {
        addError( "GenerateDataSetReadersOfWriterGroupByWriterGroupId(): Can't find WriterGroupType node with WriterGroupId '" + writerGroupId + "' in the server." );
        return( false );
    }
    return( result );
}

function GetAllWriterGroupIds() {
    var result = [];
    var AllWriterGroupTypeInstances = FindAllInstancesOfType( new UaNodeId( Identifier.WriterGroupType ) );
    if( AllWriterGroupTypeInstances.length > 0 ) {
        // Collect all WriterGroupIds
        for( var i=0; i<AllWriterGroupTypeInstances.length; i++ ) {
            // Browse property WriterGroupId
            AllWriterGroupTypeInstances[i].BrowseDirection = BrowseDirection.Forward;
            if( BrowseHelper.Execute( { NodesToBrowse: AllWriterGroupTypeInstances[i] } ) ) {
                for( var b=0; b<BrowseHelper.Response.Results[0].References.length; b++ ) {
                    if( BrowseHelper.Response.Results[0].References[b].BrowseName.Name == "WriterGroupId" ) {
                        var mI_WriterGroupId = new MonitoredItem( BrowseHelper.Response.Results[0].References[b].NodeId.NodeId );
                        // Check if the WriterGroupId of this WriterGroup is the desired one
                        if( ReadHelper.Execute( { NodesToRead: mI_WriterGroupId } ) ) {
                            result.push( mI_WriterGroupId.Value.Value.toUInt16() );
                        }
                    }
                }
            }
        }
    }
    return( result );
}

function GenerateConnections( dataSets, layout ) {
    if( !isDefined( layout ) ) var layout = "PeriodicFixed";
    var result = new Object();
    var publisherId_Publisher = UaVariant.New( { Type: BuiltInType.UInt64, Value: 32020 } );
    var publisherId_Subscriber = UaVariant.New( { Type: BuiltInType.UInt64, Value: 32021 } );
    var MaxNetworkMessageSize = 1400;
    
    var scalarSettings = Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar;
    var arraySettings = Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays;
    var defaultStringSize = Number( Settings.ServerTest.PubSub.DefaultStringSize );
    
    // Set fitting values according to selected Layout
    switch( layout ) {
        case "Dynamic":
            var HeaderLayoutUri_Value = "http://opcfoundation.org/UA/PubSub-Layouts/UADP-Dynamic";
            var DataSetOrdering_Value = DataSetOrderingType.Undefined;
            var NetworkMessageContentMask_Value = (
                UadpNetworkMessageContentMask.PublisherId |
                UadpNetworkMessageContentMask.PayloadHeader
            );
            var DataSetFieldContentMask_Value = DataSetFieldContentMask.None;
            var DataSetMessageContentMask_Value = (
                UadpDataSetMessageContentMask.Timestamp |
                UadpDataSetMessageContentMask.Status |
                UadpDataSetMessageContentMask.MinorVersion |
                UadpDataSetMessageContentMask.SequenceNumber
            );
        break;
        default:
            var HeaderLayoutUri_Value = "http://opcfoundation.org/UA/PubSub-Layouts/UADP-Periodic-Fixed";
            var DataSetOrdering_Value = DataSetOrderingType.AscendingWriterId;
            var NetworkMessageContentMask_Value = (
                UadpNetworkMessageContentMask.PublisherId |
                UadpNetworkMessageContentMask.GroupHeader |
                UadpNetworkMessageContentMask.WriterGroupId |
                UadpNetworkMessageContentMask.GroupVersion |
                UadpNetworkMessageContentMask.NetworkMessageNumber |
                UadpNetworkMessageContentMask.SequenceNumber
            );
            var DataSetFieldContentMask_Value = DataSetFieldContentMask.RawData;
            var DataSetMessageContentMask_Value = (
                UadpDataSetMessageContentMask.Status |
                UadpDataSetMessageContentMask.SequenceNumber
            );
    }
    
    //////////////////////////////////
    // Generate PublisherConnection //
    //////////////////////////////////
    
    // Create DataSetWriters
    var dataSetWriters = new UaDataSetWriterDataTypes();
    var dataSetIndex  = 0;
    var dataSetOffset = 21;
    
    for( dataSet in dataSets ) {
        
         dataSetWriters[dataSetIndex].DataSetFieldContentMask = DataSetFieldContentMask_Value;
         dataSetWriters[dataSetIndex].DataSetName             = "CTT_PubDS_" + dataSet;
         dataSetWriters[dataSetIndex].DataSetWriterId         = dataSetIndex + 1;
         dataSetWriters[dataSetIndex].Enabled                 = true;
         dataSetWriters[dataSetIndex].KeyFrameCount           = 1;
         var MessageSettings_Object = new UaUadpDataSetWriterMessageDataType();
           MessageSettings_Object.ConfiguredSize            = 0;
           MessageSettings_Object.DataSetMessageContentMask = DataSetMessageContentMask_Value;
           MessageSettings_Object.DataSetOffset             = ( ( layout == "Dynamic" ) ? 0 : dataSetOffset );
           MessageSettings_Object.NetworkMessageNumber      = 1;
         dataSetWriters[dataSetIndex].MessageSettings.setUadpDataSetWriterMessageDataType( MessageSettings_Object );
         dataSetWriters[dataSetIndex].Name                  = dataSet;
         
         // increase dataSetOffset by DataSetSize
         if( layout != "Dynamic" ) {
             dataSetOffset += 5; // HeaderSize
             for( variableName in dataSets[dataSet] ) {
                 switch( dataSets[dataSet][variableName].BuiltInType ) {
                     case BuiltInType.String:
                         if( isDefined( dataSets[dataSet][variableName].Size ) ) dataSetOffset += dataSets[dataSet][variableName].Size;
                         else dataSetOffset += defaultStringSize;
                         break;
                     default:
                         dataSetOffset += builtInTypeSize( dataSets[dataSet][variableName].BuiltInType );
                         break;
                 }
             }
         }
        
         dataSetIndex++;
    
    }
    
    networkInterfaceSetting_Server = Settings.ServerTest.PubSub.NetworkInterface_Server;
    if( !isDefined( networkInterfaceSetting_Server ) || networkInterfaceSetting_Server.length == 0 ) networkInterfaceSetting_Server = "";
    urlSetting_Server = Settings.ServerTest.PubSub.Url_Server;
    if( !isDefined( urlSetting_Server ) || urlSetting_Server.length == 0 ) urlSetting_Server = "opc.udp://239.0.0.42:4842";
         
    // Create WriterGroup and add DataSetWriters
    var writerGroups = new UaWriterGroupDataTypes();
     writerGroups[0].DataSetWriters        = dataSetWriters;
     writerGroups[0].Enabled               = true;
     writerGroups[0].HeaderLayoutUri       = HeaderLayoutUri_Value;
     writerGroups[0].KeepAliveTime         = 1000;
     writerGroups[0].MaxNetworkMessageSize = MaxNetworkMessageSize;
     var MessageSettings_Object = new UaUadpWriterGroupMessageDataType();
       MessageSettings_Object.DataSetOrdering           = DataSetOrdering_Value;
       MessageSettings_Object.GroupVersion              = 738256660;
       MessageSettings_Object.NetworkMessageContentMask = NetworkMessageContentMask_Value;
       MessageSettings_Object.PublishingOffset[0]       = -1;
       MessageSettings_Object.SamplingOffset            = -1;
     writerGroups[0].MessageSettings.setUadpWriterGroupMessageDataType( MessageSettings_Object );
     writerGroups[0].Name                  = "CttGeneratedWriterGroup_1";
     writerGroups[0].PublishingInterval    = 100;
     writerGroups[0].SecurityMode          = MessageSecurityMode.None;
     /*writerGroups[0].SecurityGroupId       = "CttGeneratedSecurityGroup_1";
      writerGroups[0].SecurityKeyServices   = new UaEndpointDescriptions();       
       writerGroups[0].SecurityKeyServices[0].SecurityMode = MessageSecurityMode.SignAndEncrypt;
       writerGroups[0].SecurityKeyServices[0].Server = gServerCapabilities.ConnectedEndpoint.Server.clone();*/
     writerGroups[0].WriterGroupId         = 1;
     var TransportSettings_Object = new UaDatagramWriterGroupTransport2DataType();
      var transportSettings_Address = new UaNetworkAddressUrlDataType();
       if( !isUDPMulticastAddress( urlSetting_Server ) ) { // Only set Address in WriterGroup for Unicast
           transportSettings_Address.NetworkInterface = networkInterfaceSetting_Server;
           transportSettings_Address.Url              = urlSetting_Server;
       }
       else {
           transportSettings_Address.NetworkInterface = "";
           transportSettings_Address.Url              = "";
       }
      TransportSettings_Object.Address.setNetworkAddressUrlDataType( transportSettings_Address );
     writerGroups[0].TransportSettings.setDatagramWriterGroupTransport2DataType( TransportSettings_Object );
    
    // Create Connection and add WriterGroup
    var publisherConnection = new UaPubSubConnectionDataType();
     publisherConnection.Name         = "CTTGeneratedConnection";
     publisherConnection.Enabled      = true;
     publisherConnection.PublisherId  = publisherId_Publisher;
     publisherConnection.WriterGroups = writerGroups;
     var address = new UaNetworkAddressUrlDataType();
      address.NetworkInterface = networkInterfaceSetting_Server;
      address.Url              = urlSetting_Server;
     publisherConnection.Address.setNetworkAddressUrlDataType( address );
     publisherConnection.TransportProfileUri = "http://opcfoundation.org/UA-Profile/Transport/pubsub-udp-uadp";
     
    var PublisherConnection_ExtensionObject = new UaExtensionObject();
    PublisherConnection_ExtensionObject.setPubSubConnectionDataType( publisherConnection );
    
    result.PublisherConnection = PublisherConnection_ExtensionObject;
    
    ///////////////////////////////////////////
    // Generate fitting SubscriberConnection //
    ///////////////////////////////////////////
    
    // Create PublishedDataSets to get DataSetMetaData
    var publishedDataSets_DataSetMetaData = GeneratePublishedDataSets( dataSets );
    // Create TargetVariables
    var targetVariables = GenerateTargetVariables( dataSets );
    
    // Create DataSetReaders
    dataSetReaders = new UaDataSetReaderDataTypes();
    var dataSetIndex = 0;
    var dataSetOffset = 21;
    
    networkInterfaceSetting_CTT = Settings.ServerTest.PubSub.NetworkInterface_CTT;
    if( !isDefined( networkInterfaceSetting_CTT ) || networkInterfaceSetting_CTT.length == 0 ) networkInterfaceSetting_CTT = "";
    urlSetting_CTT = Settings.ServerTest.PubSub.Url_CTT;
    if( !isDefined( urlSetting_CTT ) || urlSetting_CTT.length == 0 ) urlSetting_CTT = "opc.udp://239.0.0.42:4842";
    
    for( dataSet in dataSets ) {
        
        dataSetReaders[dataSetIndex].DataSetFieldContentMask = DataSetFieldContentMask_Value;
        dataSetReaders[dataSetIndex].DataSetMetaData         = publishedDataSets_DataSetMetaData[dataSetIndex].DataSetMetaData;
        dataSetReaders[dataSetIndex].DataSetWriterId         = dataSetIndex + 1;
        dataSetReaders[dataSetIndex].Enabled                 = true;
        dataSetReaders[dataSetIndex].HeaderLayoutUri         = HeaderLayoutUri_Value;
        dataSetReaders[dataSetIndex].KeyFrameCount           = 1;
        dataSetReaders[dataSetIndex].MessageReceiveTimeout   = 1000 * 1; // KeepAliveTime * KeyFrameCount
        var MessageSettings_Object = new UaUadpDataSetReaderMessageDataType();
         MessageSettings_Object.GroupVersion              = 738256660;
         MessageSettings_Object.NetworkMessageNumber      = 1;
         MessageSettings_Object.DataSetOffset             = ( ( layout == "Dynamic" ) ? 0 : dataSetOffset );
         //MessageSettings_Object.DataSetClassId            = ( isDefined( publishedDataSetProperties.DataSetClassId ) ) ? publishedDataSetProperties.DataSetClassId : new UaGuid.fromString( "{00000000-0000-0000-0000-000000000000}" );
         MessageSettings_Object.NetworkMessageContentMask = NetworkMessageContentMask_Value;
         MessageSettings_Object.DataSetMessageContentMask = DataSetMessageContentMask_Value;
         MessageSettings_Object.PublishingInterval        = 100;
         MessageSettings_Object.ReceiveOffset             = -1;
         MessageSettings_Object.ProcessingOffset          = -1;
        dataSetReaders[dataSetIndex].MessageSettings.setUadpDataSetReaderMessageDataType( MessageSettings_Object );
        dataSetReaders[dataSetIndex].Name                 = dataSet + "_Reader";
        dataSetReaders[dataSetIndex].PublisherId          = publisherId_Publisher;
        dataSetReaders[dataSetIndex].SecurityMode          = MessageSecurityMode.None;
        /*dataSetReaders[dataSetIndex].SecurityGroupId       = "CttGeneratedSecurityGroup_1";
        dataSetReaders[dataSetIndex].SecurityKeyServices   = new UaEndpointDescriptions();       
         dataSetReaders[dataSetIndex].SecurityKeyServices[0].SecurityMode = MessageSecurityMode.SignAndEncrypt;
         dataSetReaders[dataSetIndex].SecurityKeyServices[0].Server = gServerCapabilities.ConnectedEndpoint.Server.clone();*/
        dataSetReaders[dataSetIndex].WriterGroupId        = 1;
        //dataSetReaders[dataSetIndex].TransportSettings.setDatagramWriterGroupTransportDataType( new UaDatagramWriterGroupTransportDataType() );
        if( targetVariables.length > 0 ) {
            dataSetReaders[dataSetIndex].SubscribedDataSet.setTargetVariablesDataType( targetVariables[dataSetIndex] );
            dataSetReaders[dataSetIndex].DataSetMetaData.Name = "CTT_PubDS_" + dataSet;
        }
        else {
            dataSetReaders[dataSetIndex].DataSetMetaData.ConfigurationVersion.MajorVersion = 0;
            dataSetReaders[dataSetIndex].DataSetMetaData.ConfigurationVersion.MinorVersion = 0;
        }
        
        // increase dataSetOffset by DataSetSize
        if( layout != "Dynamic" ) {
            dataSetOffset += 5; // HeaderSize
            for( variableName in dataSets[dataSet] ) {
                switch( dataSets[dataSet][variableName].BuiltInType ) {
                     case BuiltInType.String:
                         if( isDefined( dataSets[dataSet][variableName].Size ) ) dataSetOffset += dataSets[dataSet][variableName].Size;
                         else dataSetOffset += defaultStringSize;
                         break;
                     default:
                         dataSetOffset += builtInTypeSize( dataSets[dataSet][variableName].BuiltInType );
                         break;
                 }
            }
        }
        
        dataSetIndex++;
         
    }
    
    // Create ReaderGroup and add DataSetReaders
    var readerGroups = new UaReaderGroupDataTypes();
     readerGroups[0].Name                  = "CttGeneratedReaderGroup_1";
     readerGroups[0].Enabled               = true;
     readerGroups[0].MaxNetworkMessageSize = MaxNetworkMessageSize;
     readerGroups[0].DataSetReaders        = dataSetReaders;
            
    var subscriberConnection = new UaPubSubConnectionDataType();
     subscriberConnection.Name         = "CTTGeneratedConnection";
     subscriberConnection.Enabled      = true;
     subscriberConnection.PublisherId  = publisherId_Subscriber;
     subscriberConnection.ReaderGroups = readerGroups;
     var address = new UaNetworkAddressUrlDataType();
      address.NetworkInterface = networkInterfaceSetting_CTT;
      address.Url              = urlSetting_CTT;
     subscriberConnection.Address.setNetworkAddressUrlDataType( address );
     subscriberConnection.TransportProfileUri = "http://opcfoundation.org/UA-Profile/Transport/pubsub-udp-uadp";

    var SubscriberConnection_ExtensionObject = new UaExtensionObject();
    SubscriberConnection_ExtensionObject.setPubSubConnectionDataType( subscriberConnection );
    
    result.SubscriberConnection = SubscriberConnection_ExtensionObject;
    
    return result;
}

function GenerateSecurityGroup() {
    var SG = new UaSecurityGroupDataType();
     SG.Name                            = "CttGeneratedSecurityGroup_1";
     SG.KeyLifetime                     = 3600000;
     SG.MaxFutureKeyCount               = 10;
     SG.MaxPastKeyCount                 = 2;
     SG.SecurityGroupId                 = "CttGeneratedSecurityGroup_1";
     SG.SecurityPolicyUri               = "http://opcfoundation.org/UA/SecurityPolicy#PubSub-Aes128-CTR";
     SG.RolePermissions[0]              = new UaRolePermissionType();
      SG.RolePermissions[0].Permissions = PermissionType.Call;
      SG.RolePermissions[0].RoleId      = new UaNodeId( Identifier.WellKnownRole_SecurityKeyServerAccess );
      
    return SG;
}

function callGetSecurityKeys( securityGroupId, securityTokenId ) {
    var result = {
        SecurityPolicyUri: null,
        FirstTokenId: null,
        Keys: null,
        TimeToNextKey: null,
        KeyLifeTime: null
    };
    
    if( CallHelper.Execute( {
        MethodsToCall: [ {
            MethodId: new UaNodeId( Identifier.PublishSubscribe_GetSecurityKeys ),
            ObjectId: new UaNodeId( Identifier.PublishSubscribe ),
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.String, Value: securityGroupId } ),
                UaVariant.New( { Type: BuiltInType.UInt32, Value: securityTokenId } ),
                UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) {
        // SecurityPolicyUri
        if( isDefined( CallHelper.Response.Results[0].OutputArguments[0] ) ) 
            result.SecurityPolicyUri = CallHelper.Response.Results[0].OutputArguments[0].toString();
        // FirstTokenId
        if( isDefined( CallHelper.Response.Results[0].OutputArguments[1] ) )
            result.FirstTokenId = CallHelper.Response.Results[0].OutputArguments[1].toUInt32();
        // Keys
        if( isDefined( CallHelper.Response.Results[0].OutputArguments[2] ) )
            result.Keys = CallHelper.Response.Results[0].OutputArguments[2].toByteStringArray();
        // TimeToNextKey
        if( isDefined( CallHelper.Response.Results[0].OutputArguments[3] ) )
            result.TimeToNextKey = CallHelper.Response.Results[0].OutputArguments[3].toDouble();
        // KeyLifeTime
        if( isDefined( CallHelper.Response.Results[0].OutputArguments[4] ) )
            result.KeyLifeTime = CallHelper.Response.Results[0].OutputArguments[4].toDouble();
    }
    
    return result;
}

function ConfigurePubSubTest( layout ) {
    if( !isDefined( layout ) ) var layout = "PeriodicFixed";
    
    var testDataSets = GenerateTestDataSetsFromSettings();
    // Check if DataSet is empty
    var isEmpty = true;
    for( dataSet in testDataSets ) isEmpty = false;
    if( isEmpty ) {
        addError( "ConfigurePubSubTest(): Could not generate test datasets from CTT settings. Please make sure that at least one of the following scalar types is configured: [ Float, Double, Byte, Int16, Int32, Int64, UInt16, UInt32, UInt64 ]" );
        return( { success: false } );
    }
    
    var publishedDataSets = GeneratePublishedDataSets( testDataSets );
    var connections = GenerateConnections( testDataSets, layout );
    /*var securityGroups = new UaSecurityGroupDataTypes();
     securityGroups[0] = GenerateSecurityGroup();*/
      
    // Create and set PubSubConfiguration2 of Publisher to get the ByteString representation
    var PublisherConfiguration = new UaPubSubConfiguration2DataType();
     PublisherConfiguration.Enabled           = true;
     PublisherConfiguration.Connections[0]    = connections.PublisherConnection.toPubSubConnectionDataType();
     PublisherConfiguration.PublishedDataSets = publishedDataSets;
     //PublisherConfiguration.SecurityGroups    = securityGroups;
        
    if( !UploadPubSubConfigurationToServer( PublisherConfiguration ) ) {
        addError( "ConfigurePubSubTest(): Failed to upload PubSubConfiguration to server." );
        return( { success: false } );
    }
    
    // Create and set PubSubConfiguration of Subscriber (CTT)
    var SubscriberConfiguration = new UaPubSubConfiguration2DataType();
     SubscriberConfiguration.Enabled           = true;
     SubscriberConfiguration.Connections[0]    = connections.SubscriberConnection.toPubSubConnectionDataType();
     //SubscriberConfiguration.SecurityGroups    = securityGroups;
    
    UaOpcServer.SetCurrentPubSubConfig( SubscriberConfiguration );
    
    return( { 
        success                 : true,
        PublisherConfiguration  : PublisherConfiguration,
        SubscriberConfiguration : SubscriberConfiguration
    } );
}

function GeneratePublishedDataSets( dataSets ) {
    
    var defaultStringSize = Number( Settings.ServerTest.PubSub.DefaultStringSize );
    
    var publishedDataSets = new UaPublishedDataSetDataTypes();
    var index = 0;
    
    for( dataSet in dataSets ) {
        
        // Create DataSetMetaData and PublishedData
        
        var publishedData = new UaPublishedVariableDataTypes();
        var dataSetMetaData = new UaDataSetMetaDataType();
          var configurationVersion = new UaConfigurationVersionDataType();
            configurationVersion.MajorVersion = 742374108;
            configurationVersion.MinorVersion = 742374148;
          dataSetMetaData.ConfigurationVersion = configurationVersion;
        
        var variableIndex = 0;
        for( variableName in dataSets[dataSet] ) {
            publishedData[variableIndex].AttributeId = Attribute.Value;
            publishedData[variableIndex].PublishedVariable = new UaNodeId.fromString( dataSets[dataSet][variableName].NodeId.toString() );
            
            dataSetMetaData.Fields[variableIndex].BuiltInType    = dataSets[dataSet][variableName].BuiltInType;
            dataSetMetaData.Fields[variableIndex].DataSetFieldId = ( isDefined( dataSets[dataSet][variableName].DataSetFieldId ) ) ? dataSets[dataSet][variableName].DataSetFieldId : randomGuid();
            dataSetMetaData.Fields[variableIndex].DataType       = new UaNodeId( dataSets[dataSet][variableName].BuiltInType );
            dataSetMetaData.Fields[variableIndex].FieldFlags     = DataSetFieldFlags.None;
            dataSetMetaData.Fields[variableIndex].Name           = variableName;
            dataSetMetaData.Fields[variableIndex].ValueRank      = dataSets[dataSet][variableName].ValueRank;
            if( dataSets[dataSet][variableName].BuiltInType == BuiltInType.String ) {
                dataSetMetaData.Fields[variableIndex].MaxStringLength = ( isDefined( dataSets[dataSet][variableName].Size ) ) ? dataSets[dataSet][variableName].Size : defaultStringSize;
            }
            
            variableIndex++;
        }
        
        // Create PublishedDataSet
        publishedDataSets[index].Name = "CTT_PubDS_" + dataSet;
         var dataSetSource = new UaPublishedDataItemsDataType();
           dataSetSource.PublishedData = publishedData;
        publishedDataSets[index].DataSetSource.setPublishedDataItemsDataType( dataSetSource );
        publishedDataSets[index].DataSetMetaData = dataSetMetaData;
        
        index++;
        
    }
    
    return publishedDataSets;
}

function GenerateTargetVariables( dataSets ) {
    
    var targetVariables = new UaTargetVariablesDataTypes();
    var index = 0;
    
    for( dataSet in dataSets ) {
        
        // Create TargetVariables

        var variableIndex = 0;
        for( variableName in dataSets[dataSet] ) {
            targetVariables[index].TargetVariables[variableIndex].AttributeId           = Attribute.Value;
            targetVariables[index].TargetVariables[variableIndex].DataSetFieldId        = ( isDefined( dataSets[dataSet][variableName].DataSetFieldId ) ) ? dataSets[dataSet][variableName].DataSetFieldId : new UaGuid();
            targetVariables[index].TargetVariables[variableIndex].OverrideValueHandling = OverrideValueHandling.LastUsableValue;
            targetVariables[index].TargetVariables[variableIndex].TargetNodeId          = new UaNodeId.fromString( dataSets[dataSet][variableName].NodeId.toString() );
            
            variableIndex++;
        }
        
        index++;
        
    }
    
    return targetVariables;
}

function builtInTypeSize( builtInType, returnZeroOnUnknownType ) {
    if( !isDefined( returnZeroOnUnknownType ) ) var returnZeroOnUnknownType = false;
    switch( builtInType ) {
        
        // Known types
        case 1: return 1; // Boolean
        case 2: return 1; // SByte
        case 3: return 1; // Byte
        case 4: return 2; // Int16
        case 5: return 2; // UInt16
        case 6: return 4; // Int32
        case 7: return 4; // UInt32
        case 8: return 8; // Int64
        case 9: return 8; // UInt64
        case 10: return 4; // Float
        case 11: return 8; // Double
        case 13: return 8; // DateTime
        case 14: return 16; // Guid
        
        // Unknown types
        case 12: // String
        case 15: // ByteString
        case 16: // XmlElement
        case 17: // NodeId
        case 18: // ExpandedNodeId
        case 19: // StatusCode
        case 20: // QualifiedName
        case 21: // LocalizedText
        case 22: // ExtensionObject
        case 23: // DataValue
        case 24: // Variant
        case 25: // DiagnosticInfo
        default:
            if( returnZeroOnUnknownType ) return 0;
            else throw( "builtInTypeSize(): Size of BuiltInType '" + BuiltInType.toString( builtInType ) + "' is unknown." );
    }
}

function GenerateConfigurationReferences( pubSubConfiguration ) {
    var pubSubConfigRef = new UaPubSubConfigurationRefDataTypes();
    
    var index = 0;
    
    // Add PublishedDataSets
    for( var p=0; p<pubSubConfiguration.PublishedDataSets.length; p++ ) {
        pubSubConfigRef[index].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementAdd | 
            PubSubConfigurationRefMask.ReferencePubDataset
        );
        pubSubConfigRef[index].ElementIndex = p;
        index++;
    }
    
    // Add SecurityGroups
    for( var s=0; s<pubSubConfiguration.SecurityGroups.length; s++ ) {
        pubSubConfigRef[index].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementAdd | 
            PubSubConfigurationRefMask.ReferenceSecurityGroup
        );
        pubSubConfigRef[index].ElementIndex = s;
        index++;
    }
    
    // Add Connections
    for( var c=0; c<pubSubConfiguration.Connections.length; c++ ) {
        pubSubConfigRef[index].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementAdd | 
            PubSubConfigurationRefMask.ReferenceConnection
        );
        pubSubConfigRef[index].ConnectionIndex = c;
        index++;
        
        // Add WriterGroups
        for( var wg=0; wg<pubSubConfiguration.Connections[c].WriterGroups.length; wg++ ) {
            pubSubConfigRef[index].ConfigurationMask = (
                PubSubConfigurationRefMask.ElementAdd | 
                PubSubConfigurationRefMask.ReferenceWriterGroup
            );
            pubSubConfigRef[index].ConnectionIndex = c;
            pubSubConfigRef[index].GroupIndex = wg;
            index++;
            
            // Add DataSetWriters
            for( var dsw=0; dsw<pubSubConfiguration.Connections[c].WriterGroups[wg].DataSetWriters.length; dsw++ ) {
                pubSubConfigRef[index].ConfigurationMask = (
                    PubSubConfigurationRefMask.ElementAdd | 
                    PubSubConfigurationRefMask.ReferenceWriter
                );
                pubSubConfigRef[index].ConnectionIndex = c;
                pubSubConfigRef[index].GroupIndex = wg;
                pubSubConfigRef[index].ElementIndex = dsw;
                index++;
            }
        
        }
        
        // Add ReaderGroups
        for( var rg=0; rg<pubSubConfiguration.Connections[c].ReaderGroups.length; rg++ ) {
            pubSubConfigRef[index].ConfigurationMask = (
                PubSubConfigurationRefMask.ElementAdd | 
                PubSubConfigurationRefMask.ReferenceReaderGroup
            );
            pubSubConfigRef[index].ConnectionIndex = c;
            pubSubConfigRef[index].GroupIndex = rg;
            index++;
            
            // Add DataSetReaders
            for( var dsr=0; dsr<pubSubConfiguration.Connections[c].ReaderGroups[rg].DataSetReaders.length; dsr++ ) {
                pubSubConfigRef[index].ConfigurationMask = (
                    PubSubConfigurationRefMask.ElementAdd | 
                    PubSubConfigurationRefMask.ReferenceReader
                );
                pubSubConfigRef[index].ConnectionIndex = c;
                pubSubConfigRef[index].GroupIndex = rg;
                pubSubConfigRef[index].ElementIndex = dsr;
                index++;
            }
        
        }
        
    }
    
    var result = new UaExtensionObjects( index );
    for( var ex=0; ex<index; ex++ ) result[ex].setPubSubConfigurationRefDataType( pubSubConfigRef[ex] );
    
    return result;
}

function GetPubSubConfigurationTypeObjectFromServer() {
    var result = new Object();
    
    var modelMapHelper = new BuildLocalCacheMapService();
    var modelMap = modelMapHelper.GetModelMap();
    
    // Find PubSubConfigurationType object and needed methods
    var PubSubConfigurationTypeNodes = FindAllInstancesOfType( new UaNodeId( Identifier.PubSubConfigurationType ) );
    if( isDefined( PubSubConfigurationTypeNodes ) && PubSubConfigurationTypeNodes.length > 0 ) {
        var PubSubConfigurationTypeNode = PubSubConfigurationTypeNodes[0].NodeId;
    }
    else {
        addError( "GetPubSubConfigurationTypeObjectFromServer(): Could not find PubSubConfigurationType object in the server." );
        return( null );
    }
    
    result.PubSubConfigurationTypeNode = PubSubConfigurationTypeNode;
    
    // Browse all needed mandatory methods and property Size to edit the PubSubConfiguration
    var neededMethods = [ "Open", "Close", "Read", "Write", "GetPosition", "SetPosition", "CloseAndUpdate" ];
    
    var searchDefinition = [];
    
    for( var m=0; m<neededMethods.length; m++ ) {
        searchDefinition.push( {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: neededMethods[m] } )
        } );
    }
    // Property Size
    searchDefinition.push( {
        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
        IsForward: true,
        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Size" } )
    } );
    neededMethods.push( "Size" );
    
    var References = modelMap.Get( PubSubConfigurationTypeNode );
    modelMapHelper.FindReferences( References.ReferenceDescriptions, searchDefinition );
    
    for( var m=0; m<neededMethods.length; m++ ) {
        if( isDefined( searchDefinition[m].ReferenceIndex ) ) {
            result[neededMethods[m]] = References.ReferenceDescriptions[searchDefinition[m].ReferenceIndex].NodeId.NodeId;
        }
        else {
            addError( "GetPubSubConfigurationTypeObjectFromServer(): Could not find mandatory '" + neededMethods[m] + "' method in PubSubConfigurationType object '" + PubSubConfigurationTypeNode + "'." );
            return( null );
        }
    }
    
    return( result );
}

function DownloadPubSubConfigurationFromServer() {
    var result = null;
    
    // Find PubSubConfigurationType object and needed methods
    var PubSubConfigurationObject = GetPubSubConfigurationTypeObjectFromServer();
    
    if( !isDefined( PubSubConfigurationObject ) ) {
        addError( "Cannot download PubSubConfiguration from server: Failed to get PubSubConfigurationType object from server." );
        return( result );
    }
    
    // Read file size
    var mi_Size = new MonitoredItem( PubSubConfigurationObject.Size );
    if( ReadHelper.Execute( { NodesToRead: mi_Size } ) ) {
        var fileSize = mi_Size.Value.Value.toUInt64();
    }
    else {
        addError( "Cannot download PubSubConfiguration from server: Failed to read value attribute property 'Size' (" + PubSubConfigurationObject.Size + ")" );
        return( result );
    }
    
    // Read PubSubConfig binary
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Open,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.Byte, Value: 1 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) return( false );
    
    var fileHandle = CallHelper.Response.Results[0].OutputArguments[0].toUInt32();
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Read,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.UInt64, Value: 8323072 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    var result = CallHelper.Response.Results[0].OutputArguments[0].toByteString();
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Close,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    return( result );
}

function EraseConfigElementsFromServer( configToRemove ) {
    if( !isDefined( configToRemove ) ) throw( "EraseConfigElementsFromServer(): No PubSubConfiguration defined" );
    var result = true;
    
    // Clear Connections and PublishedDataSets in config and create ByteString
    var pubSubConfigRef_Clear = new UaPubSubConfigurationRefDataTypes();
    
    var connectionCount = configToRemove.Connections.length;
    var publishedDataSetCount = configToRemove.PublishedDataSets.length;
    var securityGroupCount = configToRemove.SecurityGroups.length;
    
    // Create PubSubConfigurationRef entries to remove Connections
    for( var c=0; c<connectionCount; c++ ) {
        pubSubConfigRef_Clear[c].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementRemove | 
            PubSubConfigurationRefMask.ReferenceConnection
        );
        pubSubConfigRef_Clear[c].ConnectionIndex = c;
    }
    
    // Create PubSubConfigurationRef entries to remove PublishedDataSets
    for( var p=0; p<publishedDataSetCount; p++ ) {
        pubSubConfigRef_Clear[p + connectionCount].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementRemove | 
            PubSubConfigurationRefMask.ReferencePubDataset
        );
        pubSubConfigRef_Clear[p + connectionCount].ElementIndex = p;
    }
    
    // Create PubSubConfigurationRef entries to remove SecurityGroups
    for( var s=0; s<securityGroupCount; s++ ) {
        pubSubConfigRef_Clear[s + connectionCount + publishedDataSetCount].ConfigurationMask = (
            PubSubConfigurationRefMask.ElementRemove | 
            PubSubConfigurationRefMask.ReferenceSecurityGroup
        );
        pubSubConfigRef_Clear[s + connectionCount + publishedDataSetCount].ElementIndex = s;
    }

    var pubSubConfigRef_Clear_ExtObj = new UaExtensionObjects( pubSubConfigRef_Clear.length );
    for( var ex=0; ex<pubSubConfigRef_Clear.length; ex++ ) pubSubConfigRef_Clear_ExtObj[ex].setPubSubConfigurationRefDataType( pubSubConfigRef_Clear[ex] );
    
    var configToRemoveBS = gOpcServer.pubSubConfiguration2DataTypeToBinaryBlob( configToRemove );
    
    // Find PubSubConfigurationType object and needed methods
    var PubSubConfigurationObject = GetPubSubConfigurationTypeObjectFromServer();
    
    if( !isDefined( PubSubConfigurationObject ) ) {
        addError( "EraseConfigElementsFromServer(): Cannot erase PubSubConfiguration from server: Failed to get PubSubConfigurationType object from server." );
        return( false );
    }
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Open,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.Byte, Value: 3 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) return( false );
    
    var fileHandle = CallHelper.Response.Results[0].OutputArguments[0].toUInt32();
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.SetPosition,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.UInt64, Value: 0 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Write,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.ByteString, Value: configToRemoveBS } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.CloseAndUpdate,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.Boolean, Value: false } ),
                UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: pubSubConfigRef_Clear_ExtObj, Array: true } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    addLog( "EraseConfigElementsFromServer(): OutputArguments for Method call CloseAndUpdate: " + CallHelper.Response.Results[0].OutputArguments );
    
    return( result );
}

function UploadPubSubConfigurationToServer( pubSubConfig ) {
    var result = true;
    
    var configBS = gOpcServer.pubSubConfiguration2DataTypeToBinaryBlob( pubSubConfig );
    var pubSubConfigRef = GenerateConfigurationReferences( pubSubConfig );
    
    // Find PubSubConfigurationType object and needed methods
    var PubSubConfigurationObject = GetPubSubConfigurationTypeObjectFromServer();
    
    if( !isDefined( PubSubConfigurationObject ) ) {
        addError( "Cannot upload PubSubConfiguration to server: Failed to get PubSubConfigurationType object from server." );
        return( false );
    }
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Open,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.Byte, Value: 6 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) return( false );
    
    var fileHandle = CallHelper.Response.Results[0].OutputArguments[0].toUInt32();
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.SetPosition,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.UInt64, Value: 0 } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.Write,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.ByteString, Value: configBS } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: PubSubConfigurationObject.CloseAndUpdate,
            ObjectId: PubSubConfigurationObject.PubSubConfigurationTypeNode,
            InputArguments: [
                UaVariant.New( { Type: BuiltInType.UInt32, Value: fileHandle } ),
                UaVariant.New( { Type: BuiltInType.Boolean, Value: false } ),
                UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: pubSubConfigRef, Array: true } )
            ]
        } ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } ) ) result = false;
    
    return( result );
}

function GenerateTestDataSetsFromSettings() {
    var scalarSettings = Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar;
    var arraySettings = Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays;
    
    var dataSets = {
        "Floats" : 
        {
            "Float" : 
            {
                NodeId      : scalarSettings.Float,
                BuiltInType : BuiltInType.Float,
                ValueRank   : -1
            },
            "Float_1" : 
            {
                NodeId      : scalarSettings.Float,
                BuiltInType : BuiltInType.Float,
                ValueRank   : -1
            }
        },
        "Doubles" :
        {
            "Double" : 
            {
                NodeId      : scalarSettings.Double,
                BuiltInType : BuiltInType.Double,
                ValueRank   : -1
            },
            "Double_1" : 
            {
                NodeId      : scalarSettings.Double,
                BuiltInType : BuiltInType.Double,
                ValueRank   : -1
            }
        },
        "Bytes" :
        {
            "Byte" : 
            {
                NodeId      : scalarSettings.Byte,
                BuiltInType : BuiltInType.Byte,
                ValueRank   : -1
            },
            "Byte_1" :
            {
                NodeId      : scalarSettings.Byte,
                BuiltInType : BuiltInType.Byte,
                ValueRank   : -1
            }
        },
        /*
        "Strings" :
        {
            "String" : 
            {
                NodeId      : scalarSettings.String,
                BuiltInType : BuiltInType.String,
                ValueRank   : -1
            },
            "String_1" : 
            {
                NodeId      : scalarSettings.String,
                BuiltInType : BuiltInType.String,
                ValueRank   : -1
            }
        },*/
        "Int16s" :
        {
            "Int16" : 
            {
                NodeId      : scalarSettings.Int16,
                BuiltInType : BuiltInType.Int16,
                ValueRank   : -1
            },
            "Int16_1" : 
            {
                NodeId      : scalarSettings.Int16,
                BuiltInType : BuiltInType.Int16,
                ValueRank   : -1
            }
        },
        "Int32s" :
        {
            "Int32" : 
            {
                NodeId      : scalarSettings.Int32,
                BuiltInType : BuiltInType.Int32,
                ValueRank   : -1
            },
            "Int32_1" : 
            {
                NodeId      : scalarSettings.Int32,
                BuiltInType : BuiltInType.Int32,
                ValueRank   : -1
            }
        },
        "Int64s" :
        {
            "Int64" : 
            {
                NodeId      : scalarSettings.Int64,
                BuiltInType : BuiltInType.Int64,
                ValueRank   : -1
            },
            "Int64_1" : 
            {
                NodeId      : scalarSettings.Int64,
                BuiltInType : BuiltInType.Int64,
                ValueRank   : -1
            }
        },
        "UInt16s" :
        {
            "UInt16" : 
            {
                NodeId      : scalarSettings.UInt16,
                BuiltInType : BuiltInType.UInt16,
                ValueRank   : -1
            },
            "UInt16_1" : 
            {
                NodeId      : scalarSettings.UInt16,
                BuiltInType : BuiltInType.UInt16,
                ValueRank   : -1
            }
        },
        "UInt32s" :
        {
            "UInt32" : 
            {
                NodeId      : scalarSettings.UInt32,
                BuiltInType : BuiltInType.UInt32,
                ValueRank   : -1
            },
            "UInt32_1" : 
            {
                NodeId      : scalarSettings.UInt32,
                BuiltInType : BuiltInType.UInt32,
                ValueRank   : -1
            }
        },
        "UInt64s" :
        {
            "UInt64" : 
            {
                NodeId      : scalarSettings.UInt64,
                BuiltInType : BuiltInType.UInt64,
                ValueRank   : -1
            },
            "UInt64_1" : 
            {
                NodeId      : scalarSettings.UInt64,
                BuiltInType : BuiltInType.UInt64,
                ValueRank   : -1
            }
        },
        "MixedDataTypes" :
        {
            "Byte" : 
            {
                NodeId      : scalarSettings.Byte,
                BuiltInType : BuiltInType.Byte,
                ValueRank   : -1
            },
            "Float" : 
            {
                NodeId      : scalarSettings.Float,
                BuiltInType : BuiltInType.Float,
                ValueRank   : -1
            },
            "Double" : 
            {
                NodeId      : scalarSettings.Double,
                BuiltInType : BuiltInType.Double,
                ValueRank   : -1
            },
            /*  
            "String" : 
            {
                NodeId      : scalarSettings.String,
                BuiltInType : BuiltInType.String,
                ValueRank   : -1
            },
            */
            "Int16" : 
            {
                NodeId      : scalarSettings.Int16,
                BuiltInType : BuiltInType.Int16,
                ValueRank   : -1
            },
            "Int32" : 
            {
                NodeId      : scalarSettings.Int32,
                BuiltInType : BuiltInType.Int32,
                ValueRank   : -1
            },
            "Int64" : 
            {
                NodeId      : scalarSettings.Int64,
                BuiltInType : BuiltInType.Int64,
                ValueRank   : -1
            },
            "UInt16" : 
            {
                NodeId      : scalarSettings.UInt16,
                BuiltInType : BuiltInType.UInt16,
                ValueRank   : -1
            },
            "UInt32" : 
            {
                NodeId      : scalarSettings.UInt32,
                BuiltInType : BuiltInType.UInt32,
                ValueRank   : -1
            },
            "UInt64" : 
            {
                NodeId      : scalarSettings.UInt64,
                BuiltInType : BuiltInType.UInt64,
                ValueRank   : -1
            }
        }
    };
    
    /* DATASETS:
    
    2 Floats[3]
    2 Doubles[3]
    2 Bytes[3]
    2 Fixed length strings(20)[3]
    2 Int16[3]
    2 Int32[3]
    2 Int64[3]
    2 UInt16[3]
    2 UInt32[3]
    2 UInt64[3]
    
    Byte, Float[3], Double[3], String(20), Int16[3], Int32, Int64[3], UInt16, UInt32[3], UInt64,
    Byte[3], Float, Double, String(20)[3], Int16, Int32[3], Int64, UInt16[3], UInt32, UInt64[3]
    
    */
    
    // Clean up empty variables
    for( dataSet in dataSets ) {
        var dataSetIsEmpty = true;
        for( variable in dataSets[dataSet] ) {
            if( dataSets[dataSet][variable].NodeId.length == 0 ) {
                addWarning( "Missing scalar setting to define PublishedVariable '" + variable + "' for DataSet '" + dataSet + "'. This DataType will be skipped. Check scalar settings." );
                delete dataSets[dataSet][variable];
            }
            else dataSetIsEmpty = false;
        }
        if( dataSetIsEmpty ) delete dataSets[dataSet];
    }
    
    return dataSets;
}

function CollectNetworkMessageData( args ) {
    if( !isDefined( args ) ) throw( "CollectNetworkMessageData(): No args specified" );
    if( !isDefined( args.SubscriberConfiguration ) ) throw( "CollectNetworkMessageData(): No SubscriberConfiguration specified" );
    if( !isDefined( args.Timeout ) ) args.Timeout = 10000;
    if( !isDefined( args.MaxNumberOfMessages ) ) args.MaxNumberOfMessages = 10;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    var result = [];
    
    // Collect test NetworkMessage data
    addLog( "Collecting NetworkMessage data... (Timeout at " + args.Timeout + " ms)" );
    var initialMC = gOpcServer.getReceivedMessageCount( 0 );
    var startTime = UaDateTime.Now(), mC = 0;
    while( startTime.msecsTo( UaDateTime.Now() ) < args.Timeout && ( mC - initialMC ) < args.MaxNumberOfMessages ) {
        wait( 20 );
        mC = gOpcServer.getReceivedMessageCount( 0 );
    }
    
    for( var j=initialMC; j<mC && j<initialMC + args.MaxNumberOfMessages; j++ ) {
        result.push( new NetworkMessage( gOpcServer.getReceivedMessage( 0, j ), args.SubscriberConfiguration ) );
    }
    
    if( result.length == 0 && !args.SuppressMessages ) addWarning( "Did not receive any NetworkMessages within " + args.Timeout + " ms to test with.\nPlease make sure the server is sending messages.\nAborting Conformance Unit." );
    
    return result;
}

function ReadMessageDataOfPublishedDataItems( publishedDataItems ) {
    if( !isDefined( publishedDataItems ) ) throw( "ReadMessageDataOfPublishedDataItems(): No PublishedDataItems defined" );
    if( !isDefined( publishedDataItems.PublishedData ) ) throw( "ReadMessageDataOfPublishedDataItems(): Provided PublishedDataItems is not of type PublishedDataItemsDataType" );
    
    var result = new UaByteString();
    
    for( var i=publishedDataItems.PublishedData.length-1; i>=0; i-- ) {
        var publishedVariable_mI = new MonitoredItem( publishedDataItems.PublishedData[i].PublishedVariable );
        if( ReadHelper.Execute( { NodesToRead: publishedVariable_mI } ) ) {
            var dataType = publishedVariable_mI.Value.Value.DataType;
            var value = UaVariantToSimpleType( publishedVariable_mI.Value.Value );
            
            switch( dataType ) {
                case BuiltInType.Double:
                    result.append( doubleToHex( value ) );
                    break;
                case BuiltInType.Float:
                    result.append( floatToHex( value ) );
                    break;
                default:
                    var hexValue = UaVariantToSimpleType( publishedVariable_mI.Value.Value ).toString( 16 );
                    if( hexValue.length % 2 != 0 ) hexValue = "0" + hexValue;
                    var bsToAppend = new UaByteString.fromHexString( "0x" + hexValue );
                    
                    // Filling zeroes
                    for( var z=0; z<builtInTypeSize( dataType ) - bsToAppend.length; z++ ) {
                        result.append( new UaByteString.fromHexString( "0x00" )  );
                    }
                    
                    result.append( bsToAppend );
                    break;
            }
            
        }
    }
    
    return result;
}

function IncrementValuesOfPublishedDataItems( publishedDataItems ) {
    if( !isDefined( publishedDataItems ) ) throw( "IncrementValuesOfPublishedDataItems(): No PublishedDataItems defined" );
    if( !isDefined( publishedDataItems.PublishedData ) ) throw( "IncrementValuesOfPublishedDataItems(): Provided PublishedDataItems is not of type PublishedDataItemsDataType" );
    
    var bSuccess = true;
    
    for( var i=0; i<publishedDataItems.PublishedData.length; i++ ) {
        var publishedVariable_mI = new MonitoredItem( publishedDataItems.PublishedData[i].PublishedVariable );
        if( ReadHelper.Execute( { NodesToRead: publishedVariable_mI } ) ) {
            UaVariant.Increment( { Item: publishedVariable_mI } );
            if( !WriteHelper.Execute( { NodesToWrite: publishedVariable_mI } ) ) bSuccess = false;
        }
        else bSuccess = false;
        if( !bSuccess ) break;
    }
    
    return bSuccess;
}

function floatToHex( val ) {
    return byteArrayToByteString( IEEE754_toBytes( val, 23, 4 ) );
}

function doubleToHex( val ) {
    return byteArrayToByteString( IEEE754_toBytes( val, 52, 8 ) );
}

function IEEE754_toBytes( value, mLen, nBytes ) {
    var result = [];
    
    var e, m, c;
    var eLen = ( nBytes * 8 ) - mLen - 1;
    const eMax = ( 1 << eLen ) - 1;
    const eBias = eMax >> 1;
    const rt = ( mLen === 23 ? Math.pow( 2, -24 ) - Math.pow( 2, -77 ) : 0 );
    var i = (nBytes - 1);
    const s = value < 0 || ( value === 0 && 1 / value < 0 ) ? 1 : 0;
    
    value = Math.abs( value );
    
    e = Math.floor( Math.log( value ) / Math.LN2 );
    if ( value * ( c = Math.pow( 2, -e ) ) < 1 ) {
        e--;
        c *= 2;
    }
    if ( e + eBias >= 1 ) value += rt / c;
    else value += rt * Math.pow( 2, 1 - eBias );
    if ( value * c >= 2 ) {
        e++;
        c /= 2;
    }
    if ( e + eBias >= eMax ) {
        m = 0;
        e = eMax;
    } else if ( e + eBias >= 1 ) {
        m = ( ( value * c ) - 1 ) * Math.pow( 2, mLen );
        e = e + eBias;
    } else {
        m = value * Math.pow( 2, eBias - 1 ) * Math.pow( 2, mLen );
        e = 0;
    }
    
    while ( mLen >= 8 ) {
        result[i] = m & 0xff;
        i -= 1;
        m /= 256;
        mLen -= 8;
    }
    
    e = ( e << mLen ) | m;
    eLen += mLen;
    while ( eLen > 0 ) {
        result[i] = e & 0xff;
        i -= 1;
        e /= 256;
        eLen -= 8;
    }
    
    result[i + 1] |= s * 128;
    
    return result;
}

function IEEE754_fromBytes( byteArray, mLen ) {
    var bits = "";
    for( var i=0; i<byteArray.length; i++ ) bits += ( "0000000" + byteArray[i].toString( 2 ) ).slice( -8 );
    var eLen = ( byteArray.length * 8 ) - mLen - 1;
    const eBias = ( ( 1 << eLen ) - 1 ) >> 1;
    var s = parseInt( bits.substr( 0, 1 ), 2 );
    var e = parseInt( bits.substr( 1, eLen ), 2 );
    var m = 1;
    for( var i=0; i<mLen; i++ ) m += parseInt( bits.substr( 1 + i + eLen, 1 ) ) / Math.pow( 2, i + 1 );
    if( e == 0 && m == 1 ) return 0;
    return ( s == 1 ? -1 : 1 ) * m * Math.pow( 2, e - eBias );
}

function randomGuid() {
    var guidString = "";
    for( var g=0; g<36; g++ ) {
        switch( g ) {
            case 8:
            case 13:
            case 18:
            case 23:
                guidString += "-";
                break;
            default:
                guidString += Math.floor( Math.random() * 16 ).toString(16);
                break;
        }
    }
    return UaGuid.fromString( guidString );
}

function MergePubSubConfigurations( originalPubSubConfig, pubSubConfigToMerge ) {
    if( !isDefined( originalPubSubConfig ) ) throw( "MergeIntoCurrentPubSubConfig(): No originalPubSubConfig to merge defined" );
    if( !isDefined( pubSubConfigToMerge ) ) throw( "MergeIntoCurrentPubSubConfig(): No pubSubConfigToMerge to merge defined" );
    
    var result = originalPubSubConfig.clone();
    
    var memberNames = [
        "ConfigurationProperties", "Connections", "DataSetClasses",
        "DefaultSecurityKeyServices", "PubSubKeyPushTargets", "PublishedDataSets",
        "SecurityGroups", "SubscribedDataSets"
    ];
    
    for( var m=0; m<memberNames.length; m++ ) {
        for( var c=0; c<pubSubConfigToMerge[memberNames[m]].length; c++ ) {
            result[memberNames[m]][result[memberNames[m]].length] = pubSubConfigToMerge[memberNames[m]][c].clone();
        }
    }
    
    return result;
}

function isUDPMulticastAddress( urlString ) {
    if( !isDefined( urlString ) ) return false;
    if( !isDefined( urlString.indexOf ) ) urlString = urlString.toString();
    if( urlString.indexOf( "opc.udp://" ) == 0 ) {
        if( urlString.indexOf( ".", 9 ) == 13 ) {
            var highestByte = parseInt( urlString.substring( 10, 13 ) );
            if( highestByte >= 224 && highestByte <= 239 ) return true;
        }
    }
    return false;
}