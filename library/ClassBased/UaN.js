/* Includes:
    NodeClass.fromString( string )    - returns the appropriate enum value based on the string specified
    UaNodeId.FromSettings( settings ) - returns an array of node ids of items that can be used
    UaNodeId.GuessType   ( setting  ) - return the data-type that reasonably matches the name of a setting
    UaNodeId.Validate()
    UaNodeTypeDescriptions.New()
*/

NodeClass.fromString = function( str ) {
    if( str == undefined || str == null ) return( NodeClass.Unspecified );
    for( var nodeclass in NodeClass ) {
        if( str == nodeclass ) return( NodeClass[nodeclass] );
    }
    return( NodeClass.Unspecified );
}

UaNodeId.FromSettings = function( settings ) {
    var nids = [];
    var items = MonitoredItem.fromSettings( settings );
    if( isDefined( items ) && items.length > 0 ) for( var i=0; i<items.length; i++ ) nids.push( items[i].NodeId );
    return( nids );
}

UaNodeId.GuessType = function( nodeSetting ) {
    // look for a data type string in the nodeSetting's parent/Value Data Type
    if( nodeSetting === undefined || nodeSetting === null ) return( BuiltInType.Null );
    var dataTypeString;
    var parentSetting = nodeSetting.match( /\/.*\/(.*\/)/ );
    if( parentSetting[1].search( /(^| )Set( |$)/ ) < 0 ) {
        // no such setting, so just use the setting name as the data type string
        dataTypeString = nodeSetting.match( /\/.*\/(.*?)(EURange|EngineeringUnits)?$/ )[1];
    }
    else dataTypeString = readSetting( parentSetting[0] + "Value Data Type" ).toString();
    switch( dataTypeString ) {
        case "Bool":        return BuiltInType.Boolean;
        case "Byte": return BuiltInType.Byte;
        case "SByte": return BuiltInType.SByte;
        case "Int16": return BuiltInType.Int16;
        case "UInt16": return BuiltInType.UInt16;
        case "Int32": return BuiltInType.Int32;
        case "UInt32": return BuiltInType.UInt32;
        case "Int64": return BuiltInType.Int64;
        case "UInt64": return BuiltInType.UInt64;
        case "Float": return BuiltInType.Float;
        case "Double": return BuiltInType.Double;
        case "String": return BuiltInType.String;
        case "DateTime": return BuiltInType.DateTime;
        case "Guid":        return BuiltInType.Guid;
        case "ByteString": return BuiltInType.ByteString;
        case "XmlElement":  return BuiltInType.XmlElement;
        case "NodeId": return Identifier.NodeId;
        case "ExpandedNodeId": return BuiltInType.ExpandedNodeId;
        case "StatusCode": return BuiltInType.StatusCode;
        case "QualifiedName": return BuiltInType.QualifiedName;
        case "LocalizedText": return BuiltInType.LocalizedText;
        case "Structure": return BuiltInType.Structure;
        case "Number": return Identifier.Number;
        case "Integer":     return Identifier.Integer;
        case "UInteger":    return Identifier.UInteger;
        case "Enumeration": return Identifier.Enumeration;
        case "Image": return Identifier.Image;
        case "Duration":    return Identifier.Duration;
        case "Time":        return Identifier.Time;
        case "UtcTime":     return Identifier.UtcTime;
        case "Variant": return BuiltInType.Variant; 
        case "ImageBMP": return Identifier.ImageBMP;
        case "ImageGIF": return Identifier.ImageGIF;
        case "ImageJPG": return Identifier.ImageJPG;
        case "ImagePNG": return Identifier.ImagePNG;
        default: break;
   }
   return "";
};

UaNodeId.Validate = function( args ) {
    if( args === undefined || args === null ) return( false );
    // identifier type
    if( args.IdentifierType === undefined || args.IdentierType === null ) return( false );
    if( !IdentifierType.Validate( args.IdentifierType ) ) return( false );
    // namespace index
    if( args.NamespaceIndex === undefined || args.NamespaceIndex === null ) return( false );
    if( !( !isNaN( parseFloat( args.NamespaceIndex ) ) && isFinite( args.NamespaceIndex ) ) ) return( false );
    // guid
    switch( args.IdentifierType ) {
        case IdentifierType.Numeric: break;
        case IdentifierType.String:
            var s = args.getIdentifierString();
            if( !Assert.GreaterThan( 0, s.length, "NodeId STRING length cannot be zero." ) ) return( false );
            if( !Assert.LessThan( 2048, s.length, "NodeId STRING length cannot exceed 2048" ) ) return( false );
            break;
        case IdentifierType.Guid: 
            var g = args.getIdentifierGuid();
            if( !isDefined( g ) ) {
                addError( "Unable to get GUID from NodeId" );
                return ( false );
            }
            break;
        case IdentifierType.Opaque: 
            var o = args.getIdentifierOpaque();
            if( !Assert.GreaterThan( 0, o.length, "NodeId OPAQUE length cannot be zero." ) ) return( false );
            if( !Assert.LessThan( 4096, o.length, "NodeId OPAQUE length cannot be greater than 4096" ) ) return( false );
            break;
    }
    return( true );
}

UaNodeId.IsEmpty = function ( nodeId ) {
    var isEmpty = true;

    if ( !isDefined( nodeId.IdentifierType ) || !isDefined( nodeId.NamespaceIndex )){
        throw( "UaNodeId.IsEmpty parameter is not a node id");
    }

    switch( nodeId.IdentifierType ) {

        case IdentifierType.Numeric:
            if ( nodeId.getIdentifierNumeric() > 0 ){
                isEmpty = false;
            }
            break;

        case IdentifierType.String:
            var string = nodeId.getIdentifierString();
            if ( isDefined( string ) && string.length > 0 ){
                isEmpty = false;
            }
            break;

        case IdentifierType.Guid: 
            if ( isDefined( nodeId.getIdentifierGuid() ) ){
                isEmpty = false;
            }
            break;

        case IdentifierType.Opaque: 
            if ( isDefined( nodeId.getIdentifierOpaque() ) ){
                isEmpty = false;
            }        
            break;
    }

    return isEmpty;
}

UaNodeTypeDescriptions.New = function( args ) {
    var t = new UaNodeTypeDescription();
    if( isDefined( args ) ) {
        if( isDefined( args.DataToReturn ) ) {
            if( !isDefined( args.DataToReturn.length ) ) args.DataToReturn = [ args.DataToReturn ];
            for( var d=0; d<args.DataToReturn.length; d++ ) t.DataToReturn[d] = args.DataToReturn[d];
        }
        if( isDefined( args.IncludeSubTypes ) ) t.IncludeSubTypes = args.IncludeSubTypes;
        if( isDefined( args.TypeDefinitionNode ) ) t.TypeDefinitionNode = args.TypeDefinitionNode;
    }
    return( t );
}