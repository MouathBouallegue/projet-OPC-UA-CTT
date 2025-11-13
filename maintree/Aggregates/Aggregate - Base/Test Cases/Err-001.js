/*
    File maintree/Aggregates/Aggregate - Base/Err-001.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

    For each supported aggregate, issue a Read but only specify 2 of the 3 required parameters:								
    a.) startTime and endTime.								
*/

function aggregate_err_001() {
    
    // Set up a read with a bad extension object
    
    var result = false;

    var fakeHistoryReadObject = new UaExtensionObject()
    var filter = new UaAggregateFilter();
    fakeHistoryReadObject.setAggregateFilter(filter);

    var session = isDefined( Test.Session.Session )? Test.Session.Session : Test.Session;

    // Just need one item
    var nodesToRead = new UaHistoryReadValueIds(1);
    nodesToRead.NodeId = new UaNodeId(CUVariables.Items[0].NodeId); 

    var request = new UaHistoryReadRequest();
    var response = new UaHistoryReadResponse();

    request.RequestHeader = UaRequestHeader.New( { Session: session } );
    request.NodesToRead = nodesToRead;
    request.HistoryReadDetails = fakeHistoryReadObject;
    request.TimestampsToReturn = TimestampsToReturn.Source;
    request.ReleaseContinuationPoints = false;

    var requestResponse = session.historyRead( request, response );
    if ( requestResponse.isGood() )
    {
        if ( response.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadHistoryOperationInvalid ){
            result = true;
        }else{
            addError("Unexpected service result: " + response.ResponseHeader.ServiceResult.toString());
        }
    }

    return result;  
}

Test.Execute( { Procedure: aggregate_err_001 } );