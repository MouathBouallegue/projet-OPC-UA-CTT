/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: MaxNodesPerMethodCall */

function test() {
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerMethodCall ) )[0];
    ReadHelper.Execute( { NodesToRead: item, OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown] ) } );
    if ( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
        addNotSupported( "MaxNodesPerMethodCall is not available within the ServerCapabilities object." );
        return ( false );
    }

    var realValue = item.Value.Value.toUInt32();
    var setOperationLimit = false;
    if ( realValue === 0 ) {
        addError( "MaxNodesPerMethodCall is set to zero. Specifications Part 5, OperationLimitsType: 'Any operational limits Property that is provided shall have a non zero value.'" );
        return ( false );
    }
    else if ( realValue > MAX_ALLOWED_SIZE ) {
        addWarning( "MaxNodesPerMethodCall is set to '" + realValue + "', which is above the max allowed size setting of '" + MAX_ALLOWED_SIZE + "'. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
        setOperationLimit = true;
    }

    var methodNames = [
        MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.NoArgs ) )[0],
        MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IOArgs ) )[0],
        MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IArgs ) )[0],
        MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.OArgs ) )[0]
    ]

    var operationResult = new ExpectedAndAcceptedResults( [StatusCode.Good] );
    var inputArguments = [];
    for ( var i = 0; i < methodNames.length; i++ ) {
        if ( !isDefined( methodNames[i] ) ) continue;
        else {
            var methodName = methodNames[i];
            var paramInNodeId;
            if ( TranslateBrowsePathsToNodeIdsHelper.Execute( {
                Node: methodName,
                UaBrowsePaths: [TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, ["InputArguments"] )],
                OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )]
            } ) ) {
                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length > 0 ) {
                    paramInNodeId = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
                }
                if ( isDefined( paramInNodeId ) ) {
                    if ( ReadHelper.Execute( { NodesToRead: paramInNodeId } ) ) {
                        var arguments = []
                        var paramsArrayObj = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
                        for ( var p = 0; p < paramsArrayObj.length; p++ ) {
                            var thisParam = paramsArrayObj[p].toArgument();
                            arguments.push( thisParam );
                            var newVar = new UaVariant();
                            UaVariant.SetValueMin( { Value: newVar, Type: BuiltInType.FromNodeId( thisParam.DataType ) } );
                            inputArguments.push( newVar.clone() );
                        }
                    }
                }
            }
        }
        break;
    }
    if ( !isDefined( methodName ) ) {
        // no methods are configured try to use GetMonitoredItems method instead
        methodName = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_GetMonitoredItems ) )[0];
        if ( !isDefined( methodName ) ) {
            addError( "No method has been found to validate this OperationLimit. Either the GetMonitoredItems method needs to be available or a method has to be configured in the CTT settings.\nIf methods are not supported by the server, this OperationLimit shouldn't be provided." );
            return ( false );
        }
        inputArguments = [UaVariant.New( { Value: 123456789, Type: BuiltInType.UInt32 } )];
        operationResult = null;
        operationResult = new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSubscriptionIdInvalid] );
    }
    // find the parent object
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
        addError( "Parent object of method (" + methodName.NodeId + ") could not be detected. The CTT requires that the server provides inverse references on the methods." );
        return ( false );
    }

    // now construct a large method call; success is expected
    var methodsToCall = [];
    for ( var i = 0; i < realValue; i++ ) {
        methodsToCall.push(
            {
                MethodId: methodName.NodeId,
                ObjectId: methodObject.NodeId,
                InputArguments: inputArguments,
                OperationResults: operationResult
            }
        );
    }
    if ( !CallHelper.Execute( { MethodsToCall: methodsToCall, ProhibitSplitting: true } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return ( false );
    }

    // repeat, this time we want a FAILURE so we'll exceed the max # by one
    if ( realValue < MAX_ALLOWED_SIZE ) {
        if ( !setOperationLimit ) { // skipp that test if we did set the value to the MAX_ALLOWED_SIZE as the server is capaable of doing more
            methodsToCall.push( methodsToCall[0] );
            if ( !CallHelper.Execute( { MethodsToCall: methodsToCall, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded] ), ProhibitSplitting: true } ) ) {
                // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
                Test.Disconnect();
                Test.Connect();
            }
        }

    }
    else {
        print( "Can't exceed the number of elements as the server supports more than we want to test." );
    }
    return ( true );
}

Test.Execute( { Procedure: test } );