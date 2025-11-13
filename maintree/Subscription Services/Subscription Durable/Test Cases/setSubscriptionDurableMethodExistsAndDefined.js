/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Check the SetSubscriptionDurable if method exists in the Server object and that it exists as defined in the specifications.
    Expectation: NodeId and BrowseName are correct. The parameters are [in] UInt32 subscriptionID, [in] UInt32 lifetimeInHours, [out] UInt32 revisedLifetimeHours.
*/

function subscriptionDurable000() {
    var result = true;
    // we already verified the existance of a node with the BrowseName 'SetSubscriptionDurable' in the initialize so next line should never apply.
    if ( !isDefined( setSubscriptionDurableMethod ) ) addError( "Unable to find a node in the server object with the BrowseName 'SetSubscriptionDurable'." ); result = false;

    // compare the NodeId of the node found and the NodeSetFile V1.03 (i=12749).
    if ( !setSubscriptionDurableNodeId.equals( new UaNodeId( 12749 ) ) ) addError( "The NodeId of the SetSubscriptionDurable method is not as expected by the NodeSetFile V1.03. Received: " + setSubscriptionDurableNodeId + ", expected: i=12746." ); result = false;

    // The method has input and output arguments, so both should be found by browsing the node.
    TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [UaBrowsePath.New( { StartingNode: setSubscriptionDurableNodeId, RelativePathStrings: ["InputArguments"] } ), UaBrowsePath.New( { StartingNode: setSubscriptionDurableNodeId, RelativePathStrings: ["OutputArguments"] } )], OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] ), new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )] } );
    var setSubscriptionDurableInputArguments = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
    var setSubscriptionDurableOutputArguments = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
    if ( !isDefined( setSubscriptionDurableInputArguments ) ) addError( "Input arguments are missing." ); result = false;
    if ( !isDefined( setSubscriptionDurableOutputArguments ) ) addError( "Output arguments are missing." ); result = false;

    // check that the input arguments
    if ( ReadHelper.Execute( { NodesToRead: setSubscriptionDurableInputArguments, TimestampsToReturn: TimestampsToReturn.Neither } ) ) {
        var inputArguments = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
        var firstInputArgument = inputArguments[0].toArgument();
        if ( firstInputArgument.Name.toUpperCase() != "SUBSCRIPTIONID" ) addError( "The name of the first input argument is not as expected. Received: " + firstInputArgument.Name + ", expected: SubscriptionId." ); result = false;
        if ( !firstInputArgument.DataType.equals( new UaNodeId( BuiltInType.UInt32 ) ) ) addError( "The DataType of the first input argument is not as expected. Received: " + getDataTypeNameFromNodeId( firstInputArgument.DataType ) + ", expected: UInt32." ); result = false;
        var secondInputArgument = inputArguments[1].toArgument();
        if ( secondInputArgument.Name.toUpperCase() != "LIFETIMEINHOURS" ) addError( "The name of the first input argument is not as expected. Received: " + secondInputArgument.Name + ", expected: LifetimeInHours." ); result = false;
        if ( !secondInputArgument.DataType.equals( new UaNodeId( BuiltInType.UInt32 ) ) ) addError( "The DataType of the first input argument is not as expected. Received: " + getDataTypeNameFromNodeId( secondInputArgument.DataType ) + ", expected: UInt32." ); result = false;
    }
    else {
        addSkipped( "Verification of the input arguments is skipped because the value can't be read." ); result = false;
    }

    // check that the output arguments
    if ( ReadHelper.Execute( { NodesToRead: setSubscriptionDurableOutputArguments, TimestampsToReturn: TimestampsToReturn.Neither } ) ) {
        var outputArguments = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
        var firstOutputArgument = outputArguments[0].toArgument();
        if ( firstOutputArgument.Name.toUpperCase() != "REVISEDLIFETIMEINHOURS" ) addError( "The name of the first output argument is not as expected. Received: " + firstOutputArgument.Name + ", expected: RevisedLifetimeInHours." ); result = false;
        if ( !firstOutputArgument.DataType.equals( new UaNodeId( BuiltInType.UInt32 ) ) ) addError( "The DataType of the first output argument is not as expected. Received: " + getDataTypeNameFromNodeId( firstOutputArgument.DataType ) + ", expected: UInt32." ); result = false;
    }
    else {
        addSkipped( "Verification of the output arguments is skipped because the value can't be read." ); result = false;
    }

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable000 } );