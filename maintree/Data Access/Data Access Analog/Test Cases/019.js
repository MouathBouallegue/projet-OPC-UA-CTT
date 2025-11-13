/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write a value to EURange.Low and verify value. Same for EURange.High. */

function analog613019() {
    var item1;
    var analogItem;

    // Check if writable analog items are available
    if( WritableAnalogItems == null || WritableAnalogItems.length == 0 ) {
        addSkipped( "No writable analog items defined" );
        return( false );
    }

    // find a node that has an EURange 
    for( var i=0; i<WritableAnalogItems.length; i++ ) {
         if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { Node: WritableAnalogItems[i], BrowsePaths: [ "EURange" ] } ) ) return( false );
         if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].StatusCode.isGood() ) {
             item1 = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
             analogItem = WritableAnalogItems[i];
             break;
         }
    }//for i
    if( !isDefined( item1 ) ) {
        addError( "Unable to find a node of type AnalogItemType featuring an `EURange` property, which is a MANDATORY property." );
        return( false );
    }
    // read the EURange, and then remember the value; also get the analogitem value 
    ReadHelper.Execute( { NodesToRead: [ item1, analogItem ] } );
    item1.OriginalValue = item1.Value.Value.clone();
    var euRangeValue = item1.Value.Value.toExtensionObject().toRange();
    addLog( "EURange received in Read() =" + euRangeValue.toString() );
    // write a value equal to EURange.Low, which should be fine
    analogItem.SafelySetValueTypeKnown( euRangeValue.Low, analogItem.Value.Value.DataType );
    addLog( "Writing EURange.Low (value = " + euRangeValue.Low + ") to node: " + analogItem.NodeSetting + "." );
    WriteHelper.Execute( { NodesToWrite: analogItem, ReadVerification: true } );
    // write a value equal to the EURange.High, which should also be fine 
    analogItem.SafelySetValueTypeKnown( euRangeValue.High, analogItem.Value.Value.DataType );
    addLog( "Writing EURange.High (value = " + euRangeValue.High + ") to node: " + analogItem.NodeSetting + "." );
    WriteHelper.Execute( { NodesToWrite: analogItem, ReadVerification: true } );
    // clean-up
    analogItem = null;
    item1 = null;
    return( true );
}// function analog613019()

Test.Execute( { Procedure: analog613019 } );