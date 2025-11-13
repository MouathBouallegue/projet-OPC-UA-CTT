/* Includes: 
    UaAttributeOperand.New = function( args )
    UaArgument.New()
    UaAddNodesItem.New()
    UaAddReferencesItem.New()
    UaAuditType (enum)
    UaNodeAttributes.New()
*/

UaAttributeOperand.New = function( args ) {
    var u = new UaAttributeOperand();
    if( isDefined( args ) ) {
        if( isDefined( args.Alias ) ) u.Alias = args.Alias;
        if( isDefined( args.AttributeId ) ) u.AttributeId = args.AttributeId;
        if( isDefined( args.BrowsePath ) )  u.BrowsePath  = args.BrowsePath;
        if( isDefined( args.IndexRange ) )  u.IndexRange  = args.IndexRange;
        if( isDefined( args.NodeId ) )      u.NodeId      = args.NodeId;
    }
    u.toExtensionObject = function() {
        var e = new UaExtensionObject();
        e.setAttributeOperand( this );
        return( e );
    };
    return( u );
}

UaArgument.New = function( args ) {
    var x = new UaArgument();
    if ( isDefined( args ) ) {
        if( isDefined( args.ArrayDimensions ) ) x.ArrayDimensions = args.ArrayDimensions;
        if( isDefined( args.DataType ) )  x.DataType = args.DataType;
        if( isDefined( args.Description ) ) x.Description = args.Description;
        if( isDefined( args.Name ) ) x.Name = args.Name;
        if( isDefined( args.ValueRank ) ) x.ValueRank = args.ValueRank;
    }
    return( x );
}

UaAddNodesItem.New = function( args ) {
    var x = new UaAddNodesItem();
    if( isDefined( args ) ) {
        if( isDefined( args.BrowseName ) ) {
            if( isDefined( args.BrowseName.Name ) ) x.BrowseName = args.BrowseName;
            else {
                x.BrowseName.NamespaceIndex = 2;
                x.BrowseName.Name = args.BrowseName;
            }
            if( isDefined( args.NodeAttributes ) ) {
                if( isDefined( args.NodeAttributes.DisplayName ) ) x.NodeAttributes.setNodeAttributes( args.NodeAttributes );
                else x.NodeAttributes = args.NodeAttributes;
            }
            if( isDefined( args.NodeClass ) ) x.NodeClass = args.NodeClass;
            if( isDefined( args.ParentNodeId ) ) {
                if( isDefined( args.ParentNodeId.NodeId ) ) x.ParentNodeId = args.ParentNodeId;
                else x.ParentNodeId.NodeId = args.ParentNodeId;
            }
            if( isDefined( args.ReferenceTypeId ) ) x.ReferenceTypeId = args.ReferenceTypeId;
            if( isDefined( args.RequestedNewNodeId ) ) {
                if( isDefined( args.RequestedNewNodeId.NodeId ) ) x.RequestedNewNodeId = args.RequestedNewNodeId;
                else x.RequestedNewNodeId.NodeId = args.RequestedNewNodeId;
            }
            if( isDefined( args.TypeDefinition ) ) {
                if( isDefined( args.TypeDefinition.NodeId ) ) x.TypeDefinition = args.TypeDefinition;
                else x.TypeDefinition.NodeId = args.TypeDefinition;
            }
        }
    }
    return( x );
}// UaAddNodesItem.New = function( args )

UaAddReferencesItem.New = function( args ) { 
    var o = new UaAddReferencesItem();
    if( isDefined( args ) ) { 
        if( isDefined( args.IsForward ) ) o.IsForward = args.IsForward;
        if( isDefined( args.ReferenceTypeId ) ) o.ReferenceTypeId = args.ReferenceTypeId;
        if( isDefined( args.SourceNodeId ) ) o.SourceNodeId = args.SourceNodeId;
        if( isDefined( args.TargetNodeClass ) ) o.TargetNodeClass = args.TargetNodeClass;
        if( isDefined( args.TargetNodeId ) ) o.TargetNodeId = args.TargetNodeId;
        if( isDefined( args.TargetServerUri ) ) o.TargetServerUri = args.TargetServerUri;
    }
    return( o );
}// UaAddReferencesItem.New = function( args )

UaNodeAttributes.New = function( args ) {
    var x = new UaNodeAttributes();
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    return( x );
}// UaNodeAttributes.New = function( args )

var UaAuditType = {
    None: 0,
    AuditOpenSecureChannelEventType: 1,
    AuditSessionEventType: 2,
    AuditActivateSessionEventType: 3,
    AuditCreateSessionEventType: 4,
    AuditCancelEventType: 5,
    AuditUrlMismatchEventType: 6,
    AuditUpdateMethodEventType: 7
}

// checks the event-fields searching for a clue of the event type
UaAuditType.GetEventType = function( eventFields ) {
    if( isDefined( eventFields ) && isDefined( eventFields.length ) ) {
        // search for the EventType field and use it
        for( var i=0; i<eventFields.length; i++ ) {
            if( eventFields[i].DataType == Identifier.NodeId && eventFields[i].toNodeId() == new UaNodeId( Identifier.AuditOpenSecureChannelEventType ) ) return( UaAuditType.AuditOpenSecureChannelEventType );
            if( eventFields[i].DataType == Identifier.NodeId && eventFields[i].toNodeId() == new UaNodeId( Identifier.AuditCreateSessionEventType ) ) return( UaAuditType.AuditCreateSessionEventType );
        }//for i...
        // if we didn't find the EventType field, then search for the SourceName
        for( var i=0; i<eventFields.length; i++ ) {
            if( eventFields[i].DataType == BuiltInType.String && eventFields[i].toString() == "SecureChannel/OpenSecureChannel" ) return( UaAuditType.AuditOpenSecureChannelEventType );
            if( eventFields[i].DataType == BuiltInType.String && eventFields[i].toString() == "Session/CreateSession" )   return( UaAuditType.AuditCreateSessionEventType );
            if( eventFields[i].DataType == BuiltInType.String && eventFields[i].toString() == "Session/ActivateSession" ) return( UaAuditType.AuditCreateSessionEventType );
            if( eventFields[i].DataType == BuiltInType.String && eventFields[i].toString() == "Session/CloseSession" )    return( UaAuditType.AuditCreateSessionEventType );
        }//for i...
    }
    else return UaAuditType.None;
}

UaAuditType.Print = function( event, attributes, indent ) {
    if( attributes == undefined || attributes == null || attributes.length == undefined || attributes.length == 0 ) return;
    if( event == undefined || event == null || event.EventFields == undefined || event.EventFields.length == undefined || event.EventFields.length == 0 ) return;
    if( !isDefined( indent ) ) indent = 0;
    if( attributes.length !== event.EventFields.length ) return;
    for( var i=0; i<attributes.length; i++ ) {
        var s = "";
        for( var x=0; x<indent; x++ ) s += "\t";
        s += attributes[i].BrowsePath[0].Name + ": " + event.EventFields[i];
        print( s );
    }// for i
}
