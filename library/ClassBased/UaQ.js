/* Includes: 
    UaQualifiedName.IsEmpty()
    UaQualifiedName.New()
    UaQueryDataDescription.New()
*/

UaQualifiedName.IsEmpty = function( thisQN ) {
    if( thisQN.Name.length > 0 ) return( false );
    if( thisQN.NamespaceIndex > 0 ) return( false );
    return( true );
}


UaQualifiedName.New = function( args ) { 
    var q = new UaQualifiedName();
    if( isDefined( args ) ){
        if( isDefined( args.NamespaceIndex ) ) q.NamespaceIndex = args.NamespaceIndex;
        if( isDefined( args.Name ) ) q.Name = args.Name;
    }
    q.IsEmpty = UaQualifiedName.IsEmpty;
    return( q );
}

UaQualifiedName.toJson = function( args ) {
    var s = "";
    if( isDefined( args ) ) {
        if( args.Name == undefined || args.Name == null ) args.Name = "";
        if( args.NamespaceIndex == undefined || args.NamespaceIndex == null ) args.NamespaceIndex = 0;
        s = "{ Name: " + args.Name + ", NamespaceIndex: " + args.NamespaceIndex + " }";
    }
    return( s );
}

UaQueryDataDescription.New = function( args ) {
    var t = new UaQueryDataDescription();
    if( isDefined( AttributeId ) ) t.AttributeId = args.AttributeId;
    if( isDefined( IndexRange ) ) t.IndexRange = args.IndexRange;
    if( isDefined( RelativePath ) ) t.RelativePath = args.RelativePath;
    if( isDefined( RelativePathStrings ) ) 
    return( t );
}
