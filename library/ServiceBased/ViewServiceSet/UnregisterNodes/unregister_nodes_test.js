include( "./library/Base/array.js" );

function RegisterTestNodes( Session, nodesToRegister ) {
    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();
    // add the nodes
    RegisterNodesHelper.Execute( { NodesToRegister: nodesToRegister, ReturnDiagnostics: request.RequestHeader.ReturnDiagnostics, SkipValidation: true } );
    response = RegisterNodesHelper.Response;
    return response.RegisteredNodeIds;
}


function TestUnregisterRegisteredNodes( Session, nodesToUnregister, registeredNodes, returnDiagnostics ) {
    var request = CreateDefaultUnregisterNodesRequest( Session );
    var response = new UaUnregisterNodesResponse();
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // add the nodes
    for( var i = 0; i < nodesToUnregister.length; i++ ) request.NodesToUnregister[i] = nodesToUnregister[i];
    
    UnregisterNodesHelper.Execute( { NodesToUnregister: nodesToUnregister, ReturnDiagnostics: returnDiagnostics, SkipValidation: true } );
    var uaStatus = UnregisterNodesHelper.UaStatus;
    request = UnregisterNodesHelper.Request;
    response = UnregisterNodesHelper.Response;
    if( uaStatus.isGood() ) checkUnregisterNodesValidParameter( Session, request, response, registeredNodes );
    else addError( "UnregisterNodes() status " + uaStatus, uaStatus );
}

function TestUnregisterNodes( Session, nodesToRegister, returnDiagnostics ) {
    print( "Unregistering " + nodesToRegister.length + " nodes with ReturnDiagnostics set to " + returnDiagnostics );
    var nodesToUnregister = RegisterTestNodes( Session, nodesToRegister );
    if( !Assert.Equal( nodesToRegister.length, nodesToUnregister.length, "Test cannot be completed: Wrong number of nodes registered" ) ) return;
    TestUnregisterRegisteredNodes( Session, nodesToUnregister, nodesToRegister, returnDiagnostics );
}

function TestUnregisterMultipleNodes( Session, maxLength, returnDiagnostics ) {
    var nodesToRegister = GetMultipleUniqueNodeIds( maxLength );
    if( nodesToRegister.length !== maxLength ) {
        print( "Found " + nodesToRegister.length + " unique NodeIds in settings" );
        print( "Require " + maxLength + " unique NodeIds; attempting to browse for more" );
        FindObjectsOfTypeHelper.Execute( { TypeToFind: new UaNodeId( Identifier.BaseVariableType ), IncludeSubTypes: true, MaxNodesToReturn: maxLength } );
        nodesToRegister = FindObjectsOfTypeHelper.Response.Nodes;
        if( nodesToRegister.length === maxLength ) addLog( "Successfully found " + nodesToRegister.length + " unique nodes" );
        else {
            addSkipped( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a requred " + maxLength );
            return;
        }
    }
    TestUnregisterNodes( Session, nodesToRegister, returnDiagnostics );
}

function TestUnregisterMultipleNodesTwice( Session, maxLength, returnDiagnostics ) {
    print( "Unregistering " + maxLength + " unregistered node" );
    // get nodes
    var nodesToRegister = GetMultipleUniqueNodeIds( maxLength );
    if ( nodesToRegister.length !== maxLength ) {
        FindObjectsOfTypeHelper.Execute( { TypeToFind: new UaNodeId( Identifier.BaseVariableType ), IncludeSubTypes: true, MaxNodesToReturn: maxLength } );
        nodesToRegister = FindObjectsOfTypeHelper.Response.Nodes;
    }
    if ( nodesToRegister.length === maxLength ) addLog( "Successfully found " + nodesToRegister.length + " unique nodes" );
    else {
        addSkipped( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a requred " + maxLength );
        return;
    }
    // register nodes
    var nodesToUnregister = RegisterTestNodes( Session, nodesToRegister );
    if( !Assert.Equal( nodesToRegister.length, nodesToUnregister.length, "Test cannot be completed: Wrong number of nodes registered" ) ) return;
    // unregister the nodes once
    TestUnregisterRegisteredNodes( Session, nodesToUnregister, nodesToRegister, returnDiagnostics );    
    // unregister again
    TestUnregisterRegisteredNodes( Session, nodesToUnregister, nodesToRegister, returnDiagnostics );
}