/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Empty request header; a number of status codes could be returned */

function readrawErr001() {
    var haparams = {
          PreHook: function( ) { HistoryReadHelper.Request.NodesToRead.length = 0; },
          NodesToRead: new MonitoredItem( new UaNodeId() ),
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: new UaDateTime(),
                                    EndTime: new UaDateTime(),
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug,
          ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadHistoryOperationInvalid, StatusCode.BadNothingToDo ] ) };

    return( HistoryReadHelper.Execute( haparams ) );
}// function readrawErr001()

Test.Execute( { Procedure: readrawErr001 } );