/* Includes: 
    UaVariableAttributes.New()
    UaVariableTypeAttributes.New()
    UaVariant.New()
    UaVariant.Increment()
    UaVariant.FromUaType()
    UaVariant.SetValueMax()
    UaVariant.SetValueMin()
    UaViewAttributes.New()
    UaVQTSupport enumeration
*/
include( "./library/Base/locales.js" );
const MAX_SAFE_INTEGER = 9007199254740992;

UaVariableAttributes.New = function( args ) {
    var x = new UaVariableAttributes();
    if( isDefined( args.AccessLevel ) ) x.AccessLevel = args.AccessLevel;
    if( isDefined( args.ArrayDimensions ) ) x.ArrayDimensions = args.ArrayDimensions;
    if( isDefined( args.DataType ) ) x.DataType = args.DataType;
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.Historizing ) ) x.Historizing = args.Historizing;
    if( isDefined( args.MinimumSamplingInterval ) ) x.MinimumSamplingInterval = args.MinimumSamplingInterval;
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.UserAccessLevel ) ) x.UserAccessLevel = args.UserAccessLevel;
    if( isDefined( args.UserWriteMask ) ) x.UserWriteMask = args.UserWriteMask;
    if( isDefined( args.Value ) ) x.Value = args.Value;
    if( isDefined( args.ValueRank ) ) x.ValueRank = args.ValueRank;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    if( isDefined( args.ToExtensionObject ) ) {
        var extObj = new UaExtensionObject();
        extObj.setVariableAttributes( x );
        x = extObj;
    }
    return( x );
}

UaVariableTypeAttributes.New = function( args ) {
    var x = new UaVariableTypeAttributes();
    if( isDefined( args.ArrayDimensions ) ) {
        if( !isDefined( args.ArrayDimensions.length ) ) args.ArrayDimensions = [ args.ArrayDimensions ];
        for( i=0; i<args.ArrayDimensions.length; i++ ) x.ArrayDimensions[i] = args.ArrayDimensions[i];
    }
    if( isDefined( args.DataType ) ) x.DataType = args.DataType;
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.IsAbstract ) ) x.IsAbstract = args.IsAbstract;
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.UserWriteMask ) ) x.UserWriteMask = args.UserWriteMask;
    if( isDefined( args.Value ) ) x.Value = args.Value;
    if( isDefined( args.ValueRank ) ) x.ValueRank = args.ValueRank;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    if( isDefined( args.ToExtensionObject ) ) {
        var extObj = new UaExtensionObject();
        extObj.setVariableTypeAttributes( x );
        x = extObj;
    }
    return( x );
}

// Converts the UaVariant type to a native Javascript type
UaVariant.FromUaType = function( args ) {
    if( !isDefined( args ) ) throw( "args not specified." );
    if( !isDefined( args.Value ) )throw( "[UaVariant.ToJSValue] args.Value not specified." );
    if( args.Value.ArrayType === VariantArrayType.Scalar ) {
        switch( args.Value.DataType ) {
            case BuiltInType.Boolean:         return( args.Value.toBoolean() );        break;
            case BuiltInType.Byte:            return( args.Value.toByte() );           break;
            case BuiltInType.ByteString:      return( args.Value.toByteString() );     break;
            case BuiltInType.DataValue:       return( args.Value.toDataValue() );      break;
            case BuiltInType.DiagnosticInfo:  return( args.Value.toDiagnosticInfo() ); break;
            case BuiltInType.DateTime:        return( args.Value.toDateTime() );       break;
            case BuiltInType.DataValue:       return( args.Value.toDataValue() );      break;
            case BuiltInType.Double:          return( args.Value.toDouble() );         break;
            case BuiltInType.ExpandedNodeId:  return( args.Value.toExpandedNodeId() );  break;
            case BuiltInType.ExtensionObject: return( args.Value.toExtensionObject() ); break;
            case BuiltInType.Float:           return( args.Value.toFloat() );         break;
            case BuiltInType.Guid:            return( args.Value.toGuid() );          break;
            case BuiltInType.Int16:           return( args.Value.toInt16() );         break;
            case BuiltInType.Int32:           return( args.Value.toInt32() );         break;
            case BuiltInType.Int64:           return( args.Value.toInt64() );         break;
            case BuiltInType.LocalizedText:   return( args.Value.toLocalizedText() ); break;
            case Identifier.NodeId:           return( args.Value.toNodeId() );        break;
            case BuiltInType.SByte:           return( args.Value.toSByte() );      break;
            case BuiltInType.StatusCode:      return( args.Value.toStatusCode() ); break;
            case BuiltInType.String:          return( args.Value.toString() );     break;
            case BuiltInType.QualifiedName:   return( args.Value.toQualifiedName() ); break;
            case BuiltInType.UInt16:          return( args.Value.toUInt16() );     break;
            case BuiltInType.UInt32:          return( args.Value.toUInt32() );     break;
            case BuiltInType.UInt64:          return( args.Value.toUInt64() );     break;
            case BuiltInType.Variant:         return( args.Value.toVariant() );    break;
            case BuiltInType.XmlElement:      return( args.Value.toXmlElement() ); break;
            default: return( null );                                               break;
        }// switch
    }
    else if( args.Value.ArrayType === VariantArrayType.Array ) {
        switch( args.Value.DataType ) {
            case BuiltInType.Boolean:         return( args.Value.toBooleanArray() );    break;
            case BuiltInType.Byte:            return( args.Value.toByteArray() );       break;
            case BuiltInType.ByteString:      return( args.Value.toByteStringArray() ); break;
            case BuiltInType.DateTime:        return( args.Value.toDateTimeArray() );   break;
            case BuiltInType.DataValue:       return( args.Value.toDataValueArray() );  break;
            case BuiltInType.DiagnosticInfo:  return( args.Value.toDiagnosticInfoArray() ); break;
            case BuiltInType.Double:          return( args.Value.toDoubleArray() );     break;
            case BuiltInType.ExpandedNodeId:  return( args.Value.toExpandedNodeIdArray() );  break;
            case BuiltInType.ExtensionObject: return( args.Value.toExtensionObjectArray() ); break;
            case BuiltInType.Float:           return( args.Value.toFloatArray() );      break;
            case BuiltInType.Guid:            return( args.Value.toGuidArray() );       break;
            case BuiltInType.Int16:           return( args.Value.toInt16Array() );      break;
            case BuiltInType.Int32:           return( args.Value.toInt32Array() );      break;
            case BuiltInType.Int64:           return( args.Value.toInt64Array() );      break;
            case BuiltInType.LocalizedText:   return( args.Value.toLocalizedTextArray() ); break;
            case Identifier.NodeId:           return( args.Value.toNodeIdArray() );        break;
            case BuiltInType.SByte:           return( args.Value.toSByteArray() );      break;
            case BuiltInType.StatusCode:      return( args.Value.toStatusCodeArray() ); break;
            case BuiltInType.String:          return( args.Value.toStringArray() );     break;
            case BuiltInType.QualifiedName:   return( args.Value.toQualifiedNameArray() ); break;
            case BuiltInType.UInt16:          return( args.Value.toUInt16Array() );     break;
            case BuiltInType.UInt32:          return( args.Value.toUInt32Array() );     break;
            case BuiltInType.UInt64:          return( args.Value.toUInt64Array() );     break;
            case BuiltInType.Variant:         return( args.Value.toVariantArray() );    break;
            case BuiltInType.XmlElement:      return( args.Value.toXmlElementArray() ); break;
            default: return( null );                                                    break;
        }// switch
    }
}

// Parameters:
//    Variant: actual variant to use
//    Length: new size of the array
//    Value: (optional) initial value to populate in each element
UaVariant.Fill = function( args ) {
    if( args === undefined || args === null ) return;
    if( args.Variant == undefined || args.Variant == null ) return;
    if( args.Length == undefined || args.Length == null ) return;
    if( args.Value == undefined || args.Value == null ) args.Value = 0;
    switch( args.Variant.DataType ) {
        case BuiltInType.Boolean: {
            var v = new UaBooleans();
            for( var i=0; i<args.Length; i++ ) v[i] = args.Value;
            args.Variant.setBooleanArray( v );
            break;
        }
        case BuiltInType.Byte: {
            var b = new UaBytes();
            for( var i=0; i<args.Length; i++ ) b[i] = args.Value;
            args.Variant.setByteArray( b );
            break;
        }
        case BuiltInType.ByteString: {
            // is this a REAL bytestring? or a Byte[] converted to a ByteString?
            if (args.Variant.ArrayType !== 0) {
                var s = UaByteString.fromStringData(args.Value.toString() );
                var ss = UaByteStrings();
                for (var i = 0; i < args.Length; i++) ss[i] = s.clone();
                args.Variant.setByteStringArray(ss);
            }
            else {
                // this seems to be Bytes[] converted to ByteString. We must go ByteString->byte[] and then byte[]->ByteString
                var b = new UaBytes();
                for (var i = 0; i < args.Length; i++ ) b[i] = args.Value;
                var ss = UaByteStrings();
                ss = UaByteString.FromByteArray( b );
                args.Variant.setByteString( ss );
            }
            break;
        }
        case BuiltInType.DateTime: {
            var d = new UaDateTimes();
            for( var i=0; i<args.Length; i++ ) d[i] = UaDateTime.utcNow();
            args.Variant.setDateTimeArray( d );
            break;
        }
        case BuiltInType.Double: {
            var d = new UaDoubles();
            for( var i=0; i<args.Length; i++ ) d[i] = args.Value;
            args.Variant.setDoubleArray( d );
            break;
        }
        case BuiltInType.Float: {
            var f = new UaFloats();
            for( var i=0; i<args.Length; i++ ) f[i] = args.Value;
            args.Variant.setFloatArray( f );
            break;
        }
        case BuiltInType.Guid: {
            var g = new UaGuids();
            for( var i=0; i<args.Length; i++ ) g[i] = new UaGuid();
            args.Variant.setGuidArray( g );
            break;
        }
        case BuiltInType.Int16: {
            var x = new UaInt16s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setInt16Array( x );
            break;
        }
        case BuiltInType.Int32: {
            var x = new UaInt32s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setInt32Array( x );
            break;
        }
        case BuiltInType.Int64: {
            var x = new UaInt64s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setInt64Array( x );
            break;
        }
        case BuiltInType.SByte: {
            var x = new UaSBytes();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setSByteArray( x );
            break;
        }
        case BuiltInType.String: {
            var x = new UaStrings();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value.toString();
            args.Variant.setStringArray( x );
            break;
        }
        case BuiltInType.UInt16: {
            var x = new UaUInt16s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setUInt16Array( x );
            break;
        }
        case BuiltInType.UInt32: {
            var x = new UaUInt32s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setUInt32Array( x );
            break;
        }
        case BuiltInType.UInt64: {
            var x = new UaUInt64s();
            for( var i=0; i<args.Length; i++ ) x[i] = args.Value;
            args.Variant.setUInt64Array( x );
            break;
        }
    }
}

UaVariant.New = function( args ) { 
    if( !isDefined( args ) ) throw( "args not specified." );
    if( !isDefined( args.Value ) ) throw( "[UaVariant.New] args.Value not specified." );
    if( args.Value === "null" ) args.Value = null;
    if( !isDefined( args.Type ) ) args.Type = BuiltInType.Variant;
    if( !isDefined( args.Array ) ) args.Array = false;
    var v = new UaVariant();
    if( !args.Array ) {
        switch( args.Type ) {
            case BuiltInType.Boolean: v.setBoolean( args.Value ); break;
            case BuiltInType.Byte: v.setByte( args.Value ); break;
            case BuiltInType.ByteString: v.setByteString( args.Value ); break;
            case Identifier.UtcTime:
            case BuiltInType.DateTime: v.setDateTime( args.Value ) ; break;
            case BuiltInType.DataValue: v.setDataValue( args.Value ); break;
            case BuiltInType.DiagnosticInfo: v.setDiagnosticInfo( args.Value ); break;
            case BuiltInType.Double: v.setDouble( args.Value ); break;
            case BuiltInType.ExpandedNodeId: v.setExpandedNodeId( args.Value ); break;
            case BuiltInType.ExtensionObject: v.setExtensionObject( args.Value ); break;
            case BuiltInType.Float: v.setFloat( args.Value ); break;
            case BuiltInType.Guid: v.setGuid( args.Value ); break;
            case BuiltInType.Int16: v.setInt16( args.Value ); break;
            case BuiltInType.Int32: v.setInt32( args.Value ); break;
            case BuiltInType.Int64: v.setInt64( args.Value ); break;
            case BuiltInType.LocalizedText: v.setLocalizedText( args.Value ); break;
            case Identifier.NodeId: v.setNodeId( args.Value ); break;
            case BuiltInType.SByte: v.setSByte( args.Value ); break;
            case BuiltInType.StatusCode: v.setStatusCode( args.Value ); break;
            case BuiltInType.String: v.setString( args.Value ); break;
            case BuiltInType.QualifiedName: v.setQualifiedName( args.Value ); break;
            case BuiltInType.UInt16: v.setUInt16( args.Value ); break;
            case BuiltInType.UInt32: v.setUInt32( args.Value ); break;
            case BuiltInType.UInt64: v.setUInt64( args.Value ); break;
            case BuiltInType.Variant: v.setVariant( args.Value ); break;
            case BuiltInType.XmlElement: v.setXmlElement( args.Value ); break;
            default: throw( "UaVariant.New() cannot create the UaVariant because the specified type '" + args.Type + "' is not supported" );
        }
    }
    else {
        if( !isDefined( args.Value.length ) ) throw( "UaVariant.New() cannot create an array because the specified value is not an array!" );
        if( isDefined( args.Value.name ) ) {
            // the 'Value' is using a native type, e.g. UaInt16s()
            switch( args.Type ) {
                case BuiltInType.Boolean: v.setBooleanArray( args.Value ); break;
                case BuiltInType.Byte: v.setByteArray( args.Value ); break;
                case BuiltInType.ByteString: v.setByteStringArray( args.Value ); break;
                case Identifier.UtcTime:
                case BuiltInType.DateTime: v.setDateTimeArray( args.Value ) ; break;
                case BuiltInType.DataValue: v.setDataValueArray( args.Value ); break;
                case BuiltInType.DiagnosticInfo: v.setDiagnosticInfoArray( args.Value ); break;
                case BuiltInType.Double: v.setDoubleArray( args.Value ); break;
                case BuiltInType.ExpandedNodeId: v.setExpandedNodeIdArray( args.Value ); break;
                case BuiltInType.ExtensionObject: v.setExtensionObjectArray( args.Value ); break;
                case BuiltInType.Float: v.setFloatArray( args.Value ); break;
                case BuiltInType.Guid: v.setGuidArray( args.Value ); break;
                case BuiltInType.Int16: v.setInt16Array( args.Value ); break;
                case BuiltInType.Int32: v.setInt32Array( args.Value ); break;
                case BuiltInType.Int64: v.setInt64Array( args.Value ); break;
                case BuiltInType.LocalizedText: v.setLocalizedTextArray( args.Value ); break;
                case Identifier.NodeId: v.setNodeIdArray( args.Value ); break;
                case BuiltInType.SByte: v.setSByteArray( args.Value ); break;
                case BuiltInType.StatusCode: v.setStatusCodeArray( args.Value ); break;
                case BuiltInType.String: v.setStringArray( args.Value ); break;
                case BuiltInType.QualifiedName: v.setQualifiedNameArray( args.Value ); break;
                case BuiltInType.UInt16: v.setUInt16Array( args.Value ); break;
                case BuiltInType.UInt32: v.setUInt32Array( args.Value ); break;
                case BuiltInType.UInt64: v.setUInt64Array( args.Value ); break;
                case BuiltInType.Variant: v.setVariantArray( args.Value ); break;
                case BuiltInType.XmlElement: v.setXmlElementArray( args.Value ); break;
                default: throw( "UaVariant.New() cannot create an array because the specified type '" + args.Type + "' is not supported" );
            }//switch
        }
        else {
            switch( args.Type ) {
                case BuiltInType.Boolean: {
                    var x = new UaBooleans();
                    for( var i=0; i<args.Value.length; i++ ) x[i] = args.Value[i];
                    v.setBooleanArray( x ); break;
                }
                case BuiltInType.Byte: v.setByteArray( args.Value ); break;
                case BuiltInType.ByteString: v.setByteStringArray( args.Value ); break;
                case Identifier.UtcTime:
                case BuiltInType.DateTime: v.setDateTimeArray( args.Value ) ; break;
                case BuiltInType.DataValue: v.setDataValueArray( args.Value ); break;
                case BuiltInType.DiagnosticInfo: v.setDiagnosticInfoArray( args.Value ); break;
                case BuiltInType.Double: v.setDoubleArray( args.Value ); break;
                case BuiltInType.ExpandedNodeId: v.setExpandedNodeIdArray( args.Value ); break;
                case BuiltInType.ExtensionObject: v.setExtensionObjectArray( args.Value ); break;
                case BuiltInType.Float: v.setFloatArray( args.Value ); break;
                case BuiltInType.Guid: v.setGuidArray( args.Value ); break;
                case BuiltInType.Int16: v.setInt16Array( args.Value ); break;
                case BuiltInType.Int32: {
                    var x = new UaInt32s();
                    for( var i=0; i<args.Value.length; i++ ) x[i] = args.Value[i];
                    v.setInt32Array( x ); break;
                }
                case BuiltInType.Int64: v.setInt64Array( args.Value ); break;
                case BuiltInType.LocalizedText: v.setLocalizedTextArray( args.Value ); break;
                case Identifier.NodeId: v.setNodeIdArray( args.Value ); break;
                case BuiltInType.SByte: v.setSByteArray( args.Value ); break;
                case BuiltInType.StatusCode: v.setStatusCodeArray( args.Value ); break;
                case BuiltInType.String: v.setStringArray( args.Value ); break;
                case BuiltInType.QualifiedName: v.setQualifiedNameArray( args.Value ); break;
                case BuiltInType.UInt16: v.setUInt16Array( args.Value ); break;
                case BuiltInType.UInt32: {
                    var x = new UaUInt32s();
                    for( var i=0; i<args.Value.length; i++ ) x[i] = args.Value[i];
                    v.setUInt32Array( x ); break;
                }
                case BuiltInType.UInt64: v.setUInt64Array( args.Value ); break;
                case BuiltInType.Variant: v.setVariantArray( args.Value ); break;
                case BuiltInType.XmlElement: v.setXmlElementArray( args.Value ); break;
                default: throw( "UaVariant.New() cannot create an array because the specified type '" + args.Type + "' is not supported" );
            }//switch
        }
    }
    return( v );
}

UaVariant.Increment = function( args ) {
    if( !isDefined( args ) ) throw( "UaVariant.Increment::args not specified." );
    if( !isDefined( args.Item ) ) {
        if( !isDefined( args.Value ) ) throw( "UaVariant.Increment::args.Value not specified." );
    }
    else {
        if( !isDefined( args.Value ) ) args.Value = args.Item.Value;
    }
    if( !isDefined( args.Increment ) ) args.Increment = 1;
    var val = isDefined( args.Value.Value ) ? args.Value.Value : args.Value; // if the Variant (contains VQT) then re-wire to be just V.
    if( undefined === val.setBoolean ) throw( "UaVariant.Increment:args.Value is not a UaVariant type." );
    // check if the current value is null or NaN, if so, set the value to the minimum value.
    if ( val.isEmpty() || val.toString() === "null" || val.toString() === "NaN" ) UaVariant.SetValueMin( { Value: args.Value } );
    if( isDefined( args.Range ) ) {
        if( !isDefined( args.Range.High ) || !isDefined( args.Range.Low ) ) throw( "UaVariant.Increment::args.Range is not a valid 'Range' object." );
        // do we need to switch the high/low ordering?
        if( args.Range.High < args.Range.Low ) {
            var low = args.Range.Low;
            args.Range.Low = args.Range.High;
            args.Range.High = low;
        }
        // now to increment the value.
        switch( val.DataType ) {
            case BuiltInType.Byte: 
                if( val.toByte() >= args.Range.High || val.toByte() < args.Range.Low ) val.setByte( args.Range.Low ); 
                break;
            case BuiltInType.Double:
                var referenceValue = val.toDouble() + args.Increment;
                if( isNaN( val.toDouble() ) + isNaN( referenceValue ) + referenceValue == val.toDouble() ) {
                    val.setDouble( 0.0 );
                }
                if( val.toDouble() >= args.Range.High || val.toDouble() < args.Range.Low ) val.setDouble( args.Range.Low );
                break;
            case Identifier.Duration:
                if( val.toDouble() === 9007199254740992 ) val.setDouble( 0 );
                if( val.toDouble() >= args.Range.High || val.toDouble() < args.Range.Low ) val.setDouble( args.Range.Low );
                break;
            case BuiltInType.Float:
                var referenceValue = val.toFloat() + 0.1;
                if( isNaN( val.toFloat() ) + isNaN( referenceValue ) + referenceValue == val.toFloat() ) {
                    val.setFloat( 0.0 );
                }
                if( val.toFloat() >= args.Range.High || val.toFloat() < args.Range.Low ) val.setFloat( args.Range.Low );
                break;
            case BuiltInType.Guid:
                switch( __guidPos++ ) {
                    case 0: val.setGuid( new UaGuid( __guids[0] ) ); break;
                    case 1: val.setGuid( new UaGuid( __guids[1] ) ); break;
                    case 2: 
                        __guidPos = -1;
                        val.setGuid( new UaGuid( __guids[2] ) );
                        break;
                    default:
                        __guidPos = -1;
                        val.setGuid( new UaGuid( __guids[1] ) );
                        break;
                }
            case BuiltInType.Int16:
                if( val.toInt16() >= args.Range.High || val.toInt16() < args.Range.Low ) val.setInt16( args.Range.Low );
                break;
            case BuiltInType.Int32:
                if( val.toInt32() >= args.Range.High || val.toInt32() < args.Range.Low ) val.setInt32( args.Range.Low );
                break;
            case BuiltInType.Int64:
                if( val.toInt64() >= args.Range.High || val.toInt64() < args.Range.Low ) val.setInt64( args.Range.Low );
                if( val.toInt64() > Math.pow(2, 30) ) val.setInt64( 0 );
                else if( val.toInt64() < 0 ) val.setInt64( 0 );
                val.setInt64( parseInt( val.toInt64() ) );
                break;
            case BuiltInType.SByte:
                if( val.toSByte() >= args.Range.High || val.toSByte() < args.Range.Low ) val.setSByte( args.Range.Low );
                break;
            case BuiltInType.UInt16:
                if( val.toUInt16() >= args.Range.High || val.toUInt16() < args.Range.Low ) val.setUInt16( args.Range.Low );
                break;
            case BuiltInType.UInt32:
                if( val.toUInt32() >= args.Range.High || val.toUInt32() < args.Range.Low ) val.setUInt32( args.Range.Low );
                break;
            case BuiltInType.UInt64:
                if( val.toUInt64() >= args.Range.High || val.toUInt64() < args.Range.Low ) val.setUInt64( args.Range.Low );
                if( val.toUInt64() > Math.pow(2, 30) ) val.setUInt64( 0 );
                break;
        }
    }
    // now to increment
    // add Array Handling!
    // see maintree\Attribute Services\Attribute Write Index\Test Cases\005.js for correct array handling
    if ( val.ArrayType == 0 ) {
        switch ( val.DataType ) {
            case BuiltInType.Boolean: val.setBoolean( !val.toBoolean() ); break;
            case BuiltInType.Byte: val.setByte( val.toByte() + args.Increment ); break;
            case BuiltInType.ByteString: val.setByteString( UaByteString.Increment( val.toByteString() ) ); break;
            case BuiltInType.DateTime: {
                var maxValue = new UaVariant;
                maxValue.setDateTime( Constants.DateTime_Max() );
                var minValue = new UaVariant;
                minValue.setDateTime( Constants.DateTime_Min() );
                if ( val.equals(maxValue) || val.equals(minValue)) {
                    val.setDateTime( UaDateTime.Now() ); break;
                }
                var nextDay = val.toDateTime();
                nextDay.addDays( args.Increment );
                val.setDateTime( nextDay );
                break;
            }
            case Identifier.Decimal: addSkipped( "Increment for Decimals is currently not implemented." ); break;
            case BuiltInType.Double: {
                if ( Math.abs( val.toDouble() ) >= MAX_SAFE_INTEGER ) val.setDouble( 0 );
                else val.setDouble( val.toDouble() + args.Increment );
                break;
            }
            case BuiltInType.Duration: {
                if ( Math.abs( val.toDouble() ) >= MAX_SAFE_INTEGER ) val.setDouble( 0 );
                else val.setDouble( val.toDouble() + args.Increment );
                break;
            }
            case Identifier.Enumeration: {
                if ( isDefined( args.Item ) ) {
                    if ( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 ) {
                        val.setInt32( val.toInt32() + args.Increment );
                    }
                    else {
                        // print( "The item being incremented is an Int32 but we need to check whether this is an enumaration" );
                        // clone the item to read the DataType first
                        var itemDataType = args.Item.clone();
                        itemDataType.AttributeId = Attribute.DataType;
                        ReadHelper.Execute( { NodesToRead: itemDataType } );
                        var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                        if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                            //print( "The item being incremented is an BuiltInType.Enumeration." );
                            // let's get the values of the enumeration
                            var enumerationValues = null;

                            // Let's check if the Enumeration provides EnumValues or EnumStrings
                            if ( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                                UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                                UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                                OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                                new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                            } ) ) return ( false );

                            var uaEnumValues = null;
                            var actualEnumValues = [];
                            // we should have gotten 2 Results otherwise something went wrong
                            if ( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                    // Found the EnumStrings property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                    if ( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if ( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                                }
                                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                    // Found the EnumValues property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                    if ( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if ( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                                }

                                if ( val.toInt32() + args.Increment < uaEnumValues.length ) val.setInt32( val.toInt32() + args.Increment );
                                else val.setInt32( 0 );
                            }
                        }
                        else {
                            val.setInt32( val.toInt32() + args.Increment );
                            break;
                        }
                    }
                    break;
                }
                else {
                    val.setInt32( val.toInt32() + args.Increment );
                    break;
                }
            }
            case BuiltInType.Float: {
                if ( val.toFloat() === Constants.Float_Max ) val.setFloat( 0 );
                else val.setFloat( val.toFloat() + args.Increment );
                break;
            }
            case BuiltInType.Guid: {
                if ( __guidPos >= __guids.length ) __guidPos = 0;
                if ( val.toString().toUpperCase() == __guids[__guidPos] ) __guidPos++;
                val.setGuid( new UaGuid( __guids[__guidPos] ) );
                __guidPos++;
                break;
            }
            case Identifier.Image: val.DataType = BuiltInType.ByteString; UaVariant.Increment( val ); break;
            case Identifier.ImageBMP: val.DataType = BuiltInType.ByteString; UaVariant.Increment( val ); break;
            case Identifier.ImageGIF: val.DataType = BuiltInType.ByteString; UaVariant.Increment( val ); break;
            case Identifier.ImageJPG: val.DataType = BuiltInType.ByteString; UaVariant.Increment( val ); break;
            case Identifier.ImagePNG: val.DataType = BuiltInType.ByteString; UaVariant.Increment( val ); break;
            case Identifier.Integer: val.DataType = BuiltInType.Int32; UaVariant.Increment( val ); break;
            case BuiltInType.Int16: val.setInt16( val.toInt16() + args.Increment ); break;
            case BuiltInType.Int32: {
                if ( isDefined( args.Item ) ) {
                    if ( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 || args.Item.NodeSetting.indexOf( "Integer" ) !== -1 ) {
                        val.setInt32( val.toInt32() + args.Increment );
                    }
                    else {
                        // print( "The item being incremented is an Int32 but we need to check whether this is an enumaration" );
                        // clone the item to read the DataType first
                        var itemDataType = args.Item.clone();
                        itemDataType.AttributeId = Attribute.DataType;
                        ReadHelper.Execute( { NodesToRead: itemDataType } );
                        var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                        if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                            //print( "The item being incremented is an BuiltInType.Enumeration." );
                            // let's get the values of the enumeration
                            var enumerationValues = null;

                            // Let's check if the Enumeration provides EnumValues or EnumStrings
                            if ( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                                UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                                UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                                OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                                new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                            } ) ) return ( false );

                            var uaEnumValues = null;
                            var actualEnumValues = [];
                            // we should have gotten 2 Results otherwise something went wrong
                            if ( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                    // Found the EnumStrings property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                    if ( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if ( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                                    if ( val.toInt32() + args.Increment < uaEnumValues.length ) val.setInt32( val.toInt32() + args.Increment );
                                    else val.setInt32( 0 );
                                    break;
                                }
                                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                    // Found the EnumValues property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                    if ( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if ( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                                    for ( var b = 0; b < uaEnumValues.length; b++ ) {
                                        actualEnumValues.push( uaEnumValues[b].toEnumValueType().Value );
                                    }
                                    if ( actualEnumValues.indexOf( val.toInt32() ) > -1 && actualEnumValues.indexOf( val.toInt32() ) + args.Increment < actualEnumValues.length ) val.setInt32( actualEnumValues[actualEnumValues.indexOf( val.toInt32() ) + args.Increment] );
                                    else val.setInt32( actualEnumValues[0] );
                                }
                            }
                        }
                        else {
                            val.setInt32( val.toInt32() + args.Increment );
                            break;
                        }
                    }
                    break;
                }
                else {
                    val.setInt32( val.toInt32() + args.Increment );
                    break;
                }
            }
            case BuiltInType.Int64: {
                if ( Math.abs( val.toInt64() ) >= MAX_SAFE_INTEGER ) val.setInt64( 0 );
                else if ( val.toInt64() < 0 ) val.setInt64( 0 );
                else val.setInt64( val.toInt64() + args.Increment );
                break;
            }
            case BuiltInType.LocaleId: {
                var itemLocaleIdArray = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray, 0 ) )[0];
                if ( ReadHelper.Execute( { NodesToRead: itemLocaleIdArray } ) ) {
                    var supportedLocales = itemLocaleIdArray.Value.Value.toStringArray();
                    if ( !isDefined( supportedLocales ) && supportedLocales.length > 0 ) {
                        supportedLocales = CreateSupportedLocaleArray( supportedLocales, supportedLocales.length - 1 );
                        val.Value = CreateSupportedLocaleArray( supportedLocales, 0 )[0]; break;
                    }
                }
                break;
            }
            case BuiltInType.LocalizedText: {
                var tempValue = val.toLocalizedText();
                var stringAsBs = UaByteString.fromStringData( tempValue.Text.toString() );
                stringAsBs = UaByteString.Increment( stringAsBs );
                var bsAsString = stringAsBs.utf8ToString();
                tempValue.Text = bsAsString;
                val.setLocalizedText( tempValue );
                break;
            }
            case Identifier.NodeId: {
                var nodeIdAsString = val.toString();
                var lastCharacter = nodeIdAsString.charAt( nodeIdAsString.length - 1 );
                var tempUaString = UaVariant.New( { Value: lastCharacter, Type: BuiltInType.String } );
                lastCharacter = UaVariant.Increment( { Value: tempUaString } );
                if ( !/^[0-9]$/.test( lastCharacter ) ) lastCharacter.setString( 0 );
                val.setNodeId( new UaNodeId.fromString( nodeIdAsString.slice( 0, nodeIdAsString.length - 1 ) + lastCharacter ) );
                break;
            }
            case Identifier.Number: val.setInt32( val.toInt32() + args.Increment ); break;
            case BuiltInType.QualifiedName: {
                var tempValue = val.toQualifiedName();
                var stringAsBs = UaByteString.fromStringData( tempValue.Name.toString() );
                stringAsBs = UaByteString.Increment( stringAsBs );
                var bsAsString = stringAsBs.utf8ToString();
                tempValue.Name = bsAsString;
                val.setQualifiedName( tempValue );
                break;
            }
            case BuiltInType.SByte: val.setSByte( val.toSByte() + args.Increment ); break;
            case BuiltInType.StatusCode: val.setStatusCode( new UaStatusCode( Number( val.toStatusCode() ) + args.Increment ) ); break;
            case BuiltInType.String: {
                var stringAsBs = UaByteString.fromStringData( val.toString() );
                stringAsBs = UaByteString.Increment( stringAsBs );
                var bsAsString = stringAsBs.utf8ToString();
                val.setString( bsAsString );
                break;
            }
            case Identifier.Time: val.setDateTime( new UaDateTime( UtcTime.now() ) ); break;
            case Identifier.UInteger: val.DataType = BuiltInType.UInt32; UaVariant.Increment( val ); break;
            case BuiltInType.UInt16: val.setUInt16( val.toUInt16() + args.Increment ); break;
            case BuiltInType.UInt32: val.setUInt32( val.toUInt32() + args.Increment ); break;
            case BuiltInType.UInt64: {
                if ( val.toUInt64() >= MAX_SAFE_INTEGER ) val.setUInt64( 0 );
                else val.setUInt64( val.toUInt64() + args.Increment );
                break;
            }
            case BuiltInType.UtcTime: val.setDateTime( new UaDateTime( UtcTime.now() ) ); break;
            case BuiltInType.XmlElement: {
                var x = new UaXmlElement();
                x.setString( "<time>" + UaDateTime.utcNow() + "</time>" );
                val.setXmlElement( x );
                break;
            }
            case Identifier.Variant: val.DataType = BuiltInType.UInt16; val.SetValueMin( args ); break;
        }
        // change the passed-in argument in addition to returning the new value 
        if ( isDefined( args.Item ) ) {
            if ( isDefined( val.DataType ) ) args.Item.Value.Value = val;
            else setValue( args.Item, val, args.Item.Value.Value.DataType );
        }
        else if ( isDefined( args.Value.Value ) ) args.Value.Value = val;
        else args.Value = val;
    }
    else if ( val.ArrayType == 2 ) {
        var arrayWriteValues;
        var originalArray;
        switch ( val.DataType ) {
            case BuiltInType.Boolean:
                var a = new UaInt32s();
                var b = new UaBooleans();
                val.toBooleanMatrix( a, b );
                arrayWriteValues = new UaBooleans();
                for ( var w = 0; w < b.length; w++ ) arrayWriteValues[w] = !b[w];
                val.setBooleanMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.Byte:
                var a = new UaInt32s();
                var b = new UaBytes();
                val.toByteMatrix( a, b );
                arrayWriteValues = new UaBytes();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.Byte_Max ) arrayWriteValues[w] = Constants.Byte_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setByteMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.ByteString:
                var a = new UaInt32s();
                var b = new UaByteStrings();
                val.toByteStringMatrix( a, b );
                arrayWriteValues = new UaByteStrings();
                for ( var w = 0; w < b.length; w++ ) arrayWriteValues[w] = UaByteString.Increment( b[w] );
                val.setByteStringMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.DateTime:
                var maxValue = new UaVariant;
                maxValue.setDateTime( Constants.DateTime_Max() );
                var minValue = new UaVariant;
                minValue.setDateTime( Constants.DateTime_Min() );
                var a = new UaInt32s();
                var b = new UaDateTimes();
                val.toDateTimeMatrix( a, b );
                arrayWriteValues = new UaDateTimes();
                for ( var w = 0; w < b.length; w++ ) {
                    var newValue = new UaVariant();
                    newValue.setDateTime( b[w] );
                    if ( newValue.equals( maxValue ) || newValue.equals( minValue ) ) {
                        newValue = UaDateTime.Now();
                    }
                    else {
                        newValue = b[w];
                        newValue.addDays( args.Increment );
                    }
                    arrayWriteValues[w] = newValue;
                }
                val.setDateTimeMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.Double:
                var a = new UaInt32s();
                var b = new UaDoubles();
                val.toDoubleMatrix( a, b );
                arrayWriteValues = new UaDoubles();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( Math.abs( b[w] ) >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = Constants.Double_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setDoubleMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.Float:
                var a = new UaInt32s();
                var b = new UaFloats();
                val.toFloatMatrix( a, b );
                arrayWriteValues = new UaFloats();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.Float_Max ) arrayWriteValues[w] = Constants.Float_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setFloatMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.Guid:
                var a = new UaInt32s();
                var b = new UaGuids();
                val.toGuidMatrix( a, b );
                arrayWriteValues = new UaGuids();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( __guidPos >= __guids.length ) __guidPos = 0;
                    if ( b[w].toString().toUpperCase() == __guids[__guidPos] ) __guidPos++;
                    arrayWriteValues[w] = new UaGuid( __guids[__guidPos] );
                    __guidPos++;
                }
                val.setGuidMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.Int16:
                var a = new UaInt32s();
                var b = new UaInt16s();
                val.toInt16Matrix( a, b );
                arrayWriteValues = new UaInt16s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.Int16_Max ) arrayWriteValues[w] = Constants.Int16_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setInt16Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.Int32:
                var a = new UaInt32s();
                var b = new UaInt32s();
                val.toInt32Matrix( a, b );
                arrayWriteValues = new UaInt32s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.Int32_Max ) arrayWriteValues[w] = Constants.Int32_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setInt32Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.Int64:
                var a = new UaInt32s();
                var b = new UaInt64s();
                val.toInt64Matrix( a, b );
                arrayWriteValues = new UaInt64s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( Math.abs( b[w] ) >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = 0;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setInt64Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.LocalizedText:
                var a = new UaInt32s();
                var b = new UaLocalizedTexts();
                val.toLocalizedTextMatrix( a, b );
                arrayWriteValues = new UaLocalizedTexts();
                for ( var w = 0; w < b.length; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( b[w].Text.toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w].Text = bsAsString;
                    arrayWriteValues[w].Locale = b[w].Locale;
                }
                val.setLocalizedTextMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.QualifiedName:
                var a = new UaInt32s();
                var b = new UaQualifiedNames();
                val.toQualifiedNameMatrix( a, b );
                arrayWriteValues = new UaQualifiedNames();
                for ( var w = 0; w < b.length; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( b[w].Name.toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w].Name = bsAsString;
                }
                val.setQualifiedNameMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.String:
                var a = new UaInt32s();
                var b = new UaStrings();
                val.toStringMatrix( a, b );
                arrayWriteValues = new UaStrings();
                for ( var w = 0; w < b.length; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( b[w].toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w] = bsAsString;
                }
                val.setStringMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.SByte:
                var a = new UaInt32s();
                var b = new UaSBytes();
                val.toSByteMatrix( a, b );
                arrayWriteValues = new UaSBytes();
                for ( var w = 0; w < b.length; w++ ) {
                    arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setSByteMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.UInt16:
                var a = new UaInt32s();
                var b = new UaUInt16s();
                val.toUInt16Matrix( a, b );
                arrayWriteValues = new UaUInt16s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.UInt16_Max ) arrayWriteValues[w] = Constants.UInt16_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setUInt16Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.UInt32:
                var a = new UaInt32s();
                var b = new UaUInt32s();
                val.toUInt32Matrix( a, b );
                arrayWriteValues = new UaUInt32s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] === Constants.UInt32_Max ) arrayWriteValues[w] = Constants.UInt32_Min;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setUInt32Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.UInt64:
                var a = new UaInt32s();
                var b = new UaUInt64s();
                val.toUInt64Matrix( a, b );
                arrayWriteValues = new UaUInt64s();
                for ( var w = 0; w < b.length; w++ ) {
                    if ( b[w] >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = 0;
                    else arrayWriteValues[w] = b[w] + args.Increment;
                }
                val.setUInt64Matrix( a, arrayWriteValues );
                break;
            case BuiltInType.Variant:
                var a = new UaInt32s();
                var b = new UaVariants();
                val.toVariantMatrix( a, b );
                arrayWriteValues = new UaVariants();
                for ( var w = 0; w < b.length; w++ ) arrayWriteValues[w] = UaVariant.Increment( { Value: b[w] } );
                val.setVariantMatrix( a, arrayWriteValues );
                break;
            case BuiltInType.XmlElement:
                var a = new UaInt32s();
                var b = new UaXmlElements();
                val.toXmlElementMatrix( a, b );
                arrayWriteValues = new UaXmlElements();
                for ( var w = 0; w < b.length; w++ ) {
                    var x = new UaXmlElement();
                    x.setString( "<time>" + UaDateTime.utcNow() + "</time>" );
                    arrayWriteValues[w] = x;
                }
                val.setXmlElementMatrix( a, arrayWriteValues );
                break;
            default:
                break;
        }//switch
        // change the passed-in argument in addition to returning the new value 
        if ( isDefined( args.Item ) ) {
            if ( isDefined( val.DataType ) ) args.Item.Value.Value = val;
            else setValue( args.Item, val, args.Item.Value.Value.DataType );
        }
        else if ( isDefined( args.Value.Value ) ) args.Value.Value = val;
        else args.Value = val;

    }
    else {
        var arrayWriteValues;
        var arrayLength = val.getArraySize();
        var originalArray;
        switch ( val.DataType ) {
            case BuiltInType.Boolean:
                originalArray = val.toBooleanArray();
                arrayWriteValues = new UaBooleans();
                for ( var w = 0; w < arrayLength; w++ ) arrayWriteValues[w] = !originalArray[w];
                val.setBooleanArray( arrayWriteValues );
                break;
            case BuiltInType.Byte:
                originalArray = val.toByteArray();
                arrayWriteValues = new UaBytes();
                for ( var w = 0; w < arrayLength; w++ ) arrayWriteValues[w] = originalArray[w] + args.Increment;
                val.setByteArray( arrayWriteValues );
                break;
            case BuiltInType.ByteString:
                originalArray = val.toByteStringArray();
                arrayWriteValues = new UaByteStrings();
                for ( var w = 0; w < arrayLength; w++ ) arrayWriteValues[w] = UaByteString.Increment( originalArray[w] );
                val.setByteStringArray( arrayWriteValues );
                break;
            case BuiltInType.DateTime:
                var maxValue = new UaVariant;
                maxValue.setDateTime( Constants.DateTime_Max() );
                var minValue = new UaVariant;
                minValue.setDateTime( Constants.DateTime_Min() );
                originalArray = val.toDateTimeArray();
                arrayWriteValues = new UaDateTimes();
                for ( var w = 0; w < arrayLength; w++ ) {
                    var nextDay = new UaVariant();
                    nextDay.setDateTime( originalArray[w] );
                    if ( nextDay.equals( maxValue ) || nextDay.equals( minValue ) ) {
                        nextDay = UaDateTime.Now();
                    }
                    else {
                        nextDay = originalArray[w];
                        nextDay.addDays( args.Increment );
                    }
                    arrayWriteValues[w] = nextDay;
                }
                val.setDateTimeArray( arrayWriteValues );
                break;
            case BuiltInType.Double:
                originalArray = val.toDoubleArray();
                arrayWriteValues = new UaDoubles();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( Math.abs( originalArray[w] ) >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = Constants.Double_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setDoubleArray( arrayWriteValues );
                break;
            case BuiltInType.Float:
                originalArray = val.toFloatArray();
                arrayWriteValues = new UaFloats();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] === Constants.Float_Max ) arrayWriteValues[w] = Constants.Float_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setFloatArray( arrayWriteValues );
                break;
            case BuiltInType.Guid:
                originalArray = val.toGuidArray();
                arrayWriteValues = new UaGuids();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( __guidPos >= __guids.length ) __guidPos = 0;
                    if ( originalArray[w].toString().toUpperCase() == __guids[__guidPos] ) __guidPos++;
                    arrayWriteValues[w] = new UaGuid( __guids[__guidPos] );
                    __guidPos++;
                }
                val.setGuidArray( arrayWriteValues );
                break;
            case BuiltInType.Int16:
                originalArray = val.toInt16Array();
                arrayWriteValues = new UaInt16s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] === Constants.Int16_Max ) arrayWriteValues[w] = Constants.Int16_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setInt16Array( arrayWriteValues );
                break;
            case BuiltInType.Int32:
                originalArray = val.toInt32Array();
                arrayWriteValues = new UaInt32s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] === Constants.Int32_Max ) arrayWriteValues[w] = Constants.Int32_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setInt32Array( arrayWriteValues );
                break;
            case BuiltInType.Int64:
                originalArray = val.toInt64Array();
                arrayWriteValues = new UaInt64s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( Math.abs( originalArray[w] ) >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = 0;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setInt64Array( arrayWriteValues );
                break;
            case BuiltInType.LocalizedText:
                originalArray = val.toLocalizedTextArray();
                arrayWriteValues = new UaLocalizedTexts();
                for ( var w = 0; w < arrayLength; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( originalArray[w].Text.toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w].Text = bsAsString;
                    arrayWriteValues[w].Locale = originalArray[w].Locale;
                }
                val.setLocalizedTextArray( arrayWriteValues );
                break;
            case BuiltInType.QualifiedName:
                originalArray = val.toQualifiedNameArray();
                arrayWriteValues = new UaQualifiedNames();
                for ( var w = 0; w < arrayLength; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( originalArray[w].Name.toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w].Name = bsAsString;
                }
                val.setQualifiedNameArray( arrayWriteValues );
                break;
            case BuiltInType.String:
                originalArray = val.toStringArray();
                arrayWriteValues = new UaStrings();
                for ( var w = 0; w < arrayLength; w++ ) {
                    var stringAsBs = UaByteString.fromStringData( originalArray[w].toString() );
                    stringAsBs = UaByteString.Increment( stringAsBs );
                    var bsAsString = stringAsBs.utf8ToString();
                    arrayWriteValues[w] = bsAsString;
                }
                val.setStringArray( arrayWriteValues );
                break;
            case BuiltInType.SByte:
                originalArray = val.toSByteArray();
                arrayWriteValues = new UaSBytes();
                for ( var w = 0; w < arrayLength; w++ ) {
                    arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setSByteArray( arrayWriteValues );
                break;
            case BuiltInType.UInt16:
                originalArray = val.toUInt16Array();
                arrayWriteValues = new UaUInt16s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] === Constants.UInt16_Max ) arrayWriteValues[w] = Constants.UInt16_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setUInt16Array( arrayWriteValues );
                break;
            case BuiltInType.UInt32:
                originalArray = val.toUInt32Array();
                arrayWriteValues = new UaUInt32s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] === Constants.UInt32_Max ) arrayWriteValues[w] = Constants.UInt32_Min;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setUInt32Array( arrayWriteValues );
                break;
            case BuiltInType.UInt64:
                originalArray = val.toUInt64Array();
                arrayWriteValues = new UaUInt64s();
                for ( var w = 0; w < arrayLength; w++ ) {
                    if ( originalArray[w] >= MAX_SAFE_INTEGER ) arrayWriteValues[w] = 0;
                    else arrayWriteValues[w] = originalArray[w] + args.Increment;
                }
                val.setUInt64Array( arrayWriteValues );
                break;
            case BuiltInType.Variant:
                originalArray = val.toVariantArray();
                arrayWriteValues = new UaVariants();
                for ( var w = 0; w < arrayLength; w++ ) arrayWriteValues[w] = UaVariant.Increment( { Value: originalArray[w] } );
                val.setVariantArray( arrayWriteValues );
                break;
            case BuiltInType.XmlElement:
                originalArray = val.toXmlElementArray();
                arrayWriteValues = new UaXmlElements();
                for ( var w = 0; w < arrayLength; w++ ) {
                    var x = new UaXmlElement();
                    x.setString( "<time>" + UaDateTime.utcNow() + "</time>" );
                    arrayWriteValues[w] = x;
                }
                val.setXmlElementArray( arrayWriteValues );
                break;
            default:
                break;
        }//switch
        // change the passed-in argument in addition to returning the new value 
        if ( isDefined( args.Item ) ) {
            if ( isDefined( val.DataType ) ) args.Item.Value.Value = val;
            else setValue( args.Item, val, args.Item.Value.Value.DataType );
        }
        else if ( isDefined( args.Value.Value ) ) args.Value.Value = val;
        else args.Value = val;

    }
    return ( val.clone() );
}

UaVariant.SetValueMax = function( args ) {
    if( !isDefined( args ) ) throw( "UaVariant.SetValueMax::args not specified." );
    if( !isDefined( args.Item ) ) {
        if( !isDefined( args.Value ) ) throw( "UaVariant.SetValueMax::args.Value not specified." );
    }
    else {
        if( !isDefined( args.Value ) ) args.Value = args.Item.Value;
    }
    if(  isDefined( args.Value.Value ) ) args.Value = args.Value.Value; // if the Variant (contains VQT) then re-wire to be just V.
    if(  undefined === args.Value.setBoolean ) throw( "UaVariant.SetValueMax:args.Value is not a UaVariant type." );
    if(  isDefined( args.Type ) ) args.Value.DataType = args.Type;
    switch( args.Value.DataType ) {
        case BuiltInType.Boolean:     args.Value.setBoolean( true );                  break;
        case BuiltInType.Byte:        args.Value.setByte( Constants.Byte_Max );       break;
        case BuiltInType.ByteString:  addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." ); break;
        case BuiltInType.DateTime:    args.Value.setDateTime( Constants.DateTime_Max() );	break;
        case BuiltInType.Double:      args.Value.setDouble( Constants.Double_Max );   break;
        case Identifier.Duration:     args.Value.setDouble( Constants.Double_Max );   break;
        case BuiltInType.Float:       args.Value.setFloat( Constants.Float_Max );     break;
        case BuiltInType.Guid:        addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );               break;
        case BuiltInType.Int16:       args.Value.setInt16( Constants.Int16_Max );     break;
        case BuiltInType.Int32: {
            if ( isDefined( args.Item ) ) {
                if ( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 || args.Item.NodeSetting.indexOf( "Integer" ) !== -1 ) {
                    args.Value.setInt32( Constants.Int32_Max );
                    break;
                }
                else {
                    // clone the item to read the DataType first
                    var itemDataType = args.Item.clone();
                    itemDataType.AttributeId = Attribute.DataType;
                    ReadHelper.Execute( { NodesToRead: itemDataType } );
                    var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                    if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                        //print( "The item being incremented is an BuiltInType.Enumeration." );
                        // let's get the values of the enumeration
                        var enumerationValues = null;

                        // Let's check if the Enumeration provides EnumValues or EnumStrings
                        if( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                            UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                            UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                            OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                            new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                        } ) ) return ( false );

                        var uaEnumValues = null;
                        // we should have gotten 2 Results otherwise something went wrong
                        if( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                // Found the EnumStrings property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                                // when we do have a string enum the length is the highest possible value
                                args.Value.setInt32( uaEnumValues.length - 1 );
                            }
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                // Found the EnumValues property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                                var actualEnumValues = [];
                                for( var i = 0; i < uaEnumValues.length; i++ ) actualEnumValues[i] = uaEnumValues[i].toEnumValueType();
                                var maxEnumValue = 0;
                                for( var i = 0; i < actualEnumValues.length; i++ ) if( actualEnumValues[i] < maxEnumValue ) maxEnumValue = actualEnumValues[i];
                                args.Value.setInt32( maxEnumValue );
                            }
                        }
                    }
                    else {
                        args.Value.DataType = BuiltInType.Int32;
                        args.Value.setInt32( Constants.Int32_Max );
                    }
                }
            }
            else {
                args.Value.DataType = BuiltInType.Int32;
                args.Value.setInt32( Constants.Int32_Max );
                break;
            }
            break;
        }
        case BuiltInType.Int64:       args.Value.setInt64( 0x7FFFFFFFFFFFFFFF );      break;
        case BuiltInType.LocalizedText: addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );	break;
        case Identifier.NodeId:			addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );	break;
        case BuiltInType.QualifiedName: addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." ); break;
        case BuiltInType.SByte:       args.Value.setSByte( Constants.SByte_Max );     break;
        case BuiltInType.String:      addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );	break;
        case BuiltInType.UInt16:      args.Value.setUInt16( Constants.UInt16_Max );   break;
        case BuiltInType.UInt32:      args.Value.setUInt32( Constants.UInt32_Max );   break;
        case BuiltInType.UInt64:      args.Value.setUInt64( 0xFFFFFFFFFFFFFFFF );     break;
        case BuiltInType.XmlElement:  addLog( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );	break;
        default: addWarning( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MAX value." );
    }
}

UaVariant.SetValueMiddle = function( args ) {
    addError("SetValueMiddle is an obsolete function and should not be used. Please use UaVariant.Increment instead!");
	if( !isDefined( args ) ) throw( "UaVariant.SetValueMiddle::args not specified." );
    if( !isDefined( args.Item ) ) {
        if( !isDefined( args.Value ) ) throw( "UaVariant.Increment::args.Value not specified." );
    }
    else {
        if( !isDefined( args.Type ) && isDefined( args.Value ) ) args.Type = args.Value.Value.DataType;
        if( !isDefined( args.Value ) ) args.Value = args.Item.Value;
    }
    if(  isDefined( args.Type ) ) args.Value.Value.DataType = args.Type;
    if(  isDefined( args.Value.Value ) ) args.Value = args.Value.Value; // if the Variant (contains VQT) then re-wire to be just V.
    if( !isDefined( args.Offset ) ) args.Offset = new Date().getSeconds(); // use this to get current Second, use it to generate different values
    switch( args.Type ) {
        case BuiltInType.Boolean:  args.Value.setBoolean( !args.Value.toBoolean() ); break;
        case BuiltInType.Byte:     args.Value.setByte( ( Constants.Byte_Max / 2 ) + args.Offset );       break;
        case BuiltInType.ByteString: args.Value.setByteString( UaByteString.Increment( args.Value.toByteString() ) ); break;
        case BuiltInType.DateTime: args.Value.setDateTime( new UaDateTime( UtcTime.now() ) ); break;
        case BuiltInType.Double: args.Value.setDouble( ( Constants.Double_Max / 2 ) + args.Offset ); break;
		case Identifier.Duration:  args.Value.setDouble( Constants.Double_Max / 2 );   break;
        case BuiltInType.Float:    args.Value.setFloat( ( Constants.Float_Max / 2 ) + args.Offset );    break;
        case BuiltInType.Guid: {
            if( __guidPos >= __guids.length ) __guidPos = 0;
            if( args.Value.toString().toUpperCase() == __guids[__guidPos] ) __guidPos++;
            args.Value = new UaGuid( __guids[__guidPos] );
            __guidPos++;
            break;
        }
        case Identifier.Image: args.Value.DataType = BuiltInType.ByteString; UaVariant.SetValueMiddle( args.Value ); break;
        case Identifier.ImageBMP: args.Value.DataType = BuiltInType.ByteString; UaVariant.SetValueMiddle( args.Value ); break;
        case Identifier.ImageGIF: args.Value.DataType = BuiltInType.ByteString; UaVariant.SetValueMiddle( args.Value ); break;
        case Identifier.ImageJPG: args.Value.DataType = BuiltInType.ByteString; UaVariant.SetValueMiddle( args.Value ); break;
        case Identifier.ImagePNG: args.Value.DataType = BuiltInType.ByteString; UaVariant.SetValueMiddle( args.Value ); break;
		case Identifier.Integer:   args.Value.DataType = BuiltInType.Int16; args.Value.setInt16( ( Constants.Int16_Max / 2 ) + args.Offset ); break;
        case BuiltInType.Int16:    args.Value.setInt16( ( Constants.Int16_Max / 2 ) + args.Offset );    break;
        case BuiltInType.Int32: {
            if( isDefined( args.Item ) ) {
                if( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 || args.Item.NodeSetting.indexOf( "Integer" ) !== -1 ) {
                    args.Value.setInt32( ( Constants.Int32_Max / 2 ) + args.Offset );
                    break;
                }
                else {
                    // clone the item to read the DataType first
                    var itemDataType = args.Item.clone();
                    itemDataType.AttributeId = Attribute.DataType;
                    ReadHelper.Execute( { NodesToRead: itemDataType } );
                    var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                    if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                        //print( "The item being incremented is an BuiltInType.Enumeration." );
                        // let's get the values of the enumeration
                        var enumerationValues = null;

                        // Let's check if the Enumeration provides EnumValues or EnumStrings
                        if( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                            UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                            UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                            OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                            new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                        } ) ) return ( false );

                        var uaEnumValues = null;
                        // we should have gotten 2 Results otherwise something went wrong
                        if( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                // Found the EnumStrings property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                                // when we do have a string enum the length is the highest possible value
                                args.Value.setInt32( uaEnumValues.length / 2 );
                            }
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                // Found the EnumValues property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                                var actualEnumValues = [];
                                for( var i = 0; i < uaEnumValues.length; i++ ) actualEnumValues[i] = uaEnumValues[i].toEnumValueType();
                                var midEnumValue = 0;
                                for( var i = 0; i < actualEnumValues.length; i++ ) if( actualEnumValues[i] < midEnumValue ) {
                                    midEnumValue = actualEnumValues[i];
                                    break;
                                }
                                args.Value.setInt32( midEnumValue );
                            }
                        }
                    }
                    else {
                        args.Value.setInt32( ( Constants.Int32_Max / 2 ) + args.Offset );
                    }
                }
            }
            else {
                args.Value.setInt32( ( Constants.Int32_Max / 2 ) + args.Offset );
                break;
            }
        }
        break;
        case BuiltInType.Int64:    args.Value.setInt64( ( 0x7FFFFFFFFFFFFFFF / 2 ) + args.Offset );     break;
        case BuiltInType.LocaleId: {
            var itemLocaleIdArray = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray, 0 ) )[0];
            if( ReadHelper.Execute( { NodesToRead: itemLocaleIdArray } ) ) {
                var supportedLocales = itemLocaleIdArray.Value.Value.toStringArray();
                if( !isDefined( supportedLocales ) && supportedLocales.length > 0 ) {
                    args.Value.Value = CreateSupportedLocaleArray( supportedLocales, supportedLocales.length / 2 );
                }
            }
            break;
        }
		case BuiltInType.LocalizedText: {
            var lt = new UaLocalizedText();
            lt.Locale = "en-us";
            lt.Text = "Just any string";
            args.Value.setLocalizedText( lt );
            break;
        }
		case Identifier.NodeId:    args.Value.setNodeId(UaNodeId.fromString("i=10000")); break;
		case Identifier.Number:    args.Value.DataType = BuiltInType.Int16; args.Value.setInt32( ( Constants.Int32_Max / 2 ) + args.Offset ); break;
        case BuiltInType.QualifiedName:	args.Value.setQualifiedName( CreateQualifiedNameFromString( "0:MyBrowseName" ) );	break;
		case BuiltInType.String:   args.Value.setString( "UACTT" );	break;
		case BuiltInType.SByte:    args.Value.setSByte( ( Constants.SByte_Max / 2 ) + args.Offset );    break;
        case BuiltInType.UInt16:   args.Value.setUInt16( ( Constants.UInt16_Max / 2 ) + args.Offset );  break;
        case BuiltInType.UInt32:   args.Value.setUInt32( ( Constants.UInt32_Max / 2 ) + args.Offset );  break;
        case BuiltInType.UInt64:   args.Value.setUInt64( ( 0xFFFFFFFFFFFFFFF8 / 2 ) + args.Offset );    break;
        
        default: _warning.store( "Skipping data-type '" + BuiltInType.toString( args.Value.DataType ) + " generation of a MIDDLE value..." );
    }
}

UaVariant.SetValueMin = function( args ) {
    if( !isDefined( args ) ) throw( "UaVariant.SetValueMin::args not specified." );
    if( !isDefined( args.Item ) ) {
        if( !isDefined( args.Value ) ) throw( "UaVariant.SetValueMin::args.Value not specified." );
    }
    else {
        if( !isDefined( args.Value ) ) args.Value = args.Item.Value;
    }
    if(  isDefined( args.Value.Value ) ) args.Value = args.Value.Value; // if the Variant (contains VQT) then re-wire to be just V.
    var dataType = isDefined( args.Type ) ? args.Type : args.Value.DataType;
    switch( dataType ) {
        case BuiltInType.Boolean:       args.Value.setBoolean( false );                   break;
        case BuiltInType.Byte:          args.Value.setByte( Constants.Byte_Min );         break;
        case BuiltInType.ByteString:    args.Value.setByteString( new UaByteString() );   break;
        case BuiltInType.DateTime:      args.Value.setDateTime( new UaDateTime() );       break;
        case BuiltInType.Double:        args.Value.setDouble( Constants.Double_Min );     break;
        case Identifier.Duration:       args.Value.setDouble( Constants.Double_Min );     break;
        case BuiltInType.Float:         args.Value.setFloat( Constants.Float_Min );       break;
        case BuiltInType.Guid:          args.Value.setGuid( new UaGuid() );               break;
        case Identifier.Integer:        args.Value.DataType = BuiltInType.SByte; args.Value.SetValueMin(args); break;
        case BuiltInType.Int16:         args.Value.setInt16(Constants.Int16_Min);         break;
        case BuiltInType.Int32: 
            {
                if( isDefined( args.Item ) ) {
                    if( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 ) {
                        args.Value.setInt32( Constants.Int32_Min );
                        break;
                    }
                    else {
                        // clone the item to read the DataType first
                        var itemDataType = args.Item.clone();
                        itemDataType.AttributeId = Attribute.DataType;
                        ReadHelper.Execute( { NodesToRead: itemDataType } );
                        var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                        if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                            //print( "The item being incremented is an BuiltInType.Enumeration." );
                            // let's get the values of the enumeration
                            var enumerationValues = null;

                            // Let's check if the Enumeration provides EnumValues or EnumStrings
                            if( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                                UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                                UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                                OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                                new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                            } ) ) return ( false );

                            var uaEnumValues = null;
                            // we should have gotten 2 Results otherwise something went wrong
                            if( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                                if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                    // Found the EnumStrings property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                    if( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                                }
                                if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                    // Found the EnumValues property now lets get the list of values defined for this enum
                                    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                    if( !isDefined( enumerationValues ) ) {
                                        addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                        return ( false );
                                    }
                                    if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                    // now to convert the response into something we can actually use...
                                    uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                                }
                                // first element in an enumeration always needs to be 0
                                args.Value.setInt32( 0 );
                            }
                        }
                        else {
                            args.Value.setInt32( Constants.Int32_Min );
                        }
                    }
                }
                else {
                    args.Value.DataType = BuiltInType.Int32;
                    args.Value.setInt32( Constants.Int32_Min );
                    break;
                }
            }
            break;
        case BuiltInType.Int64:         args.Value.setInt64( 0x8000000000000000 );        break;
        case BuiltInType.LocaleId: {
            var itemLocaleIdArray = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray, 0 ) )[0];
            if( ReadHelper.Execute( { NodesToRead: itemLocaleIdArray } ) ) {
                var supportedLocales = itemLocaleIdArray.Value.Value.toStringArray();
                if( !isDefined( supportedLocales ) && supportedLocales.length > 0 ) {
                    args.Value.Value = CreateSupportedLocaleArray( supportedLocales, 0 );
                }
            }
            break;
        }
        case BuiltInType.LocalizedText: args.Value.setLocalizedText(new UaLocalizedText());                     break;
        case Identifier.NodeId:         args.Value.setNodeId(UaNodeId.fromString("i=0")); break;
        case Identifier.Number:         args.Value.DataType = BuiltInType.Byte; args.Value.SetValueMin(args);   break;
        case BuiltInType.QualifiedName: args.Value.setQualifiedName(new UaQualifiedName());                break;
        case BuiltInType.SByte:         args.Value.setSByte( Constants.SByte_Min );       break;
        case BuiltInType.String:        args.Value.setString( "" );                       break;
        case Identifier.Time:           args.Value.setDateTime(new UaDateTime());         break;
        case Identifier.UInteger:       args.Value.DataType = BuiltInType.Byte; args.Value.SetValueMin(args); break;
        case BuiltInType.UInt16:        args.Value.setUInt16( Constants.UInt16_Min );     break;
        case BuiltInType.UInt32:        args.Value.setUInt32( Constants.UInt32_Min );     break;
        case BuiltInType.UInt64:        args.Value.setUInt64( 0 );                        break;
        case BuiltInType.UtcTime:       args.Value.setDateTime( new UaDateTime() );       break;
        case BuiltInType.XmlElement:    args.Value.setXmlElement(new UaXmlElement());     break;
        case Identifier.Variant:        args.Value.DataType = BuiltInType.UInt16; args.Value.SetValueMin(args); break;
        case Identifier.Enumeration: {
            if( isDefined( args.Item ) ) {
                if( args.Item.NodeSetting.indexOf( "Int32" ) !== -1 ) {
                    args.Value.setInt32( Constants.Int32_Min );
                    break;
                }
                else {
                    // clone the item to read the DataType first
                    var itemDataType = args.Item.clone();
                    itemDataType.AttributeId = Attribute.DataType;
                    ReadHelper.Execute( { NodesToRead: itemDataType } );
                    var itemDataTypeNodeId = UaNodeId.fromString( itemDataType.Value.Value.toString() );
                    if ( IsSubTypeOfTypeHelper.Execute( { ItemNodeId: itemDataTypeNodeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } ) && IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                        //print( "The item being incremented is an BuiltInType.Enumeration." );
                        // let's get the values of the enumeration
                        var enumerationValues = null;

                        // Let's check if the Enumeration provides EnumValues or EnumStrings
                        if( !TranslateBrowsePathsToNodeIdsHelper.Execute( {
                            UaBrowsePaths: [UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumStrings"] } ),
                            UaBrowsePath.New( { StartingNode: itemDataTypeNodeId, RelativePathStrings: ["EnumValues"] } )],
                            OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ),
                            new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
                        } ) ) return ( false );

                        var uaEnumValues = null;
                        // we should have gotten 2 Results otherwise something went wrong
                        if( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                                // Found the EnumStrings property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumStrings' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toLocalizedTextArray();
                            }
                            if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length > 0 ) {
                                // Found the EnumValues property now lets get the list of values defined for this enum
                                enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
                                if( !isDefined( enumerationValues ) ) {
                                    addWarning( "'EnumValues' property is defined on Enum '" + itemDataTypeNodeId + "' but it doesn't have valid NodeId.." );
                                    return ( false );
                                }
                                if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return ( false );
                                // now to convert the response into something we can actually use...
                                uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
                            }
                            // first element in an enumeration always needs to be 0
                            args.Value.setInt32( 0 );
                        }
                    }
                    else {
                        args.Value.DataType = BuiltInType.Int32;
                        args.Value.setInt32( Constants.Int32_Min );
                    }
                }
            }
            else {
                args.Value.DataType = BuiltInType.Int32;
                args.Value.setInt32( Constants.Int32_Min );
                break;
            }
        }
        break;
        case Identifier.Image:          args.Value.DataType = BuiltInType.ByteString; args.Value.SetValueMin(args); break;
        case Identifier.ImageBMP:       args.Value.DataType = BuiltInType.ByteString; args.Value.SetValueMin(args); break;
        case Identifier.ImageGIF:       args.Value.DataType = BuiltInType.ByteString; args.Value.SetValueMin(args); break;
        case Identifier.ImageJPG:       args.Value.DataType = BuiltInType.ByteString; args.Value.SetValueMin(args); break;
        case Identifier.ImagePNG:       args.Value.DataType = BuiltInType.ByteString; args.Value.SetValueMin(args); break;
        case Identifier.Decimal:        args.Value.DataType = Identifier.Integer;     args.Value.SetValueMin(args); break;
        
        default: _warning.store("Skipping data-type '" + BuiltInType.toString(args.Value.DataType) + "' generation of a MIN value...");
    }
}

UaViewAttributes.New = function( args ) {
    var x = new UaViewAttributes();
    if( isDefined( args.ContainsNoLoops ) ) x.ContainsNoLoops = args.ContainsNoLoops;
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.EventNotifier ) ) x.EventNotifier = args.EventNotifier;
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.UserWriteMask ) ) x.UserWriteMask = args.UserWriteMask;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    if( isDefined( args.ToExtensionObject ) ) {
        var extObj = new UaExtensionObject();
        extObj.setViewAttributes( x );
        x = extObj;
    }
    return( x );
}

// Enumeration representing VQT capabilities
var UaVQTSupport = {
    None:            0,
    Value:           1,
    StatusCode:      2,
    ServerTimestamp: 4,
    SourceTimestamp: 8,
    toString: function( value ) {                                    // returns the string representation of the enumerated object
        var s = "";                                                  // string variable placeholder
        for( var v in this ) if( this[v] & value ) s += v + ",";     // iterate through each reflective property to find a match of the value
        return( s.substring( 0, s.length - 1 ) );                    // return the string, even if empty
    }
};