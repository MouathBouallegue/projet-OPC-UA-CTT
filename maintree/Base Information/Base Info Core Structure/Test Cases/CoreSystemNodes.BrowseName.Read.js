/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Read the browseName of the core system nodes */

Test.Execute( { Debug: true, Procedure: function test() {
    // root nodes
    var _objects = new UaNodeId( Identifier.ObjectsFolder );
    var _types   = new UaNodeId( Identifier.TypesFolder );
    var _views   = new UaNodeId( Identifier.ViewsFolder );
    // types sub-folders
    var _objectTypes    = new UaNodeId( Identifier.ObjectTypesFolder );
    var _referenceTypes = new UaNodeId( Identifier.ReferenceTypesFolder );
    var _dataTypes      = new UaNodeId( Identifier.DataTypesFolder );
    var _eventTypes     = new UaNodeId( Identifier.EventTypesFolder );

    // read the browse name of all, they must exist
    var items = MonitoredItem.fromNodeIds( [ _objects, _types, _views, _objectTypes, _referenceTypes, _dataTypes, _eventTypes ] );
    for( var i=0; i<items.length; i++ ) items[i].AttributeId = Attribute.BrowseName;
    ReadHelper.Execute( { NodesToRead: items } );

    return( true );
} } );