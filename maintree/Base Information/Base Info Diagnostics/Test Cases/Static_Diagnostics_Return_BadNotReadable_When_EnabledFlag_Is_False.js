/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Static diagnostics return BadNotReadable when EnabledFlag=false */

Test.Execute( { Procedure: function test() {
    // arguments: browseName, objectDefinition
    this.nodeInDefinitionIsVariable = function( args ) {
        // validate input arguments
        if( args == undefined || args == null ) return( false );
        if( args.BrowseName == undefined || args.BrowseName == null || args.BrowseName.length < 1 ) return( false );
        if( args.ObjectDefinition == undefined || args.ObjectDefinition == null ) return( false );
        if( args.ObjectDefinition.References == undefined || args.ObjectDefinition.References == null || args.ObjectDefinition.References.length == undefined || args.ObjectDefinition.References.length < 1 ) return( false );
        // now to walk through the object looking for a matching browse name
        for( var r=0; r<args.ObjectDefinition.References.length; r++ ) { // iterate thru each reference
            // have we found a matching browse name that is also a Variable?
            if( args.ObjectDefinition.References[r].BrowseName == args.BrowseName && args.ObjectDefinition.References[r].NodeClass == NodeClass.Variable ) return( true );
            // is this nested? if so, recursively dig deeper...
            if( args.ObjectDefinition.References[r].TypeInstance !== undefined && args.ObjectDefinition.References[r].TypeInstance !== null ) {
                if( this.nodeInDefinitionIsVariable( { BrowseName: args.BrowseName, ObjectDefinition: args.ObjectDefinition.References[r].TypeInstance } ) ) return( true );
            }//typeInstance exists
        }//for r...
        return( false );
    }

    // first, read the enabledFlag state. We don't care about the value at this point...
    if( ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } ) ) {
        _enabledFlagNode.InitialValue = _enabledFlagNode.Value.Value.clone();
        _cumulSessionCountNode.InitialValue = _cumulSessionCountNode.Value.Value.clone();

        // STEP 2
        // if EnabledFlag=TRUE then try to set to FALSE; if this fails then exit gracefully
        if( _enabledFlagNode.InitialValue.toBoolean() == true ) {
            UaVariant.Increment( { Item: _enabledFlagNode } );
            if( WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotWritable ] ) } ) ) {
                if( WriteHelper.Response.Results[0].isBad() ) {
                    addSkipped( "Unable to write to the EnabledFlag node. Aborting test." );
                    return( false );
                }
            }//write
        }// toggle the EnabledFlag to FALSE

        // let's go read the diagnostics... we'll do this by browsing the address space to make sure the nodes
        // still exist. Then, we will attempt to read their values...
        if( TBPTNI.CheckChildStructure( { StartingNode:  MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics ) )[0], 
                                          ObjectDefinition: serverDiagnostics, 
                                          TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper,
                                          SuppressMessaging: true } ) ) {

            // build a list of nodeIds that we can read based on the Browse results
            var items = [], expectedResults = [];
            for( var b=0; b<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; b++ ) { // iterate thru each translate result
                if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[b].StatusCode.isGood() ) { // go deeper if browse success
                    for( var r=0; r<TranslateBrowsePathsToNodeIdsHelper.Response.Results[b].Targets.length; r++ ) { // iterate thru each target
                        // before we take the result, we need to make sure that the item is readable since
                        // the definition contains Variables and Objects...
                        // so let's check the request against the definition and then take variables only...
                        if( this.nodeInDefinitionIsVariable( {
                                BrowseName:       TranslateBrowsePathsToNodeIdsHelper.Request.BrowsePaths[b].RelativePath.Elements[ TranslateBrowsePathsToNodeIdsHelper.Request.BrowsePaths[b].RelativePath.Elements.length - 1 ].TargetName.Name,
                                ObjectDefinition: serverDiagnostics } ) ) {
                            items.push( MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[b].Targets[r].TargetId.NodeId )[0] );
                            // populate our expected results... the first item (EnabledFlag) should succeed and all others fail
                            if( b == 0 ) expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
                            else expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.BadNotReadable ) );
                        }
                    }//for r...
                }//if browse result good
            }//for b...

            // make sure we have some items to read...
            if( Assert.GreaterThan( 0, items.length, "No Diagnostics items to read. The static diagnostic nodes should be available in the address space, always." ) ) {
                if( ReadHelper.Execute( { NodesToRead: items, OperationResults: expectedResults } ) ) print( "Read success. EnabledFlag=GOOD; all other items=BadNotReadble." );
            }//assert >
        }

        // reset to the original value
        _enabledFlagNode.Value.Value = _enabledFlagNode.InitialValue.clone();
        WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false } );
    }
    return( true );
} } );