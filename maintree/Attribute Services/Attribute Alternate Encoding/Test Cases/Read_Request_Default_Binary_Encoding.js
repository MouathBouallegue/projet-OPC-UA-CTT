/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:
        Request Value attribute with dataEncoding = `Default Binary`.

    Expected Results:
        Service result is `Good`. Operation level result is `Good`.
*/

function readEncoding001() {

    var itemsDataType = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Structures.Settings  );
    for ( var i = 0; itemsDataType.length > i; i++ ) {
        itemsDataType[i].AttributeId = Attribute.DataType;
    }
    if ( !isDefined( itemsDataType ) || itemsDataType.length === 0 ) {
        addSkipped( "Nodes of type Structure must be set for this test to run." );
        return ( false );
    }
    ReadHelper.Execute( { NodesToRead: itemsDataType } );

    var structureType = [];    
    for ( var i = 0; itemsDataType.length > i; i++ ) {
        structureType.push( new UaNodeId.fromString( ReadHelper.Response.Results[i].Value.toString() ) );
    }

    var structureSubTypes = MonitoredItem.fromNodeIds( structureType );
    BrowseHelper.Execute( { NodesToBrowse: structureSubTypes } );

    var hasEncoding = false;
    var itemsValue = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Structures.Settings );
    for ( var i = 0; itemsValue.length > i; i++ ) {     
        for ( var v = 0; BrowseHelper.Response.Results[i].References.length > v; v++ ) {
            if ( BrowseHelper.Response.Results[i].References[v].BrowseName.Name == "Default Binary" ) {
                itemsValue[i].DataEncoding.Name = "Default Binary";                
                hasEncoding = true;
            }
            else {
                print( "Node: " + itemsValue[i].NodeId + "  doesn't support 'Default Binary' Encoding." );
            }
        }
    }

    if ( hasEncoding ) {
        // perform a read using "Default Binary" for the encoding
        return( ReadHelper.Execute( {
                    NodesToRead: itemsValue,
                    TimestampsToReturn: TimestampsToReturn.Server } ) );
    }
    else {
        addSkipped( "None of the Structures support Encoding in 'Default Binary'." );
        return ( false );
    }
}
Test.Execute( { Procedure: readEncoding001 } );