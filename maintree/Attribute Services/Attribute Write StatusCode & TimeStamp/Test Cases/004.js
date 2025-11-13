/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a single valid Node a Value and SourceTimestamp. */

function write582013() {
    var item = scalarNodes[0].clone();
    ReadHelper.Execute({ NodesToRead: item });
    UaVariant.Increment( { Item: item } );

    // write the value and sourceTimestamp only
    item.Value.Value = item.Value.Value;
    // save original sourceTimestamp
    var oldSourceTimestamp = item.Value.SourceTimestamp;
    // create new sourceTimestamp
    var newSourceTimestamp = UaDateTime.utcNow();
    newSourceTimestamp.addHours(1);
    item.Value.SourceTimestamp = newSourceTimestamp;
    item.Value.Set = "Value;SourceTimestamp";
    if( WriteHelper.Execute( { NodesToWrite: item, OperationResults: WriteExpectedResult } ) ) {
        if( WriteHelper.Response.Results[0].isGood() ) {
            VQTsupport |= UaVQTSupport.SourceTimestamp;
            //MantisId: 3140 ToDo: Validate the Timestamps match
            ReadHelper.Execute({ NodesToRead: item });
            Assert.Equal(newSourceTimestamp, item.Value.SourceTimestamp, "The received SourceTimestamp (" + item.Value.SourceTimestamp + ") doesn't match the written SourceTimestamp (" + newSourceTimestamp + ").", "The received SourceTimestamp (" + item.Value.SourceTimestamp + ") matches the written SourceTimestamp (" + newSourceTimestamp + " | Old: " + oldSourceTimestamp + ").");
        }
        else {
            addNotSupported( "Writing to SourceTimestamp" );
            return( false );
        }
    }
    else return( false );
    return( true );
}

Test.Execute( { Procedure: write582013 } );