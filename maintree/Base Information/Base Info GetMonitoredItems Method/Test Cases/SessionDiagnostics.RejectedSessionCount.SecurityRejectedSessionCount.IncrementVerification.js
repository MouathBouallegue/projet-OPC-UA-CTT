/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Verify the method exists */

Test.Execute( { Procedure: test = function() {
    // use TranslateBrowsePaths to query the parameters for the method
    if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { Node: gmiNodeId,
                                                      UaBrowsePaths: [ TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( gmiNodeId, [ "InputArguments" ] ),
                                                      TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( gmiNodeId, [ "OutputArguments" ] ) ],
                                                      OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Good ] ),
                                                      new ExpectedAndAcceptedResults( StatusCode.Good ) ] } ) ) return( false );

    // get the parameters into easy variables and then read them
    var inputArgument  = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
    var outputArgument = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
    if( !ReadHelper.Execute( { NodesToRead: [ inputArgument, outputArgument ] } ) ) return( false );

    // validate the input argument
    var inputAugumentArray = inputArgument.Value.Value.toExtensionObjectArray();
    Assert.Equal( BuiltInType.UInt32, getDataTypeFromNodeId( inputAugumentArray[0].toArgument().DataType ), "GetMonitoredItems.Input data-type mismatch." );

    // validate the output arguments
    var outputArgumentArray = outputArgument.Value.Value.toExtensionObjectArray();
    Assert.Equal( 2, outputArgumentArray.length, "GetMonitoredItems.Output length mismatch." );
    for( var i=0; i<2; i++ ) {
        var currentArg = outputArgumentArray[i].toArgument();
        Assert.Equal( BuiltInType.UInt32, getDataTypeFromNodeId( currentArg.DataType ), "GetMonitoredItems.Output[" + i + "] data-type mismatch. Should be 'UInt32'." );
        Assert.Equal( 1, currentArg.ValueRank, "GetMonitoredItems.Output[" + i + "] ValueRank mismatch. Should be '1' because it is a single-dimension array." );
        Assert.Equal(1, currentArg.ArrayDimensions.length, "GetMonitoredItem.Output[" + i + "] ArrayDimensions mismatch. Should be '1' because the array dimension is a variable length.");
        Assert.Equal(0, currentArg.ArrayDimensions[0], "GetMonitoredItem.Output[" + i + "] ArrayDimensions mismatch. Should be '0' because the array dimension is a variable length.");
    }

    return( true );
} } );