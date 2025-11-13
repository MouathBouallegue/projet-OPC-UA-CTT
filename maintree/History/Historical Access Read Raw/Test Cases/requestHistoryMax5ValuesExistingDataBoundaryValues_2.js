/*  Test prepared by compliance@opcfoundation.org
    Description: Request bounds and a max of 5 values */

function readraw019() {
    // items with more than 5 records are needed. Search all configured items
    // that have >= 6 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( 6 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (more than 5 records)" ); return( false ); }
    
    var end1 = haItems[0].RawValues[4].SourceTimestamp;
    end1.addMilliSeconds( 3 );
    
    const NUMVALUESPERNODE = 5;
    var haparams = {
          ClearServerContinuationPoints: false,
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: end1,
                                    EndTime: haItems[0].FirstValueInHistory.SourceTimestamp, 
                                    NumValuesPerNode: NUMVALUESPERNODE,
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // endTime is valid, startTime is 4th additional record after endTime +3ms, 5 nodes per response, request bounds
    if( CUVariables.Debug ) print( "\nTEST ONE: endTime valid; startTime is 4th additional record after endTime +3ms; 5 values per node; request bounds.\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.Equal( 1, HistoryReadHelper.Response.Results.length, "Wrong # of results returned.", "Correct # of results returned." ) ) result = false;
        if( !Assert.Equal( NUMVALUESPERNODE, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( Assert.NotEqual( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "Expected ContinuationPoint not received", "Correct, ContinuationPoint received." ) ) {
            // read again; expecting the endBound to be received only
            if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
                if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
                if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, CUVariables.Items[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
                if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
                if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "Wrong, ContinuationPoint received when it should be the end of the record.", "Correct, ContinuationPoint not received." ) ) result = false;
            }
            else result = false;
        }
        else result = false;
    }
    else result = false;

    return( result );
}

readraw019();//Test.Execute( { Procedure: readraw019 } );