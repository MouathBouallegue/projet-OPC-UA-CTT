/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:
        Write to a subset of an array and verify the Timestamps are updated.

    Pre-conditions:
        WriteFullArrayOnly flag is not set on the node to test.

    Expected Results:
        SourceTimestamp is updated to the time of write.
        ServerTimestamp is updated once the new value has been verified.
        In case of an external DataSource the ServerTimestamp may be different than the SourceTimestamp.

*/

function write011() {

    var result = true;
    var firstTimestamp = [];
    var expectedResults = [];

    for ( var i = 0; i < items.length; i++ ) items[i].IndexRange = "0:1";        //Sets the Index to the first and second Value of the array
    ReadHelper.Execute( { NodesToRead: items, TimestampsToReturn: TimestampsToReturn.Both } );      // Perform a Read for thr first SourceTimestamp
    
    // specify the element number that we want to write to
    for ( var i = 0; i < items.length; i++ ) {
        firstTimestamp.push( items[i].Value.SourceTimestamp );    //Store the SourceTimestamps before the write
        UaVariant.Increment( { Item: items[i] } );
        var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults.push( expectedResult );
    }

    // Write new values to any subset of an array using IndexRanges.
    if(!WriteHelper.Execute( { NodesToWrite: items, OperationResults: expectedResults, CheckNotSupported: true, ReadVerification: false } ) ) {
        addError("The Write failed. Aborting Test!");
        return ( false );
    }
    // Perform a Read for the second SourceTimestamp
    ReadHelper.Execute( { NodesToRead: items, TimestampsToReturn: TimestampsToReturn.Both } );    

    for ( i = 0; i < items.length; i++ ) {
        
        if( firstTimestamp[i] == null || items[i].Value.SourceTimestamp == null ) {
            addError("One or more SourceTimestamps are missing. Please verify if the Server returned any SourceTimestamps. Affected Node: DataType: " + getDataTypeNameFromNodeId( new UaNodeId(items[i].DataType) ) + ", NodeId: " + items[i].NodeId );
            continue;
        }
        else{
            if( 0 == items[i].Value.SourceTimestamp.msecsTo(firstTimestamp[i]) ) {
                addError( "SourceTimestamps are identical, it didn't update after the write. Affected Node: DataType: " + getDataTypeNameFromNodeId( new UaNodeId(items[i].DataType) ) + ", NodeId: " + items[i].NodeId );
            }
            else if( 0 < items[i].Value.SourceTimestamp.msecsTo(firstTimestamp[i]) ){
                addError( "The updated SourceTimestamp is smaller than the previous. Affected Node: DataType: " + getDataTypeNameFromNodeId( new UaNodeId(items[i].DataType) ) + ", NodeId: " + items[i].NodeId );
            }
        }
    }
    return ( result );
}

Test.Execute( { Procedure: write011 } );