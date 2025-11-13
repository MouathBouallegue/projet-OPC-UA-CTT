/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Bounds are received even when they do not exist. */

function readraw015() {
    // define our "invalid" start/end bounds and put them close to timestamps that actually exist
    var endBoundValid   = CUVariables.Items[0].RawValues[1].SourceTimestamp.clone();
    
    var beforeHistory = OPCF.HA.Analysis.Date.GenerateNew( { 
                             StartDate:  CUVariables.Items[0].RawValues.FirstRecord().SourceTimestamp,
                             RawData:    CUVariables.Items[0].RawValues,
                             OffsetHours: -24 } );
    
    var haparams = { 
          NodesToRead: CUVariables.Items[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: beforeHistory,
                                    EndTime: endBoundValid, 
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // TEST 1 :start bound is before history, end bound is valid, request bounds
    if( CUVariables.Debug ) print( "\nTEST ONE: startBound before history; endBound in history.\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #1 success expected." ) ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results.length, "Wrong # of results returned.", "Correct # of results returned." ) ) result = false;
        else {
            // first record should be the startTime with StatusCode Bad_BoundNotFound
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, CUVariables.Items[0].FirstRecord().SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBoundNotFound ), CUVariables.Items[0].FirstRecord().StatusCode, "Wrong Results[0].StatusCode.", "Correct Results[0].StatusCode." ) ) result = false;
            // subsequent tests on remaining records 
            for( var i=0; i<CUVariables.Items[0].Value.length-1; i++ ) if( !Assert.Equal( CUVariables.Items[0].RawValues[i].SourceTimestamp, CUVariables.Items[0].Value[i+1].SourceTimestamp, "Wrong, Results[0].HistoryData[" + i + "] StatusCode.", "Correct StatusCode in Results[0].HistoryData[" + i + "]." ) ) result = false;
        }
    }
    else result = false;
    CUVariables.ResetItems();

    // TEST 2 :start bound is in history, end bound is in future, request bounds
    if( CUVariables.Debug ) print( "\nTEST TWO: startBound in history; endBound in future.\n" );
    haparams.HistoryReadDetails.StartTime = OPCF.HA.Analysis.Find.Date.Previous( { 
                                                             StartDate:  CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                                             RawData:    CUVariables.Items[0].RawValues } ).SourceTimestamp;
    haparams.HistoryReadDetails.EndTime = OPCF.HA.Analysis.Date.GenerateNew( { 
                                                             StartDate:  CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                                             RawData:    CUVariables.Items[0].RawValues,
                                                             OffsetHours: 24 } );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #2 success expected." ) ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.NotEqual( 0, HistoryReadHelper.Response.Results.length, "Wrong # of results returned.", "Correct # of results returned." ) ) result = false;
        else {
            // last record should be the endTime with StatusCode Bad_BoundNotFound
            if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, CUVariables.Items[0].LastRecord().SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBoundNotFound ), CUVariables.Items[0].LastRecord().StatusCode, "Wrong Results[0].StatusCode.", "Correct Results[0].StatusCode." ) ) result = false;
            // subsequent tests on remaining records 
            var rawDataLen = CUVariables.Items[0].RawValues.length;
            for( var i=0; i<2; i++ ) if( !Assert.Equal( CUVariables.Items[0].RawValues[rawDataLen-2+i].SourceTimestamp, CUVariables.Items[0].Value[i].SourceTimestamp, "Wrong, Results[0].HistoryData[" + i + "] StatusCode.", "Correct StatusCode in Results[0].HistoryData[" + i + "]." ) ) result = false;
        }
    }

    return( result );
}// function readraw015

Test.Execute( { Procedure: readraw015 } );