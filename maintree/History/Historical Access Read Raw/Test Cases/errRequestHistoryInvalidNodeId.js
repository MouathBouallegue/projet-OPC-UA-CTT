/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Invalid NodeId expects Results[0] 'BadInvalidNodeId'. */

function readrawErr007() {
    var result = true;

    var haparams = {
          NodesToRead: new MonitoredItem( UaNodeId.fromString( "i=0" ) ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.Items[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          Debug: CUVariables.Debug,
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
          OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ) ] };

    // issue the call and return the result
    return( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] ServiceResult 'Good' expected; error codes expected at the operation level." ) );
}// function readrawErr007()

Test.Execute( { Procedure: readrawErr007 } );