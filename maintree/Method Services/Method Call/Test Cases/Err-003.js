/*  Test prepared by Shane Kurr: shane.kurr@opcfoundation.org;
    Description: Call method omitting required input arguments */

function methodCallTest() {
    // Get method node id
    var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IArgs ) )[0];
    if ( !isDefined( methodName ) ) {
        var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IOArgs ) )[0];
        if( !isDefined( methodName ) ) {
            addSkipped( "Method with 'in' parameters not configured in settings." );
            return false;
        }
    }

    // Find the parent object
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
        addError( "Method's parent could not be detected." );
        return false;
    }

    // Make sure method exists; and get the parameter nodes so we can read them
    var paramInNodeId;
    if( TranslateBrowsePathsToNodeIdsHelper.Execute( {
        Node: methodName,
        UaBrowsePaths: [ TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "InputArguments" ] ),
                         TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "OutputArguments" ] ) ],
        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ),
                            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) ] } ) ) {
        if( Assert.GreaterThan( 0, TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length ) ) {
            paramInNodeId = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
        } 
        else return false;
    }
    else return false;

    // Check that arguments are required for method, then call method without required arguments
    if( isDefined( paramInNodeId ) ) {
        if( !CallHelper.Execute( {
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ), OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadArgumentsMissing ) ],
            MethodsToCall: [ { MethodId: new UaNodeId.fromString( methodName.NodeId.toString() ),
                               ObjectId: new UaNodeId.fromString( methodObject.NodeId.toString() ) } ] } ) ) {
            return false;
        }
    }
    else return false;

    return true;
}

Test.Execute( { Procedure: methodCallTest } );