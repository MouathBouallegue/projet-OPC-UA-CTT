/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: event on invocation of method with in args */

Test.Execute( { Procedure: function() {
    // do we have a method to use? if not, skip the test
    if( Settings.ServerTest.NodeIds.Methods.IArgs.length == 0 ) {
        addSkipped( "No method defined in settings (/NodeIds/Methods/IArgs)" );
        return( false );
    }

    // find the method and it's parent object
    var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IArgs ) )[0];
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
       addError( "Method's parent could not be detected." );
       return( false );
    }

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

            if( result ) result = CallHelper.Execute( {
                    ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadNoMatch ) ],
                    MethodsToCall: [ { MethodId: new UaNodeId.fromString( methodName.NodeId.toString() ), 
                                       ObjectId: new UaNodeId.fromString( methodObject.NodeId.toString() ),
                                       InputArguments: argValues } ] } );

                // step 2: check if an audit event occurred
                if( Assert.True( test.lookForEvents(), "AuditUpdateMethodEventType not received when invoking method." ) ) {
                    Assert.True( test.lookForEventType( UaAuditType.AuditUpdateMethodEventType ), "AuditUpdateMethodEventType not found in the Publish notification.", "Found AuditUpdateMethodEventType in the Publish response!" );
                }
            
        }// read
    }
    else {
        addError( "The method contains 'in' and 'out' parameters. Only 'in' parameters are needed. Please check settings." );
        return( false );
    }

    return( true );
} } );