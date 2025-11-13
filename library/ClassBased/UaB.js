/* Includes: 
    BuiltInType.FromNodeId()        : converts a NodeId to its built-in-type enumeration
    UaBrowsePath.New()
    BuiltInType.FromNodeId()        : Converts a NodeId into its corresponding BuiltInType
    UaByteString.FromByteArray()    : Converts a Byte[] to a ByteString
    UaByteString.Increment()        : Increments the numeric value of a ByteString by one
    UaByteString.ToByteArray()      : Converts a ByteString to a Byte[]
*/

BuiltInType.FromNodeId = function( nodeid ) {
    var bt = BuiltInType.Null;
    if( nodeid != undefined && nodeid != null && nodeid != "" ) {
        for( var b in BuiltInType ) {
            if( BuiltInType[b] == nodeid.getIdentifierNumeric() ) {
                bt = BuiltInType[b];
                break;
            }
        }
    }
    return( bt );
}

BuiltInType.StringToNodeId = function (string) {
    switch (string) {
        case "BuiltInType.Null":
            return BuiltInType.Null;
            break;
        case "BuiltInType.Boolean":
            return BuiltInType.Boolean;
            break;
        case "BuiltInType.Byte":
            return BuiltInType.Byte;
            break;
        case "BuiltInType.ByteString":
            return BuiltInType.ByteString;
            break;
        case "BuiltInType.DateTime":
            return BuiltInType.DateTime;
            break;
        case "BuiltInType.Double":
            return BuiltInType.Double;
            break;
        case "BuiltInType.Float":
            return BuiltInType.Float;
            break;
        case "BuiltInType.Guid":
            return BuiltInType.Guid;
            break;
        case "BuiltInType.Int16":
            return BuiltInType.Int16;
            break;
        case "BuiltInType.Int32":
            return BuiltInType.Int32;
            break;
        case "BuiltInType.Int64":
            return BuiltInType.Int64;
            break;
        case "BuiltInType.LocalizedText":
            return BuiltInType.LocalizedText;
            break;
        case "BuiltInType.SByte":
            return BuiltInType.SByte;
            break;
        case "BuiltInType.String":
            return BuiltInType.String;
            break;
        case "BuiltInType.UInt16":
            return BuiltInType.UInt16;
            break;
        case "BuiltInType.UInt32":
            return BuiltInType.UInt32;
            break;
        case "BuiltInType.UInt64":
            return BuiltInType.UInt64;
            break;
        case "BuiltInType.XmlElement":
            return BuiltInType.XmlElement;
            break;
        case "BuiltInType.NodeId":
            return BuiltInType.NodeId;
            break;
        case "BuiltInType.StatusCode":
            return BuiltInType.StatusCode;
            break;
        default: {
            var nodeIdString = string.substring( string.lastIndexOf( "." ) + 1 ).trim();
            var integerIdentifier = "i="
            var indexOfNumber = nodeIdString.indexOf( integerIdentifier );
            if ( indexOfNumber >= 0 ) {
                var numberString = nodeIdString.substring( indexOfNumber + integerIdentifier.length );
                return parseInt( numberString );
            } else {
                return ( nodeIdString );
            }
            break;
        }
    }
}

UaBrowseDescription.New = function( args ) {
    var b = new UaBrowseDescription();
    if( isDefined( args ) ) {
        b.BrowseDirection = args.BrowseDirection != undefined && args.BrowseDirection != null ? args.BrowseDirection : BrowseDirection.Both;
        b.IncludeSubtypes = args.IncludeSubtypes != undefined && args.IncludeSubtypes != null ? args.IncludeSubtypes : true;
        b.NodeId          = args.NodeId          != undefined && args.NodeId          != null ? args.NodeId          : new UaNodeId();
        b.ReferenceTypeId = args.ReferenceTypeId != undefined && args.ReferenceTypeId != null ? args.ReferenceTypeId : new UaNodeId();
        b.ResultMask      = args.ResultMask      != undefined && args.ResultMask      != null ? args.ResultMask      : BrowseResultMask.All;
    }
    return( b );
}

/* returns a UaBrowsePath object
    Parameters:
        RelativePath [RelativePath]: 
        RelativePathStrings [string[]]: 
        StartingNode [NodeId]: 
        TargetName: */
UaBrowsePath.New = function( args ) {
    var uabp = new UaBrowsePath();
    // was it a NodeId or a MonitoredItemObject received?
    if( isDefined( args.StartingNode ) ) { 
        if( isDefined( args.StartingNode.NodeId ) )
            uabp.StartingNode = args.StartingNode.NodeId;
        else
            uabp.StartingNode = args.StartingNode;
    }
    // now to build the relative path(s)
    if( isDefined( args.RelativePath ) ) uabp.RelativePath = args.RelativePath;
    else if( isDefined( args.TargetName ) ) {
        var e = new UaRelativePathElement();
        e.TargetName = args.TargetName;
        uabp.RelativePath.Elements[0] = e;
    }
    else if( isDefined( args.RelativePathStrings ) ) {
        if( !isDefined( args.RelativePathStrings.length ) ) args.RelativePathStrings = [ args.RelativePathStrings ];
        for( var i=0; i<args.RelativePathStrings.length; i++ ) {
            var e = new UaRelativePathElement();
            e.IncludeSubtypes = true;
            e.IsInverse = false;
            e.TargetName.Name = args.RelativePathStrings[i];
            if( isDefined( args.ReferenceTypeId ) ) e.ReferenceTypeId = args.ReferenceTypeId;
            uabp.RelativePath.Elements[i] = e;
        }//for i
    }
    return( uabp );
}// this.GetUaBrowsePath = function( args )

/* returns a UaBrowsePaths collection based on an object definition and a specific starting node.
   this is to verify that an instance matches its definition.
   Parameters:
       StartingNode     [NodeId]   [Required]: the NodeId of the item instance
       ObjectDefinition [JSON]     [Required]: a json formatted document of an information model structure 
       CurrentPath      [String[]] [Optional]: array of strings representing the path from the root node (StartingNode)
       MaxCount
   Returns:
       null: nothing was generated due to argument errors 
       UaBrowsePaths: ctt object found in the "Objects" widget. */
UaBrowsePaths.FromJsonObjectDefinition = function( args ) {
    if( !isDefined( args ) )                     return( null );
    if( !isDefined( args.StartingNode ) )        return( null );
    if(  isDefined( args.StartingNode.NodeId ) ) args.StartingNode = args.StartingNode.NodeId;
    if( !isDefined( args.ObjectDefinition ) )    return( null );
    if( !isDefined( args.ObjectDefinition.length ) ) args.ObjectDefinition = [ args.ObjectDefinition ];
    if( !isDefined( args.Path ) ) args.Path = [];
    if( !isDefined( args.MaxCount ) ) args.MaxCount = 0;
    var uabps = new UaBrowsePaths();
    for( var d=0; d<args.ObjectDefinition.length; d++ ) {
        if( args.MaxCount++ > 100 ) return( null );
        // references
        if( !isDefined( args.ObjectDefinition[d].References ) ) continue;
        for( var r=0; r<args.ObjectDefinition[d].References.length; r++ ) {
            // find a Variable
            if( args.ObjectDefinition[d].References[r].NodeClass == "NodeClass.Variable" ) {
                var uabp = UaBrowsePath.New( { StartingNode: args.StartingNode,
                                               RelativePathStrings: [ args.ObjectDefinition[d].References[r].BrowseName ] } );
                uabps[ uabps.length ] = uabp;
                if( isDefined( args.ObjectDefinition[d].References[r].References ) ) {
                    args.Path.push( args.ObjectDefinition[d].References[r].BrowseName );
                    var innerUabps = UaBrowsePaths.FromJsonObjectDefinition( {
                        StartingNode:     UaNodeId.fromString( args.ObjectDefinition[d].References[r].NodeId ),
                        ObjectDefinition: args.ObjectDefinition[d].References,
                        Path:             args.Path,
                        MaxCount:         ( 1 + args.MaxCount ) } );
                    // now to add the nested browse paths
                    if( innerUabps !== null ) for( var innerLoop=0; innerLoop<innerUabps.length; innerLoop++ ) uabps[ uabps.length ] = innerUabps[ innerLoop ].clone();
                    args.Path.pop();
                }
            }
        }
    }//definitions > 0
    return( uabps );
}


// Searches an array of UaBrowseResult objects for anything that matches
// the search criteria.
// Parameters:
//    - BrowseName [string]: 
//    - Results [UaBrowseResults]: 
UaBrowseResults.Find = function( args ) {
    var matches = [];
    if( isDefined( args ) && isDefined( args.Results ) && isDefined( args.Results.length ) ) {
        for( var i=0; i<args.Results.length; i++ ) {
            for( var r=0; r<args.Results[i].References.length; r++ ) {
                var isMatch = false;
                if( isDefined( args.BrowseName ) && args.Results[i].References[r].BrowseName.Name == args.BrowseName ) isMatch = true;
                if( isMatch ) matches.push( args.Results[i].References[r].clone() );
            }//for r..
        }//for i..
    }
    return( matches );
}

BuiltInType.FromNodeId = function( nodeid ) {
    if( nodeid !== undefined && nodeid !== null ) {
        for( var b in BuiltInType ) {
            if( nodeid.equals( new UaNodeId( BuiltInType[b] ) ) ) return( BuiltInType[b] );
        }
    }
    return( new UaNodeId() );
}

UaByteString.FromByteArray = function( bytes ) {
    if( bytes === undefined || bytes === null ) return( new UaByteString() );
    
    var str = "0x";
    var x = 0;
    for (i = 0; i < bytes.length; i++ ) {
        x = bytes[i];
        if( x < 16 ) str += "0";      
        str += x.toString(16)
    }
    var y = UaByteString.fromHexString( str );
    return( y );
}//ByteString.FromByteArray = function( bytes )

UaByteString.Increment = function( bs ) {
    if (bs.length > 0) {
        var hex_string = bs.toHexString();
        AsciiNumber = Number(parseInt(hex_string.substring(2, 4), 16) + 1);
        if (AsciiNumber > 126) AsciiNumber = 33;
        var hex_AsciiNumber = AsciiNumber.toString( 16 );
        if( hex_AsciiNumber.length < 2 ) hex_AsciiNumber = "0" + hex_AsciiNumber;
        return UaByteString.fromHexString("0x" + hex_AsciiNumber + hex_string.substring(4));
    }
    else b = UaByteString.fromStringData("0");
    return (b);
}

UaByteString.ToByteArray = function( bytestring ) {
    if( bytestring === undefined || bytestring === null ) return( [] );
    var by = [];
    for( var i=0; i<bytestring.length; i++ ) by[i] = parseInt( bytestring.getRange( i, i ).toHexString() );
    return( by );
}//ByteString.ToByteArray = function( bytestring )