function ReadBrowseNameOfUnregisteredNode( Session, nodeId ) {
    var request = new UaReadRequest();
    var response = new UaReadResponse();
    Session.buildRequestHeader( request.RequestHeader );
    request.NodesToRead[0].NodeId = nodeId;
    request.NodesToRead[0].AttributeId = Attribute.BrowseName;
    var uaStatus = Session.read( request, response );
    if( !uaStatus.isGood() ) addError( "Read() status " + uaStatus, uaStatus );
    else if( !response.ResponseHeader.ServiceResult.isGood() ) addError( "Read of unregistered NodeId Service Result is not good: " + response.ResponseHeader.ServiceResult, response.ResponseHeader.ServiceResult );
    else if( StatusCode.BadNodeIdUnknown !== response.Results[0].StatusCode.StatusCode ) addError( "Read of unregistered NodeId return wrong Result[0].StatusCode: " + response.Results[0].StatusCode, response.Results[0].StatusCode );
}

// the service is expected to succeed
// all operations are expected to succeed
function checkUnregisterNodesValidParameter( Session, request, response, originalNodeIds, suppressMessaging ) {
    var succeeded = true;
    return succeeded;
}