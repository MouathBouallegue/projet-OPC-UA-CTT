include( "./library/PubSub/PubSubUtilities.js" );

/**
 * Parser object. Can be initialized with raw message data and provides methods to parse<br>
 * data portions by type, moving the cursor by the according size
 * 
 * @param {UaByteString} data - Raw message data to be initialized
 *
 * @returns {boolean} Returns true
 */
 var Parser = function( data ) {
            
    this.data = data.clone();
    this.cur = 0;
    this.measureOffSet = 0;
    
    this.startMeasure = function() { this.measureOffSet = this.cur; }
    this.getMeasuredLength = function() { return ( this.cur - this.measureOffSet ); }
    this.getDataLength = function() { return this.data.length; }
    this.getCursorPos = function() { return this.cur; }
    this.setCursorPos = function( pos ) { this.cur = pos; }
    this.moveCursor = function( moveBy ) { this.cur += moveBy; }
    
    this.ByteArray = function( msg, size ) {
        var out = invertByteString( this.data.getRange( this.cur, this.cur + size - 1 ) ).toHexString();
        if( isDefined( msg ) ) print( msg + ": " + out );
        this.moveCursor( size );
        return out;
    }
    
    this.ByteString = function( msg ) {
        var bsSize = parseInt( invertByteString( this.data.getRange( this.cur, this.cur + 3 ) ).toHexString() );
        this.moveCursor( 4 );
        var out = this.data.getRange( this.cur, this.cur + bsSize - 1 );
        if( isDefined( msg ) ) print( msg + ": " + out );
        this.moveCursor( bsSize );
        return out;
    }
    
    this.Byte = function( msg ) { return this.parseValueAndMoveCursor( msg, 1 ); }
    this.UInt16 = function( msg ) { return this.parseValueAndMoveCursor( msg, 2 ); }
    this.UInt32 = function( msg ) { return this.parseValueAndMoveCursor( msg, 4 ); }
    this.UInt64 = function( msg ) { return this.parseValueAndMoveCursor( msg, 8 ); }
    // *TODO* How to correctly interpret Hex as GUID
    this.GUID = function( msg ) { return new UaGuid.fromString( this.parseValueAndMoveCursor( msg, 16 ) ); }
    
    this.parseValueAndMoveCursor = function( msg, size ) {
        var out = parseInt( invertByteString( this.data.getRange( this.cur, this.cur + size - 1 ) ).toHexString() );
        if( isDefined( msg ) ) print( msg + ": " + out );
        this.moveCursor( size );
        return out;
    }
    
    return( true );
}

/**
 * Inverts Bytes of a ByteString
 * 
 * @param {UaByteString} bs - ByteString to return inverted
 *
 * @returns {UaByteString} Inverted ByteString
 */
function invertByteString( bs ) {
    var result = new UaByteString();
    for( var i=bs.length-1; i>=0; i-- ) result.append( bs.getRange( i, i ) );
    return( result );
}

/**
 * Retrieves a bit-range from a value and returns it as a Number
 * 
 * @param {Number} val - Value to get the bit-range from
 * @param {Number} fromIndex - Start bound of bit-range
 * @param {Number} toIndex - End bound of bit-range
 * @param {string} msg - (Optional) Value name to print output. If defined "{msg}: {return value}" will be printed
 *
 * @returns {Number} Returns bit-range as Number
 */
function getBitRange( val, fromIndex, toIndex, msg ) {
    if( fromIndex > toIndex ) throw( "getBitRange(): Invalid range defined" );
    var valStr = val.toString( 2 );
    var res = 0;
    for( var i=valStr.length-1-fromIndex; i>=valStr.length-1-toIndex; i-- ) if( i>=0 && valStr[i] == '1' ) res += Math.pow( 2, (valStr.length-1-fromIndex)-i );
    if( isDefined( msg ) ) print( msg + ": " + res );
    return( res );
}

/**
 * Retrieves a Bit at a certain position from a value
 * 
 * @param {Number} val - Value to retrieve the bit from
 * @param {Number} bitIndex - Index of the bit to retrieve
 * @param {string} msg - (Optional) Value name to print output. If defined "{msg}: {return value}" will be printed
 *
 * @returns {Number} Returns the bit at the specified bitIndex
 */
function getBit( val, bitIndex, msg ) {
    var res = ( ( ( val & Math.pow( 2, bitIndex ) ) == Math.pow( 2, bitIndex ) ) ? 1 : 0 );
    if( isDefined( msg ) ) print( msg + ": " + res );
    return( res );
}

/**
 * Converts a binary string to a Number
 * 
 * @param {string} val - Binary string to convert
 *
 * @returns {Number} Returns the converted binary string
 */
function bin( val ) {
    return( parseInt( val, 2 ) );
}

/**
 * Converts a Hex-String to an array of bytes
 * 
 * @param {string} byteArrayAsString - Hex string to convert
 *
 * @returns {Number[]} Returns the converted array of bytes
 */
function parseByteArray( byteArrayAsString ) {
    var result = [];
    var s = ( byteArrayAsString.substr( 0, 2 ) == "0x" ) ? 2 : 0;
    for( var i=s; i<byteArrayAsString.length; i += 2 ) result.push( parseInt( byteArrayAsString.substr( i, 2 ), 16 ) );
    return result;
}

/**
 * Decodes a DataSetField starting from the current cursor position of the passed Parser object
 * 
 * @param {Parser} parser - The parser object to use
 * @param {Number} fieldEncoding - (Optional) The Field Encoding to use
 *
 * @returns {UaVariant|UaByteString} Returns the encoded data, depending on the fieldEncoding
 */
function decodeDataSetField( parser, fieldEncoding ) {
    var result = null;
    switch( fieldEncoding ) {
        case bin("00"): // Variant
        
            // EncodingMask
            var encodingMask = parser.Byte();
            
            // ArrayLength
            var arrayLength = 1;
            var isArray = false;
            if( ( encodingMask & bin("10000000") ) == bin("10000000") ) {
                arrayLength = parser.UInt32();
                isArray = true;
            }
            
            // Value
            var builtInDataType = ( encodingMask & bin("00111111") );
            var value = [];
            for( var v=0; v<arrayLength; v++ ) {
                switch( builtInDataType ) {
                    case BuiltInType.Null:
                        value.push( null );
                        break;
                    case BuiltInType.Boolean:
                    case BuiltInType.SByte:
                    case BuiltInType.Byte:
                    case BuiltInType.Int16:
                    case BuiltInType.UInt16:
                    case BuiltInType.Int32:
                    case BuiltInType.UInt32:
                    case BuiltInType.Int64:
                    case BuiltInType.UInt64:
                        value.push( parser.parseValueAndMoveCursor( undefined, builtInTypeSize( builtInDataType, true ) ) );
                        break;
                    case BuiltInType.Double:
                    case BuiltInType.Float:
                        var tempBytes = parser.ByteArray( undefined, builtInTypeSize( builtInDataType, true ) );
                        value.push( IEEE754_fromBytes( parseByteArray( tempBytes ), ( builtInDataType == BuiltInType.Double ) ? 52 : 23 ) );
                        break;
                    
                    case BuiltInType.ByteString:
                        value.push( parser.ByteString() );
                        break;
                    case BuiltInType.String:
                        value.push( parser.ByteString().utf8ToString() );
                        break;
                        
                    case BuiltInType.Guid:
                        value.push( parser.GUID() );
                        break;
                        
                    // Yet unsupported type
                    default:
                        if( builtInTypeSize( builtInDataType, true ) != 0 ) { // If size is known, skip this single field only, returning 0
                            parser.parseValueAndMoveCursor( undefined, builtInTypeSize( builtInDataType, true ) );
                            addWarning( "decodeDataSetField(): Error decoding DataSetField: Decoding of BuiltInType '" + BuiltInType.toString( builtInDataType ) + "' is not supported yet, but has a known size. Field will be skipped." );
                            return 0;
                        }
                        else {
                            addWarning( "decodeDataSetField(): Error decoding DataSetField: Decoding of BuiltInType '" + BuiltInType.toString( builtInDataType ) + "' is not supported yet. Subsequent fields in this message will be skipped." );
                            return result;
                        }
                        break;
                }
            }
            
            if( !isArray ) value = value[0];
            if( isArray && value.length == 0 ) value = null;
            
            // ArrayDimensionsLength
            // ArrayDimensions
            var arrayDimensionsLength = -1;
            var arrayDimensions = [];
            if( ( encodingMask & bin("01000000") ) == bin("01000000") ) {
                arrayDimensionsLength = parser.UInt32();
                for( var a=0; a<arrayDimensionsLength; a++ ) arrayDimensions[a] = parser.UInt32();
                addWarning( "decodeDataSetField(): Error decoding DataSetField: Decoding of Multidimensional arrays fields is not supported yet." );
                return result;
            }
            
            if( value === null ) result = new UaVariant();
            else result = UaVariant.New( { Type: builtInDataType, Value: value, Array: isArray } );
            
        break;
        case bin("01"): // RawData
        
            result = new UaByteString();
            
        break;
        case bin("10"): // DataValue
        
            // *TODO* Implement decoding of DataValue encoded DataSetMessage fields
            addNotSupported( "Error decoding DataSetMessage fields. Decoding of DataValue encoded DataSetMessage fields not supported yet." );
            
        break;
        case bin("11"): // Reserved
        
            result = new UaByteString();
            
        break;
        default:
            addError( "decodeDataSetField(): Invalid fieldEncoding (" + fieldEncoding + ")" );
        break;
    }
    return( result );
}

/**
 * Decodes and initializes a NetworkMessage object from a raw UADP-Network-Message ByteString
 * 
 * @param {PubSubDataSetReaderMessage} pubSubDataSetReaderMessage - Received Message to decode and initialize
 *
 * @returns {boolean} Returns true on success, false if an error occurred during decoding
 */
function NetworkMessage( pubSubDataSetReaderMessage, config ) {
    
    this.PubSubDataSetReaderObject = pubSubDataSetReaderMessage.clone();
    
    this.NetworkMessageHeader = new Object();
      this.NetworkMessageHeader.UADPVersion_Flags = new Object();
      this.NetworkMessageHeader.ExtendedFlags1 = new Object();
      this.NetworkMessageHeader.ExtendedFlags2 = new Object();
      this.NetworkMessageHeader.PublisherId = null;
      this.NetworkMessageHeader.DataSetClassId = null;
    this.NetworkMessageHeaderSize = 0;
    this.GroupHeader = new Object();
      this.GroupHeader.GroupFlags = new Object();
      this.GroupHeader.WriterGroupId = null;
      this.GroupHeader.GroupVersion = null;
      this.GroupHeader.NetworkMessageNumber = null;
      this.GroupHeader.SequenceNumber = null;
    this.GroupHeaderSize = 0;
    this.PayloadHeader = new Object();
    this.PayloadHeaderSize = 0;
    this.SecurityHeader = new Object();
      this.SecurityHeader.SecurityFlags = new Object();
    this.Payload = new Object();
    
    // returns raw NetworkMessage as ByteString
    this.getRawNetworkMessageData = function() {
        return this.PubSubDataSetReaderObject.MessageToByteString();
    }
    
    this.initializeNetworkMessage = function( pubSubDataSetReaderMessage ) {
        if( !isDefined( pubSubDataSetReaderMessage ) ) throw( "NetworkMessage.initializeNetworkMessage(): No pubSubDataSetReaderMessage defined" );
        var networkMessage = pubSubDataSetReaderMessage.MessageToByteString();
        if( networkMessage.length == 0 ) throw( "NetworkMessage.initializeNetworkMessage(): Provided networkMessage has length of 0" );
        print( "\n================ Initializing received NetworkMessage ================\n" );
        
        var parser = new Parser( networkMessage );
        
        var cur=0;
        parser.startMeasure();
        
        this.NetworkMessageHeader.UADPVersion_Flags.Value = parser.Byte( "NetworkMessageHeader.UADPVersion_Flags" );
          this.NetworkMessageHeader.UADPVersion_Flags.UADPVersion = getBitRange( this.NetworkMessageHeader.UADPVersion_Flags.Value, 0, 3, "NetworkMessageHeader.UADPVersion_Flags.UADPVersion" );
          this.NetworkMessageHeader.UADPVersion_Flags.PublisherId = getBit( this.NetworkMessageHeader.UADPVersion_Flags.Value, 4, "NetworkMessageHeader.UADPVersion_Flags.PublisherId" );
          this.NetworkMessageHeader.UADPVersion_Flags.GroupHeader = getBit( this.NetworkMessageHeader.UADPVersion_Flags.Value, 5, "NetworkMessageHeader.UADPVersion_Flags.GroupHeader" );
          this.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader = getBit( this.NetworkMessageHeader.UADPVersion_Flags.Value, 6, "NetworkMessageHeader.UADPVersion_Flags.PayloadHeader" );
          this.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1 = getBit( this.NetworkMessageHeader.UADPVersion_Flags.Value, 7, "NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1" );
        
        if( this.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1 == 1 ) {
            this.NetworkMessageHeader.ExtendedFlags1.Value = parser.Byte( "NetworkMessageHeader.ExtendedFlags1" );
              this.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type = getBitRange( this.NetworkMessageHeader.ExtendedFlags1.Value, 0, 2, "NetworkMessageHeader.ExtendedFlags1.PublisherId_Type" );
              this.NetworkMessageHeader.ExtendedFlags1.DataSetClassId = getBit( this.NetworkMessageHeader.ExtendedFlags1.Value, 3, "NetworkMessageHeader.ExtendedFlags1.DataSetClassId" );
              this.NetworkMessageHeader.ExtendedFlags1.Security = getBit( this.NetworkMessageHeader.ExtendedFlags1.Value, 4, "NetworkMessageHeader.ExtendedFlags1.Security" );
              this.NetworkMessageHeader.ExtendedFlags1.Timestamp = getBit( this.NetworkMessageHeader.ExtendedFlags1.Value, 5, "NetworkMessageHeader.ExtendedFlags1.Timestamp" );
              this.NetworkMessageHeader.ExtendedFlags1.PicoSeconds = getBit( this.NetworkMessageHeader.ExtendedFlags1.Value, 6, "NetworkMessageHeader.ExtendedFlags1.PicoSeconds" );
              this.NetworkMessageHeader.ExtendedFlags1.ExtendedFlags2 = getBit( this.NetworkMessageHeader.ExtendedFlags1.Value, 7, "NetworkMessageHeader.ExtendedFlags1.ExtendedFlags2" );
        }
        
        if( this.NetworkMessageHeader.ExtendedFlags1.ExtendedFlags2 == 1 ) {
            this.NetworkMessageHeader.ExtendedFlags2.Value = parser.Byte( "NetworkMessageHeader.ExtendedFlags2" );
              this.NetworkMessageHeader.ExtendedFlags2.ChunkMessage = getBit( this.NetworkMessageHeader.ExtendedFlags2.Value, 0, "NetworkMessageHeader.ExtendedFlags2.ChunkMessage" );
              this.NetworkMessageHeader.ExtendedFlags2.PromotedFields = getBit( this.NetworkMessageHeader.ExtendedFlags2.Value, 1, "NetworkMessageHeader.ExtendedFlags2.PromotedFields" );
              this.NetworkMessageHeader.ExtendedFlags2.UADP_NetworkMessage_Type = getBitRange( this.NetworkMessageHeader.ExtendedFlags2.Value, 2, 4, "NetworkMessageHeader.ExtendedFlags2.UADP_NetworkMessage_Type" );
        }
        
        if( this.NetworkMessageHeader.UADPVersion_Flags.PublisherId == 1 ) {
            
            if( this.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1 == 0 ) {
                this.NetworkMessageHeader.PublisherId = parser.Byte( "NetworkMessageHeader.PublisherId" );
            }
            else {
                // handle as type defined in ExtendedFlags1.PublisherId_Type
                if( isDefined( this.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type ) ) {
                    switch( this.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type ) {
                        case bin("000"): // Byte
                            this.NetworkMessageHeader.PublisherId = parser.Byte( "NetworkMessageHeader.PublisherId" );
                        break;
                        case bin("001"): // UInt16
                            this.NetworkMessageHeader.PublisherId = parser.UInt16( "NetworkMessageHeader.PublisherId" );
                        break;
                        case bin("010"): // UInt32
                            this.NetworkMessageHeader.PublisherId = parser.UInt32( "NetworkMessageHeader.PublisherId" );
                        break;
                        case bin("011"): // UInt64
                            this.NetworkMessageHeader.PublisherId = parser.UInt64( "NetworkMessageHeader.PublisherId" );
                        break;
                        case bin("100"): // String
                            // *TODO* Discuss expected length of string
                            this.NetworkMessageHeader.PublisherId = parser.ByteArray( "NetworkMessageHeader.PublisherId", 8 );
                        break;
                        default:
                        addError( "Error decoding NetworkMessage: Invalid PublisherId_Type (" + this.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type + ")" );
                        return( false );
                    }    
                }
                else {
                    addError( "Error decoding NetworkMessage" );
                    return( false );
                }
            }
            
        }
        
        if( isDefined( this.NetworkMessageHeader.ExtendedFlags1 ) && this.NetworkMessageHeader.ExtendedFlags1.DataSetClassId == 1 ) {
            this.NetworkMessageHeader.DataSetClassId = parser.GUID( "NetworkMessageHeader.DataSetClassId" );
        }
            
        this.NetworkMessageHeaderSize = parser.getMeasuredLength();
        print( " Size of NetworkMessageHeader: " + this.NetworkMessageHeaderSize + " Byte" );
        
        parser.startMeasure();
        
        if( this.NetworkMessageHeader.UADPVersion_Flags.GroupHeader == 1 ) {
            
            this.GroupHeader.GroupFlags.Value = parser.Byte( "GroupHeader.GroupFlags" );
              this.GroupHeader.GroupFlags.WriterGroupId  = getBit( this.GroupHeader.GroupFlags.Value, 0, "GroupHeader.GroupFlags.WriterGroupId" );
              this.GroupHeader.GroupFlags.GroupVersion = getBit( this.GroupHeader.GroupFlags.Value, 1, "GroupHeader.GroupFlags.GroupVersion" );
              this.GroupHeader.GroupFlags.NetworkMessageNumber = getBit( this.GroupHeader.GroupFlags.Value, 2, "GroupHeader.GroupFlags.NetworkMessageNumber" );
              this.GroupHeader.GroupFlags.SequenceNumber = getBit( this.GroupHeader.GroupFlags.Value, 3, "GroupHeader.GroupFlags.SequenceNumber" );
              
            if( this.GroupHeader.GroupFlags.WriterGroupId == 1 ) {
                this.GroupHeader.WriterGroupId = parser.UInt16( "GroupHeader.WriterGroupId" );
            }
            
            if( this.GroupHeader.GroupFlags.GroupVersion == 1 ) {
                this.GroupHeader.GroupVersion = parser.UInt32( "GroupHeader.GroupVersion" );
            }
            
            if( this.GroupHeader.GroupFlags.NetworkMessageNumber == 1 ) {
                this.GroupHeader.NetworkMessageNumber = parser.UInt16( "GroupHeader.NetworkMessageNumber" );
            }
            
            if( this.GroupHeader.GroupFlags.SequenceNumber == 1 ) {
                this.GroupHeader.SequenceNumber = parser.UInt16( "GroupHeader.SequenceNumber" );
            }
              
        }
        
        this.GroupHeaderSize = parser.getMeasuredLength();
        print( " Size of GroupHeader: " + this.GroupHeaderSize + " Byte" );
        
        if( this.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader == 1 ) {
            
            var UADP_NetworkMessage_type = ( isDefined( this.NetworkMessageHeader.ExtendedFlags2.UADP_NetworkMessage_Type ) ) ? this.NetworkMessageHeader.ExtendedFlags2.UADP_NetworkMessage_Type : 0;   
            
            switch( UADP_NetworkMessage_type ) {
                // *TODO* Implement UADP_NetworkMessage_type 1 + 2
                case bin("001"):// NetworkMessage with discovery request payload
                {
                    addNotSupported( "Error decoding NetworkMessage. NetworkMessage with discovery request payload not supported yet." );
                    return( false );
                    break;
                }
                case bin("010"):// NetworkMessage with discovery response payload
                {
                    addNotSupported( "Error decoding NetworkMessage. NetworkMessage with discovery response payload not supported yet." );
                    return( false );
                    break;
                }
                default:// NetworkMessage with DataSetMessage payload
                {
                    
                    parser.startMeasure();
                    
                    if( this.NetworkMessageHeader.ExtendedFlags2.ChunkMessage == 1 ) {
                        this.PayloadHeader.DataSetWriterId = parser.UInt16( "PayloadHeader.DataSetWriterId" );
                    }
                    else {
                        this.PayloadHeader.Count = parser.Byte( "PayloadHeader.Count" );
                        this.PayloadHeader.DataSetWriterIds = [];
                        for( var i=0; i<this.PayloadHeader.Count; i++ ) {
                            this.PayloadHeader.DataSetWriterIds.push( parser.UInt16( "PayloadHeader.DataSetWriterIds[" + i + "]" ) );
                        }
                    }
                    
                    this.PayloadHeaderSize = parser.getMeasuredLength();
                    print( " Size of PayloadHeader: " + this.PayloadHeaderSize + " Byte" );
                    
                }
            }
        }
        
        if( this.NetworkMessageHeader.ExtendedFlags1.Timestamp == 1 ) {
            this.Timestamp = parser.UInt64( "Timestamp" );
        }
        
        if( this.NetworkMessageHeader.ExtendedFlags1.PicoSeconds == 1 ) {
            this.PicoSeconds = parser.UInt16( "PicoSeconds" );
        }
        
        if( this.NetworkMessageHeader.ExtendedFlags2.PromotedFields == 1 ) {
            
            // *TODO* Implement PromotedFields
            addNotSupported( "Error decoding NetworkMessage. PromotedFields not supported yet." );
            return( false );
            
        }
        
        parser.startMeasure();
        
        if( this.NetworkMessageHeader.ExtendedFlags1.Security == 1 ) {
            
            this.SecurityHeader.SecurityFlags.Value = parser.Byte( "SecurityHeader.SecurityFlags" );
              this.SecurityHeader.SecurityFlags.NetworkMessage_Signed_Flag  = getBit( this.SecurityHeader.SecurityFlags.Value, 0, "SecurityHeader.SecurityFlags.NetworkMessage_Signed_Flag" );
              this.SecurityHeader.SecurityFlags.NetworkMessage_Encrypted_Flag = getBit( this.SecurityHeader.SecurityFlags.Value, 1, "SecurityHeader.SecurityFlags.NetworkMessage_Encrypted_Flag" );
              this.SecurityHeader.SecurityFlags.SecurityFooter_Flag = getBit( this.SecurityHeader.SecurityFlags.Value, 2, "SecurityHeader.SecurityFlags.SecurityFooter_Flag" );
              this.SecurityHeader.SecurityFlags.Force_key_reset_Flag = getBit( this.SecurityHeader.SecurityFlags.Value, 3, "SecurityHeader.SecurityFlags.Force_key_reset_Flag" );
              
            this.SecurityHeader.SecurityTokenId = parser.UInt32( "SecurityHeader.SecurityTokenId" );
            this.SecurityHeader.NonceLength = parser.Byte( "SecurityHeader.NonceLength" );
            this.SecurityHeader.MessageNonce = parser.ByteArray( "SecurityHeader.MessageNonce", this.SecurityHeader.NonceLength );
            
            if( this.SecurityHeader.SecurityFlags.SecurityFooter_Flag == 1 ) {
                this.SecurityHeader.SecurityFooterSize = parser.UInt16( "SecurityHeader.SecurityFooterSize" );
            }
            
        }
        
        this.SecurityHeaderSize = parser.getMeasuredLength();
        print( " Size of SecurityHeader: " + this.SecurityHeaderSize + " Byte" );
        
        if( this.NetworkMessageHeader.ExtendedFlags2.ChunkMessage == 1 ) {
            
            // TODO: Test chunk message handling
            this.Payload.MessageSequenceNumber = parser.UInt16( "Payload.MessageSequenceNumber" );
            this.Payload.ChunkOffset = parser.UInt32( "Payload.ChunkOffset" );
            this.Payload.TotalSize = parser.UInt32( "Payload.TotalSize" );
            this.Payload.ChunkData = parser.ByteString( "Payload.ChunkData" );
            
        }
        else {
            
            // Payload.DataSetMessages
            
            var dataSetMessageCount = 0;
            var dataSetMessageSizes = [];
            var dataSetSizes = [];
            this.Payload.DataSetMessages = [];
            
            if( this.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader == 1 ) {
                // Get DataSetMessage positions by PayloadHeader Count and Sizes (DynamicLayout)
                dataSetMessageCount = this.PayloadHeader.Count;
                this.Payload.Sizes = [];
                // Omit Sizes if Count is one
                if( this.PayloadHeader.Count > 1 ) {
                    for( var i=0; i<this.PayloadHeader.Count; i++ ) {
                        this.Payload.Sizes.push( parser.UInt16( "Payload.Sizes[" + i + "]" ) );
                    }
                }
                dataSetMessageSizes = this.Payload.Sizes;
            }
            else if( this.NetworkMessageHeader.UADPVersion_Flags.GroupHeader == 1 ) {
                // Get DataSetMessage positions by DataSetOffsets (PeriodicFixedLayout)
                if( this.GroupHeader.GroupFlags.WriterGroupId == 1 ) {
                    
                    
                    // If Configuration argument is set, decode by local Configuration
                    if( isDefined( config ) ) {
                        var dataSetReaders = GetDataSetReadersByWriterGroupIdFromConfig( this.GroupHeader.WriterGroupId, config );
                        dataSetMessageCount = dataSetReaders.length;
                        if( dataSetMessageCount > 0 ) {
                            // Order DataSetReaders by DataSetOffset
                            dataSetReaders = orderDataSetReaderDataTypesByDataSetOffset( dataSetReaders );
                            // Calculate dataSetMessageSizes
                            for( var i=0; i<dataSetReaders.length; i++ ) {
                                var uaDataSetMetaData = dataSetReaders[i].DataSetMetaData;
                                dataSetSizes.push( calculateDataSetSizeByDataSetMetaData( uaDataSetMetaData ) );
                            }
                        }
                        else addLog( "No DataSetReaders found in PubSubConfiguration with WriterGroupId '" + this.GroupHeader.WriterGroupId + "'." );
                    }
                    else { // alternatively decode by exposed PubSubConfiguration from the server
                        var writerGroup = GetWriterGroupByWriterGroupId( this.GroupHeader.WriterGroupId );
                        if( isDefined( writerGroup ) ) {
                            var dataSetWriters = GetDataSetWritersOfWriterGroup( writerGroup );
                            dataSetMessageCount = dataSetWriters.length;
                            if( dataSetMessageCount > 0 ) {
                                // Order DataSetWriters by DataSetOffset
                                dataSetWriters = orderDataSetWritersbyDataSetOffset( dataSetWriters );
                                // Calculate dataSetMessageSizes
                                for( var i=0; i<dataSetWriters.length; i++ ) {
                                    var dataSetWriterMessageSettings = GetMessageSettings( dataSetWriters[i] );
                                    if( isDefined( dataSetWriterMessageSettings.ConfiguredSize ) && dataSetWriterMessageSettings.ConfiguredSize > 0 ) {
                                        dataSetSizes.push( dataSetWriterMessageSettings.ConfiguredSize );
                                    }
                                    else { // if ConfiguredSize is 0 or not defined, calculate the DataSet sizes by DataSetMetaData
                                        var publishedDataSet = GetPublishedDataSetOfDataSetWriter( dataSetWriters[i] );
                                        if( isDefined( publishedDataSet ) ) {
                                            var dataSetMetaData = ReadAllPropertiesOfItem( publishedDataSet ).DataSetMetaData;
                                            if( isDefined( dataSetMetaData ) ) {
                                                var uaDataSetMetaData = dataSetMetaData.toExtensionObject().toDataSetMetaDataType();
                                                dataSetSizes.push( calculateDataSetSizeByDataSetMetaData( uaDataSetMetaData ) );
                                            }
                                            else {
                                                addError( "Can't get DataSetMetaData from PublishedDataSet instance '" + publishedDataSet.NodeId + "'" );
                                                return( false );
                                            }
                                        }
                                        else {
                                            addError( "Error decoding NetworkMessage: Can't get PublishedDataSet for DataSetWriter instance '" + dataSetWriters[i].NodeId + "' from the server, which is needed to calculate the DataSet sizes." );
                                            return( false );
                                        }
                                    }
                                }
                            }
                            else addLog( "No HasDataSetWriter references found in WriterGroupType instance '" + writerGroup.NodeId + "'." );
                        }
                        else {
                            addError( "Error decoding NetworkMessage: Can't find WriterGroupType node with WriterGroupId '" + this.GroupHeader.WriterGroupId + "' in the server." );
                            return( false );
                        }
                    }
                }
                else {
                    addError( "Error decoding NetworkMessage: GroupHeader.WriterGroupId not set. Therefore the MessageSettings of the WriterGroup cannot be read." );
                    return( false );
                }
            }
            else {
                addError( "Error decoding NetworkMessage: Neither GroupHeader nor PayloadHeader flag is set." );
                return( false );
            }
            
            // Decrypt Payload if Encrypted_Flag is set
            if( this.SecurityHeader.SecurityFlags.NetworkMessage_Encrypted_Flag == 1 ) {
                // Calculate Payload length
                var payloadLength = 0;
                for( var pl=0; pl<dataSetSizes.length; pl++ ) payloadLength += dataSetSizes[pl] + 5; // DataSetMessageHeader assumed to be 5 Bytes
                var encryptedPayload = parser.data.getRange( parser.cur, parser.cur + payloadLength - 1 );
                
                // *TODO* Implement Decryption
                addNotSupported( "Error decoding NetworkMessage. NetworkMessage_Encrypted_Flag is set, but PubSub security is not supported yet." );
                return( false );
                
            }
            
            for( var i=0; i<dataSetMessageCount; i++ ) {
                
                parser.startMeasure();

                this.Payload.DataSetMessages.push( new Object() );
                
                this.Payload.DataSetMessages[i].DataSetFlags1 = new Object();
                this.Payload.DataSetMessages[i].DataSetFlags1.Value = parser.Byte( "Payload.DataSetMessages[" + i + "].DataSetFlags1" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.DataSetMessageIsValid = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 0, "Payload.DataSetMessages[" + i + "].DataSetFlags1.DataSetMessageIsValid" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.FieldEncoding = getBitRange( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 1, 2, "Payload.DataSetMessages[" + i + "].DataSetFlags1.FieldEncoding" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.DataSetMessageSequenceNumber = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 3, "Payload.DataSetMessages[" + i + "].DataSetFlags1.DataSetMessageSequenceNumber" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.Status = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 4, "Payload.DataSetMessages[" + i + "].DataSetFlags1.Status" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.ConfigurationVersionMajorVersion = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 5, "Payload.DataSetMessages[" + i + "].DataSetFlags1.ConfigurationVersionMajorVersion" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.ConfigurationVersionMinorVersion = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 6, "Payload.DataSetMessages[" + i + "].DataSetFlags1.ConfigurationVersionMinorVersion" );
                  this.Payload.DataSetMessages[i].DataSetFlags1.DataSetFlags2 = getBit( this.Payload.DataSetMessages[i].DataSetFlags1.Value, 7, "Payload.DataSetMessages[" + i + "].DataSetFlags1.DataSetFlags2" );
                  
                if( this.Payload.DataSetMessages[i].DataSetFlags1.DataSetFlags2 == 1 ) {
                    this.Payload.DataSetMessages[i].DataSetFlags2 = new Object();
                    this.Payload.DataSetMessages[i].DataSetFlags2.Value = parser.Byte( "Payload.DataSetMessages[" + i + "].DataSetFlags2" );
                      this.Payload.DataSetMessages[i].DataSetFlags2.UADP_DataSetMessage_type = getBitRange( this.Payload.DataSetMessages[i].DataSetFlags2.Value, 0, 3, "Payload.DataSetMessages[" + i + "].DataSetFlags2.UADP_DataSetMessage_type" );
                      this.Payload.DataSetMessages[i].DataSetFlags2.Timestamp = getBit( this.Payload.DataSetMessages[i].DataSetFlags2.Value, 4, "Payload.DataSetMessages[" + i + "].DataSetFlags2.Timestamp" );
                      this.Payload.DataSetMessages[i].DataSetFlags2.PicoSeconds = getBit( this.Payload.DataSetMessages[i].DataSetFlags2.Value, 5, "Payload.DataSetMessages[" + i + "].DataSetFlags2.PicoSeconds" );
                }
                
                if( this.Payload.DataSetMessages[i].DataSetFlags1.DataSetMessageSequenceNumber == 1 ) {
                    this.Payload.DataSetMessages[i].DataSetMessageSequenceNumber = parser.UInt16( "Payload.DataSetMessages[" + i + "].DataSetMessageSequenceNumber" );
                }
                
                if( isDefined( this.Payload.DataSetMessages[i].DataSetFlags2 ) ) {
                    if( this.Payload.DataSetMessages[i].DataSetFlags2.Timestamp == 1 ) {
                        this.Payload.DataSetMessages[i].Timestamp = parser.UInt64( "Payload.DataSetMessages[" + i + "].Timestamp" );// *TODO* uncomment when fromNTTime() is implemented UaDateTime.fromNTTime( parser.UInt64( "Payload.DataSetMessages[" + i + "].Timestamp" ) );
                    }

                    if( this.Payload.DataSetMessages[i].DataSetFlags2.PicoSeconds == 1 ) {
                        this.Payload.DataSetMessages[i].PicoSeconds = parser.UInt16( "Payload.DataSetMessages[" + i + "].PicoSeconds" );
                    }
                }
                
                if( this.Payload.DataSetMessages[i].DataSetFlags1.Status == 1 ) {
                    this.Payload.DataSetMessages[i].Status = parser.UInt16( "Payload.DataSetMessages[" + i + "].Status" );
                }
                
                if( this.Payload.DataSetMessages[i].DataSetFlags1.ConfigurationVersionMajorVersion == 1 ) {
                    this.Payload.DataSetMessages[i].ConfigurationVersionMajorVersion = parser.UInt32( "Payload.DataSetMessages[" + i + "].ConfigurationVersionMajorVersion" );
                }
                
                if( this.Payload.DataSetMessages[i].DataSetFlags1.ConfigurationVersionMinorVersion == 1 ) {
                    this.Payload.DataSetMessages[i].ConfigurationVersionMinorVersion = parser.UInt32( "Payload.DataSetMessages[" + i + "].ConfigurationVersionMinorVersion" );
                }
                
                this.Payload.DataSetMessages[i].DataSetMessageHeaderSize = parser.getMeasuredLength();
                print( " Size of DataSetMessageHeader: " + this.Payload.DataSetMessages[i].DataSetMessageHeaderSize + " Byte" );
                
                // *TODO* MessageData decode
                // Determine MessageData size
                if( this.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader == 1 ) {
                    if( dataSetMessageSizes.length > 1 ) {
                        var msgDataSize = dataSetMessageSizes[i] - this.Payload.DataSetMessages[i].DataSetMessageHeaderSize;
                    }
                    else {
                        // If PayloadHeader.Count is one the size of the DataSetMessage is the rest of the NetworkMessage - ( SecurityFooter + Signature )
                        if( this.SecurityHeader.SecurityFlags.NetworkMessage_Encrypted_Flag == 1 ) {
                            // *TODO* Implement Security (Signature length calculation)
                            addNotSupported( "Error decoding NetworkMessage. NetworkMessage_Encrypted_Flag is set, but PubSub security is not supported yet." );
                            return( false );
                        }
                        else {
                            var msgDataSize = ( parser.getDataLength() - parser.getCursorPos() );
                        }
                    }
                }
                else if( dataSetSizes.length > 0 ) {
                    var msgDataSize = dataSetSizes[i];
                }
                else {
                    addError( "Error decoding NetworkMessage: Number of DataSetMessages in the NetworkMessage is >1 but neither DataSetMessageSizes nor DataSetSizes could be found/calculated." );
                    return( false );
                }
                
                // Decode MessageData
                var messageDataOffset = parser.getCursorPos();
                this.Payload.DataSetMessages[i].MessageData = new Object();
                this.Payload.DataSetMessages[i].MessageData.Value = parser.ByteArray( "Payload.DataSetMessages[" + i + "].MessageData", msgDataSize );
                parser.setCursorPos( messageDataOffset );
                
                var UadpDataSetMessageType = 0;
                if( this.Payload.DataSetMessages[i].DataSetFlags1.DataSetFlags2 == 1 ) UadpDataSetMessageType = this.Payload.DataSetMessages[i].DataSetFlags2.UADP_DataSetMessage_type;
                
                switch( UadpDataSetMessageType ) {
                    case bin("0000"): // Data Key Frame
                        
                        if( msgDataSize > 0 ) { // Omit decoding if Message is a heartbeat message
                            // FieldCount
                            if( this.Payload.DataSetMessages[i].DataSetFlags1.FieldEncoding == bin("01") ) { // Omit FieldCount if RawData field encoding is set
                                this.Payload.DataSetMessages[i].MessageData.FieldCount = 1;
                            }
                            else {
                                this.Payload.DataSetMessages[i].MessageData.FieldCount = parser.UInt16( "Payload.DataSetMessages[" + i + "].MessageData.FieldCount" );
                            }
                            // DataSetFields
                            this.Payload.DataSetMessages[i].MessageData.DataSetFields = [];
                            for( var f=0; f<this.Payload.DataSetMessages[i].MessageData.FieldCount; f++ ) {
                                var decodedValue = decodeDataSetField( parser, this.Payload.DataSetMessages[i].DataSetFlags1.FieldEncoding );
                                if( decodedValue === null ) break;
                                this.Payload.DataSetMessages[i].MessageData.DataSetFields[f] = decodedValue;
                            }
                        }
                        
                    break;
                    case bin("0001"): // Data Delta Frame
                    
                        // *TODO* Implement decoding of Data Delta Frame message
                        addNotSupported( "Error decoding NetworkMessage. Decoding of a Data Delta Frame DataSetMessage not supported yet." );
                        return( false );
                        
                    break;
                    case bin("0010"): // Event
                    
                        // *TODO* Implement decoding of Event message
                        addNotSupported( "Error decoding NetworkMessage. Decoding of an Event DataSetMessage not supported yet." );
                        return( false );
                        
                    break;
                    case bin("0011"): // Keep Alive
                    
                        // *TODO* Implement decoding of Keep Alive message
                        addNotSupported( "Error decoding NetworkMessage. Decoding of a Keep Alive DataSetMessage not supported yet." );
                        return( false );
                        
                    break;
                    default:
                        addLog( "Received reserved DataSetFlags2.UADP_DataSetMessage_type (" + UadpDataSetMessageType + ") in DataSetMessage #" + i + ". Skipping message." );
                    break;
                }
                
                // correct cursor position in case of a decoding error of the messagedata
                parser.setCursorPos( messageDataOffset + msgDataSize );
                
                this.Payload.DataSetMessages[i].DataSetMessageFrameSize = parser.getMeasuredLength();
                print( " Size of DataSetMessageFrame: " + this.Payload.DataSetMessages[i].DataSetMessageFrameSize + " Byte" );
            }
            
        }
        
        if( this.SecurityHeader.SecurityFlags.SecurityFooter == 1 ) {
            this.SecurityFooter = parser.ByteArray( "SecurityFooter", this.SecurityHeader.SecurityFooterSize );
        }
        
        if( parser.getDataLength() > parser.getCursorPos() ) {
            this.Signature = parser.ByteArray( "Signature", ( parser.getDataLength() - parser.getCursorPos() ) );
        }
        
        print( "\n======================================================================\n" );
        return( true );
    }
    if( isDefined( pubSubDataSetReaderMessage ) ) {
        if( !this.initializeNetworkMessage( pubSubDataSetReaderMessage ) ) {
            addError( "Error initializing NetworkMessage with MessageData: " + pubSubDataSetReaderMessage.MessageToByteString() );
        }
    }
}