function GetMethodParent( methodNodeId ) {
    // array of types that COULD be used to reference a method
    var referenceTypes = [ new UaNodeId( Identifier.HasComponent ),
                           new UaNodeId( Identifier.HasOrderedComponent ),
                           new UaNodeId( Identifier.Organizes ) ];
    var parentObject = null;
    methodNodeId.BrowseDirection = BrowseDirection.Inverse;
    if( BrowseHelper.Execute( { NodesToBrowse: methodNodeId, SuppressMessaging: true } ) ) {   // browse our method node for inverse references
        for( var t=0; t<referenceTypes.length; t++ ) {                                         // iterate thru each of our acceptable reference types
            for( var i=0; i<BrowseHelper.Response.Results.length; i++ ) {                          // iterate thru all browse results
                if( BrowseHelper.Response.Results[i].StatusCode.isGood() ) {                       // we care for good results only
                    for( var r=0; r<BrowseHelper.Response.Results[i].References.length; r++ ) {    // iterate thru all returned references for *this* result
                        if( BrowseHelper.Response.Results[i].References[r].ReferenceTypeId.equals( referenceTypes[t] ) ) { // HasComponent?
                           parentObject = MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[i].References[r].NodeId.NodeId )[0]; // capture the parent object
                            break;                                                                       // exit this inner loop; outer loop exited next.
                        }    
                    }// for r...
                }// is good
                if( parentObject !== null ) break;                                                       // escape the loop if the object is defined
            }//for i...
        }//for r...
    }// browse
    return( parentObject );
}

/**
 * Function to create a new UaGenericStructureArray object of an array of UaGenericStructureValues
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaStructureDefinition} args.StructureDefinition - (Required) The StructureDefinition to use
 * @param {UaGenericStructureValue[]} args.GenericStructureValues - (Optional) Array of the GenericStructureValues to set.
 *
 * @returns {UaGenericStructureArray} Returns the created UaGenericStructureArray.
 */
UaGenericStructureArray.New = function( args ) {
    if( !isDefined( args ) ) throw( "UaGenericStructureArray.New(): No args defined" );
    if( !isDefined( args.StructureDefinition ) ) throw( "UaGenericStructureArray.New(): args.StructureDefinition not defined" );
    if( !isDefined( args.GenericStructureValues ) ) args.GenericStructureValues = [];
    if( !isDefined( args.GenericStructureValues.length ) ) args.GenericStructureValues = [ args.GenericStructureValues ];
    if( !isDefined( args.StructureDefinition.childrenCount ) ) throw( "UaGenericStructureArray.New(): Defined StructureDefinition does not appear to be of type UaStructureDefinition" );
    var ExtObjArray = new UaExtensionObjects( args.GenericStructureValues.length );
    for( var i=0; i<args.GenericStructureValues.length; i++ ) ExtObjArray[i] = args.GenericStructureValues[i].toExtensionObject();
    var VariantArray = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ExtObjArray, Array: true } );
    return new UaGenericStructureArray( VariantArray, args.StructureDefinition );
}

/**
 * Function to get a UaGenericStructureValue object from an UaGenericStructureArray
 * 
 * @param {UaGenericStructureArray} array - UaGenericStructureArray to get the element from
 * @param {Number} index - Index of the UaGenericStructureValue to get from the array
 *
 * @returns {UaGenericStructureValue} Returns the UaGenericStructureValue at the specified index.
 */
UaGenericStructureArray.Get = function( array, index ) {
    var variant = array.toVariant();
    if( !variant.isEmpty() ) {
        var extensionObjectArray = variant.toExtensionObjectArray();
        if( extensionObjectArray.length >= index ) {
            var definition = array.getDefinition();
            if( isDefined( definition ) ) {
                return new UaGenericStructureValue( extensionObjectArray[index], definition );
            }
        }
    }
    return new UaGenericStructureValue();
}

/**
 * Function to map the values of an OPC structure type into an equivalent generic structure type.
 * The given args.StructureDefinition and args.OpcStructureValue must have
 * the exact same structure and field names for this function to work properly
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaStructureDefinition} args.StructureDefinition - The StructureDefinition to use
 * @param {QObjectPrototypeObject} args.OpcStructureValue - The OPC structure object containing the values to be mapped into the resulting UaGenericStructureValue
 * @param {boolean} args.Array - (Optional) Indicates the value is an Array (UaGenericStructureArray will be returned if TRUE)(default=FALSE)
 *
 * @returns {UaGenericStructureValue|UaGenericStructureArray} Returns the generated UaGenericStructureValue or UaGenericStructureArray if args.Array is TRUE.
                                                              If the function fails, a value of null will be returned
 */
UaGenericStructureValue.FromOpcStructureType = function( args ) {
    if( !isDefined( args ) ) throw( "UaGenericStructureValue.FromOpcStructureType(): No args defined" );
    if( !isDefined( args.StructureDefinition ) ) throw( "UaGenericStructureValue.FromOpcStructureType(): args.StructureDefinition not defined" );
    if( !isDefined( args.OpcStructureValue ) ) throw( "UaGenericStructureValue.FromOpcStructureType(): args.OpcStructureValue not defined" );
    if( !isDefined( args.Array ) ) args.Array = false;
    
    var result = null;
    
    this._fromOpcStructureType = function( structDef, value ) {
        var fields = [];
        for( var i=0; i<structDef.childrenCount(); i++ ) {
            var fieldName = structDef.child(i).name();
            var fieldType = structDef.child(i).valueType();
            var fieldIsArray = structDef.child(i).arrayType();
            var fieldAllowSubtypes = structDef.child(i).allowSubtypes();
            var fieldValue = value[fieldName];
            if( !isDefined( fieldValue ) ) {
                addError( "UaGenericStructureValue.FromOpcStructureType(): Cannot find member '" + structDef.child(i).name() + "' in value '" + value.toString() + "'. The value and the provided StructureDefinition might not be compatible." );
                return null;
            }
            if( fieldType == 22 && !fieldAllowSubtypes ) { // Field is non-abstract structure
                if( fieldIsArray ) {
                    var genericStructureValues = [];
                    for( var g=0; g<fieldValue.length; g++ ) {
                        var subGenericValueElement = this._fromOpcStructureType( structDef.child(i).structureDefinition(), fieldValue[g] );
                        if( subGenericValueElement === null ) return null;
                        genericStructureValues.push( subGenericValueElement );
                    }
                    fields.push( UaGenericStructureArray.New( {
                        StructureDefinition: structDef.child(i).structureDefinition(),
                        GenericStructureValues: genericStructureValues
                    } ) );
                }
                else {
                    var subGenericValue = this._fromOpcStructureType( structDef.child(i).structureDefinition(), fieldValue );
                    if( subGenericValue === null ) return null;
                    fields.push( subGenericValue );
                }
            }
            else if( fieldType == 24 ) { // Field is Variant
                fields.push( fieldValue );
            }
            else { // Field is of other BuiltInType or abstract structure
                fields.push( UaVariant.New( { Type: fieldType, Value: fieldValue, Array: fieldIsArray } ) );
            }
        }
        
        return UaGenericStructureValue.New( {
            StructureDefinition: structDef,
            Fields: fields
        } );
    }
    
    if( args.Array ) {
        var arrayValues = [];
        for( var a=0; a<args.OpcStructureValue.length; a++ ) {
            var arrayElement = this._fromOpcStructureType( args.StructureDefinition, args.OpcStructureValue[a] );
            if( arrayElement === null ) return result;
            arrayValues.push( arrayElement );
        }
        result = UaGenericStructureArray.New( {
            StructureDefinition: args.StructureDefinition,
            GenericStructureValues: arrayValues
        } );
    }
    else result = this._fromOpcStructureType( args.StructureDefinition, args.OpcStructureValue );
    
    return result;
}

/**
 * Function to create a new UaGenericStructureValue/UaGenericUnionValue given a StructureDefinition and Field values to set
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaStructureDefinition} args.StructureDefinition - (Required) The StructureDefinition to use
 * @param {object[]} args.Fields - (Optional) Array of Fields to set. The values must be of type UaVariant, UaGenericStructureValue, UaGenericUnionValue or UaGenericStructureArray. Values to be skipped can be null.
 * @param {boolean} args.IsUnion - (Optional) Indicates the value is a Union (the last set index will be used as switch value, unused fields shall be null) (default=FALSE)
 *
 * @returns {UaGenericStructureValue|UaGenericUnionValue} Returns the created UaGenericStructureValue or UaGenericUnionValue if IsUnion is set to TRUE.
 */
UaGenericStructureValue.New = function( args ) {
    if( !isDefined( args ) ) throw( "UaGenericStructureValue.New(): No args defined" );
    if( !isDefined( args.StructureDefinition ) ) throw( "UaGenericStructureValue.New(): args.StructureDefinition not defined" );
    if( args.Fields == null || args.Fields == undefined ) args.Fields = [];
    if( !isDefined( args.Fields.length ) ) args.Fields = [ args.Fields ];
    if( !isDefined( args.StructureDefinition.childrenCount ) ) throw( "UaGenericStructureValue.New(): Defined StructureDefinition does not appear to be of type UaStructureDefinition" );
    if( !isDefined( args.IsUnion ) ) args.IsUnion = false;
    if( !args.IsUnion ) {
        // as UaGenericStructureValue
        var result = new UaGenericStructureValue( args.StructureDefinition );
        for( var i=0; i<args.Fields.length; i++ ) {
            if( isDefined( args.Fields[i] ) ) {
                if( isDefined( args.Fields[i].isEmpty ) || isDefined( args.Fields[i].setField ) || isDefined( args.Fields[i].setValue ) || isDefined( args.Fields[i].setGenericValueArray ) ) {
                    var statusCode = result.setField( i, args.Fields[i] );
                    if( !statusCode.isGood() ) addError( "UaGenericStructureValue.New(): Setting Field defined at Fields[" + i + "] returned bad StatusCode: " + statusCode );
                }
                else addError( "UaGenericStructureValue.New(): Field defined at Fields[" + i + "] must be of one of the following types: UaVariant | UaGenericStructureValue | UaGenericUnionValue | UaGenericStructureArray." );
            }
        }
    }
    else {
        // as UaGenericUnionValue
        var result = new UaGenericUnionValue( args.StructureDefinition );
        if( isDefined( args.UnionFieldToSet ) ) {
            if( isDefined( args.UnionFieldToSet.Name ) ) {
                if( isDefined( args.UnionFieldToSet.Value ) ) {
                    if( isDefined( args.UnionFieldToSet.Value.isEmpty ) || isDefined( args.UnionFieldToSet.Value.setField ) || isDefined( args.UnionFieldToSet.Value.setValue ) || isDefined( args.UnionFieldToSet.Value.setGenericValueArray ) ) {
                        var statusCode = result.setValue( args.UnionFieldToSet.Name, args.UnionFieldToSet.Value );
                        if( !statusCode.isGood() ) addError( "UaGenericStructureValue.New(): Setting Field '" + args.UnionFieldToSet.Name + "' returned bad StatusCode: " + statusCode );
                    }
                    else addError( "UaGenericStructureValue.New(): Field defined at Fields[" + i + "] must be of one of the following types: UaVariant | UaGenericStructureValue | UaGenericUnionValue | UaGenericStructureArray." );
                }
                else addLog( "UaGenericStructureValue.New(): UnionFieldToSet.Value is not defined. Nothing will be set." );
            }
            else addLog( "UaGenericStructureValue.New(): UnionFieldToSet.Name is not defined. Nothing will be set." );
        }
        else addLog( "UaGenericStructureValue.New(): IsUnion is set to TRUE, but argument UnionFieldToSet is not defined. Nothing will be set." );
    }
    return result;
}

UaGenericStructureValue.Print = function( value, lineBreaks, indent ) {
    var result = "";
    if( !isDefined( lineBreaks ) ) var lineBreaks = false;
    var lineBreak = lineBreaks ? "\n" : "";
    if( !isDefined( indent ) ) var indent = "";
    if( !lineBreaks ) indent = " ";
    var seperator = ",";
    if( value.definition().isUnion() ) {
        if( value.field().structureDefinition().childrenCount() > 0 ) {
            if( value.field().structureDefinition().isUnion() ) {
                result += indent + value.field().name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericUnion(), lineBreaks, indent + "    " ) + lineBreak + indent + " }";
            }
            else {
                if( value.field().arrayType() == 1 ) {
                    result += indent + value.field().name() + ": [ " + ( ( value.genericStructureArray().length() > 0 ) ? lineBreak : "" );
                    for( var a=0; a<value.genericStructureArray().length(); a++ ) {
                        seperator = ( a < value.genericStructureArray().length() - 1 ) ? ", " : "";
                        result += ( lineBreaks ? ( indent + "    " ) : "") + "[" + a + "]: {" + UaGenericStructureValue.Print( UaGenericStructureArray.Get( value.genericStructureArray(), a ), false, indent + "    " ) + " }" + lineBreak;
                    }
                    result += indent + "]";
                }
                else {
                    result += indent + value.field().name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericStructure(), lineBreaks, indent + "    " ) + lineBreak + indent +  "}";
                }
            }
        }
        else {
            result += indent + value.field().name() + ": " + value.value() + seperator;
        }
    }
    else {
        for( var i=0; i<value.definition().childrenCount(); i++ ) {
            var lastElement = ( i == value.definition().childrenCount() - 1 ) ? true : false;
            seperator = ( i < value.definition().childrenCount() - 1 ) ? "," : "";
            if( value.definition().child(i).structureDefinition().childrenCount() > 0 ) {
                if( value.definition().child(i).structureDefinition().isUnion() ) {
                    result += indent + value.definition().child(i).name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericUnion(i), lineBreaks, indent + "    " ) + lineBreak + " }" + seperator + ( lastElement ? "" : lineBreak );
                }
                else {
                    if( value.definition().child(i).arrayType() == 1 ) {
                        result += indent + value.definition().child(i).name() + ": [ " + ( ( value.genericStructureArray(i).length() > 0 ) ? lineBreak : "" );
                        for( var a=0; a<value.genericStructureArray(i).length(); a++ ) {
                            seperator = ( a < value.genericStructureArray(i).length() - 1 ) ? ", " : "";
                            result += ( lineBreaks ? ( indent + "    " ) : "") + "[" + a + "]: {" + UaGenericStructureValue.Print( UaGenericStructureArray.Get( value.genericStructureArray(i), a ), false, indent + "    " ) + " }" + seperator + lineBreak;
                        }
                        seperator = ( i < value.definition().childrenCount() - 1 ) ? ( "," + lineBreak ) : "";
                        result += indent + "]" + seperator;
                    }
                    else {
                        result += indent + value.definition().child(i).name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericStructure(i), lineBreaks, indent + "    " ) + lineBreak + indent +  "}" + seperator + ( lastElement ? "" : lineBreak );
                    }
                }
            }
            else {
                result += indent + value.definition().child(i).name() + ": " + value.value(i) + seperator + ( lastElement ? "" : lineBreak );
            }
        }
    }
    return result;
}

/**
 * Function to generate a pseudo-random GUID
 * 
 * @returns {UaGuid} Returns a pseudo-random UaGuid
 */
UaGuid.Random = function() {
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