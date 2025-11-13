/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Start/end bound received when requested */

function readraw014() {
    const DATESKIP = 5;
    // items with more than {DATESKIP} records are needed. Search all configured items
    // that have >= {DATESKIP} + 1 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( DATESKIP + 1 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (>" + DATESKIP + " records)" ); return( false ); }
    
    var haparams = { 
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: haItems[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: haItems[0].RawValues[DATESKIP].SourceTimestamp, 
                                    NumValuesPerNode: 1, 
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // TEST 1: start/end bounds are valid, one node per response, request bounds
    if( CUVariables.Debug ) print( "\nTEST 1: valid bounds requested, one node per response\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint expected, but not received.", "Correct, ContinuationPoint received." ) ) result = false;
    } 
    else result = false;
    CUVariables.ResetItems();


    // TEST 2: same, but now 2 values per response
    if( CUVariables.Debug ) print( "\nTEST 2: 2 values per response\n" );
    haparams.HistoryReadDetails.NumValuesPerNode = 2;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( Assert.Equal( 2, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[1].StatusCode.isGood(), "OperationResults[1] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haItems[0].RawValues[1].SourceTimestamp, haItems[0].Value[1].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint expected, but not received.", "Correct, ContinuationPoint received." ) ) result = false;
        }
        else result = false;
    } 
    else result = false;
    CUVariables.ResetItems();

    // TEST 3: no endTime, but now 1 values per response
    if( CUVariables.Debug ) print( "\nTEST 3: no endTime and 1 value per response\n" );
    haparams.HistoryReadDetails.EndTime = new UaDateTime();
    haparams.HistoryReadDetails.NumValuesPerNode = 1;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint received by mistake.", "Correct, ContinuationPoint not received." ) ) result = false;
    } 
    else result = false;
    CUVariables.ResetItems();
    

    // TEST 4: no endTime, but now 2 values per response
    if( CUVariables.Debug ) print( "\nTEST 4: no endTime and 2 values per response\n" );
    haparams.HistoryReadDetails.NumValuesPerNode = 2;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( Assert.Equal( 2, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[1].StatusCode.isGood(), "OperationResults[1] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haItems[0].RawValues[1].SourceTimestamp, haItems[0].Value[1].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint received by mistake.", "Correct, ContinuationPoint not received." ) ) result = false;
        }
        else result = false;
    } 
    else result = false;
    CUVariables.ResetItems();


    // TEST 5: no startTime, but now 1 value per response
    if( CUVariables.Debug ) print( "\nTEST 5: no startTime and 1 value per response\n" );
    haparams.HistoryReadDetails.StartTime = new UaDateTime();
    haparams.HistoryReadDetails.EndTime = haItems[0].RawValues[DATESKIP].SourceTimestamp.clone();
    haparams.HistoryReadDetails.NumValuesPerNode = 1;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint received by mistake.", "Correct, ContinuationPoint not received." ) ) result = false;
    } 
    else result = false;
    CUVariables.ResetItems();


    // TEST 6: same as before, 2 items per response
    if( CUVariables.Debug ) print( "\nTEST 6: no startTime and 2 values per response\n" );
    haparams.HistoryReadDetails.NumValuesPerNode = 2;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( Assert.Equal( 2, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[1].StatusCode.isGood(), "OperationResults[1] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haItems[0].RawValues[DATESKIP-1].SourceTimestamp, haItems[0].Value[1].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint received by mistake.", "Correct, ContinuationPoint not received." ) ) result = false;
        }
        else result = false;
    } 
    else result = false;
    CUVariables.ResetItems();


    // TEST 7: start/end times are valid, but dates are reversed and NumValuesPerNode is 1
    if( CUVariables.Debug ) print( "\nTEST 7: valid timestamps, in reverse, and 1 value per response\n" );
    haparams.HistoryReadDetails.NumValuesPerNode = 1;
    haparams.HistoryReadDetails.StartTime = haItems[0].RawValues[DATESKIP].SourceTimestamp;
    haparams.HistoryReadDetails.EndTime = haItems[0].RawValues[0].SourceTimestamp;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint expected, but not received.", "Correct, ContinuationPoint received." ) ) result = false;
    } 
    else result = false;
    CUVariables.ResetItems();


    // TEST 8: same as before, NumValuesPerNode is 2
    if( CUVariables.Debug ) print( "\nTEST 8: valid timestamps, in reverse, and 2 values per response\n" );
    haparams.HistoryReadDetails.NumValuesPerNode = 2;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( Assert.Equal( 2, haItems[0].Value.length, "Wrong # of records returned.", "Correct # of records returned." ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.True( HistoryReadHelper.Response.Results[1].StatusCode.isGood(), "OperationResults[1] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
            if( !Assert.Equal( haItems[0].RawValues[DATESKIP-1].SourceTimestamp, haItems[0].Value[1].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint expected, but not received.", "Correct, ContinuationPoint received." ) ) result = false;
        }
        else result = false;
    } 
    else result = false;


    return( result );
}// function readraw014

Test.Execute( { Procedure: readraw014 } );