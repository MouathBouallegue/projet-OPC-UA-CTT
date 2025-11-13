/* Includes: 
    Identifier.toString()
    IdentifierType.Validate()
    isDefined(obj)
*/

Identifier.toString = function( id ) {
    if( id == undefined || id == null ) return( "" );
    if( typeof id == "string" ) id = UaNodeId.fromString( id );
    if( id.IdentifierType == undefined || id.NamespaceIndex == undefined ) return( "" );
    var searchId = id.getIdentifierNumeric();
    for( var i in Identifier ) {
        if( Identifier[i] == searchId ) return( i );
    }
    return( "" );
}


IdentifierType.Validate = function( args ) { 
    return( args === IdentifierType.Guid || args === IdentifierType.Numeric || args === IdentifierType.Opaque || args === IdentifierType.String );
}

// function that is useful for ALL scripts
function isDefined( obj ) {
    var result = true;
    if( obj === undefined || obj === null ) {
        result = false;
    }
    else if( obj.length !== undefined && obj.length > 0 && typeof ( obj ) !== "string" && typeof ( obj ) !== "function" && !isDefined( obj.append ) ) {
        for( var o=0; o<obj.length; o++ ) {
            if( !isDefined( obj[o] ) ) { 
                result = false;
                break;
            }
        }//for o
    }
    return( result);
}// function isDefined( obj )