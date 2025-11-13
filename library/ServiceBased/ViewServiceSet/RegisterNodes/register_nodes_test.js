include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );

function UnregisterTestedNodes( Session, nodesToUnregister ) {
    UnregisterNodesHelper.Execute( { NodesToUnregister: nodesToUnregister, SkipValidation: true } );
}

function TestRegisterNodes( Session, nodesToRegister, returnDiagnostics ) {
    print( "Registering a total of " + nodesToRegister.length + " nodes" );
    //get MaxNodesPerRegisterNodes
    var MaxNodesPerRegisterNodes = MonitoredItem.fromNodeIds(new UaNodeId(Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRegisterNodes))[0];
    if (ReadHelper.Execute({
        NodesToRead: MaxNodesPerRegisterNodes,
        OperationResults: new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadNodeIdUnknown])
    })) {
        if (ReadHelper.Response.Results[0].StatusCode.isBad()) {
            addNotSupported("MaxNodesPerRead is not available within the ServerCapabilities object.");
        }
    }

    var MaxNodesPerRegisterNodesValue = MaxNodesPerRegisterNodes.Value.Value.toUInt32();
    if (MaxNodesPerRegisterNodesValue === 0) {
        addLog("MaxNodesPerRegisterNodes is set to zero. It should be set to a realistic value. OperationLimit will be limited to this value.");
        MaxNodesPerRegisterNodesValue = MAX_ALLOWED_SIZE;
    }
    else if (MaxNodesPerRegisterNodesValue > MAX_ALLOWED_SIZE) {
        addLog("MaxNodesPerRegisterNodes is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value.");
        MaxNodesPerRegisterNodesValue = MAX_ALLOWED_SIZE;
    }
    // add the nodes

    for( var i = 0, j = 0; ( i < nodesToRegister.length ); i++ )
    {
        if (j == 0) {
            
            var request = CreateDefaultRegisterNodesRequest(Session);
            var response = new UaRegisterNodesResponse();
            request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
        }

        request.NodesToRegister[j] = nodesToRegister[i];

        if ((j + 1) == MaxNodesPerRegisterNodesValue || (i + 1) == nodesToRegister.length) {
            print("Registering " + (j + 1) + " nodes");
            var uaStatus = Session.registerNodes(request, response);
            if (uaStatus.isGood()) {
                assertRegisterNodesSuccess(Session, request, response);
                UnregisterTestedNodes(Session, response.RegisteredNodeIds);
            }
            else addError("RegisterNodes() status " + uaStatus, uaStatus);
            j = 0;
        }
        else {
            j++;
        }
    }
}


// Browse from the nodesToBrowse for additional unique NodeIds.
// NodeIds are appended to nodesToBrowse, which means the new
// NodeIds will eventually be browsed as well (effectively
// browsing the entire model).
// nodesToBrowse will not exceed maxLength.
function BrowseForUniqueNodeIds( Session, nodesToBrowse, maxLength ) {
    for( var i = 0; ( i < nodesToBrowse.length ) && ( nodesToBrowse.length < maxLength ); i++ ) {
        var references = GetTest1ReferencesFromNodeId( Session, nodesToBrowse[i] );
        for( var j = 0; ( j < references.length ) && ( nodesToBrowse.length < maxLength ); j++ ) AddUniqueNodeIdToArray( nodesToBrowse, references[j].NodeId.NodeId );
    }
}


function TestRegisterMultipleNodes( Session, maxLength, returnDiagnostics ) {

    var nodesToRegister = GetMultipleUniqueNodeIds(maxLength);
    if( nodesToRegister.length !== maxLength ) {
        print( "Found " + nodesToRegister.length + " unique NodeIds in settings" );
        print( "Require " + maxLength + " unique NodeIds; attempting to browse for more" );
        // Try browsing the current nodesToRegister to find more nodes.
        FindObjectsOfTypeHelper.Execute( { TypeToFind: new UaNodeId( Identifier.BaseVariableType ), IncludeSubTypes: true, MaxNodesToReturn: maxLength } );
        nodesToRegister = FindObjectsOfTypeHelper.Response.Nodes;
        if( nodesToRegister.length === maxLength ) addLog( "Successfully found " + nodesToRegister.length + " unique nodes" );
        else {
            addSkipped( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a requred " + maxLength );
            return;
        }
    }
    TestRegisterNodes( Session, nodesToRegister, returnDiagnostics );
}