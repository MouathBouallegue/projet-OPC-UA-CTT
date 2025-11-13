/*  Test prepared by compliance@opcfoundation.org
    Description: Call a method that has IN parameters only, e.g.void method( in ); 
                 multiple times in a single Call method */

function methodCallTest() {
    var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IArgs ) )[0];
    if ( !isDefined( methodName ) ) {
       addSkipped( "Method with 'in' only parameters not configured in settings." );
       return false;
    }
    // find the parent object
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
       addError( "Method's parent could not be detected." );
       return false;
    }
    var result = true;
    //Make sure method exists; and get the parameter nodes so we can read them
    var paramInNodeId, paramOutNodeId;
    if( TranslateBrowsePathsToNodeIdsHelper.Execute( {
                    Node: methodName,
                    UaBrowsePaths: [ TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "InputArguments" ] ),
                                     TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "OutputArguments" ] ) ],
                    OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ),
                                        new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) ] } ) ) {
        if( Assert.Equal( 2, TranslateBrowsePathsToNodeIdsHelper.Response.Results.length, "2 TranslateBrowsePathsToNodeIds Results expected." ) ) {
            if( Assert.GreaterThan( 0, TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length, "TranslateBrowsePathsToNodeIdsHelper.Response[0].Targets expected when reading INPUT arguments." ) ) {
                paramInNodeId = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
            }
            if( !Assert.Equal( 0, TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets.length, "TranslateBrowsePathsToNodeIdsHelper.Response[1].Targets expected when reading OUTPUT arguments." ) ) {
                paramOutNodeId = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
            }
        }
        else result = false;
    }
    // do we have the right parameter setup? if so then set a value and then invoke
    if( isDefined( paramInNodeId ) && !isDefined( paramOutNodeId ) ) {
        if( ReadHelper.Execute( { NodesToRead: paramInNodeId } ) ) {
            var arguments = [], argValues = [];
            var paramsArrayObj = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
            for( var p=0; p<paramsArrayObj.length; p++ ) {
                var thisParam = paramsArrayObj[p].toArgument();
                arguments.push( thisParam );
                var newVar = new UaVariant();
                UaVariant.SetValueMin( { Value: newVar, Type: BuiltInType.FromNodeId( thisParam.DataType ) } );
                argValues.push( newVar.clone() );
            }

            // pass in the same method request (cloned) another 5 times
            var methods = [], operationResults = [];
            for( var i=0; i<5; i++ ) {
                for (var j = 0; j < argValues.length; j++) {
                    UaVariant.Increment({ Value: argValues[j] });
                }
                operationResults.push( new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadNoMatch ) );
                methods.push( { MethodId: new UaNodeId.fromString( methodName.NodeId.toString() ),
                                ObjectId: UaNodeId.fromString( methodObject.NodeId.toString() ),
                                InputArguments: argValues
                });
            }

            if( result ) result = CallHelper.Execute( {
                    ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),OperationResults: operationResults,
                    MethodsToCall: methods } );

        }// read
    }
    else {
        addError( "The method contains 'in' and 'out' parameters. Only 'in' parameters are needed. Please check settings." );
        result = false;
    }
    return( result );
}

Test.Execute( { Debug: true, Procedure: methodCallTest } );