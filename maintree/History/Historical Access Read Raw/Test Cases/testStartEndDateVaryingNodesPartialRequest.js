/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Vary the 'start' and 'end' dates and ordering within the request. */

function readraw002() {
    // test-case needs at least 12 records. Search all configured items
    // that have >= 12 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( 12 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (>11 records)" ); return( false ); }
    
    // there are multiple tests to conduct
    // TEST ONE: single date expects one record to be returned
    if( CUVariables.Debug ) print( "\n\nTEST 1\n" );
    var result = true;
    var haparams = { 
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: haItems[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: haItems[0].FirstValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0,
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #1 success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Item.Values.length=" + haItems[0].Value.length + " (NodeId: " + haItems[0].NodeId + ") should have returned ONE record at timestamp: " + haparams.HistoryReadDetails.StartTime + "\nUA Part 11 section 6.4.3.2 Paragraph 3, Sentence 1 states 'It is specifically allowed for the StartTime and the EndTime to be identical. This allows the Client to request just one value.'" , "1 item received as expected." ) ) result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST TWO: time-range (forward) and data flows FORWARD
    if( CUVariables.Debug ) print( "\n\nTEST 2\n" );
    haparams.HistoryReadDetails.EndTime = haItems[0].LastValueInHistory.SourceTimestamp;
    haparams.HistoryReadDetails.NumValuesPerNode = 0;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #2 success expected." ) ) {
        if( OPCF.HA.Analysis.Date.FlowsForward( { RawData: haItems[0].Value } ) ) print( "Data flows forwards!" );
        else result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST THREE: time-range (reverse) and data flows BACKWARDS
    if( CUVariables.Debug ) print( "\n\nTEST 3\n" );
    var tmpStartTime = haparams.HistoryReadDetails.EndTime;
    haparams.HistoryReadDetails.EndTime = haparams.HistoryReadDetails.StartTime;
    haparams.HistoryReadDetails.StartTime = tmpStartTime;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #3 success expected." ) ) {
        if( OPCF.HA.Analysis.Date.FlowsBackward( { RawData: haItems[0].Value } ) ) print( "Data flows backwards!" );
        else result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST FOUR: single timestamp again, but this time somewhere in the middle of the recordset
    if( CUVariables.Debug ) print( "\n\nTEST 4\n" );
    haparams.HistoryReadDetails.StartTime = OPCF.HA.Analysis.Find.Date.Next( { RawData: haItems[0].Value, Skip: 5 } ).SourceTimestamp;
    haparams.HistoryReadDetails.EndTime = haparams.HistoryReadDetails.StartTime;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #4 success expected." ) ) {
        if( !Assert.Equal( 1, haItems[0].Value.length, "Item.Values.length=" + haItems[0].Value.length + " (NodeId: " + haItems[0].NodeId + ") should have returned ONE record at timestamp: " + haparams.HistoryReadDetails.StartTime + "\nUA Part 11 section 6.4.3.2 Paragraph 3, Sentence 1 states 'It is specifically allowed for the StartTime and the EndTime to be identical. This allows the Client to request just one value.'", "1 record received, as expected." ) ) result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST FIVE: date-range which to return a ContinuationPoint 
    if( CUVariables.Debug ) print( "\n\nTEST 5\n" );
    haparams.HistoryReadDetails.StartTime = haItems[0].FirstValueInHistory.SourceTimestamp;
    haparams.HistoryReadDetails.EndTime = haItems[0].LastValueInHistory.SourceTimestamp;
    haparams.HistoryReadDetails.NumValuesPerNode = 10;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #5 success expected." ) ) {
        if( !Assert.Equal( 10, haItems[0].Value.length, "Item.Values.length=" + haItems[0].Value.length + " (NodeId: " + haItems[0].NodeId + ") should have returned 10 records.'", "10 records received, as expected." ) ) result = false;
        if( OPCF.HA.Analysis.Date.FlowsForward( { RawData: haItems[0].Value } ) ) print( "Data flows forwards!" );
        else result = false;
        if( !Assert.GreaterThan( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint expected (test #5).", "ContinuationPoint received '" + HistoryReadHelper.Response.Results[0].ContinuationPoint + "'." ) ) result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST SIX: do not specify endDate, numValues=10, expect data flows FORWARDS
    if( CUVariables.Debug ) print( "\n\nTEST 6\n" );
    haparams.HistoryReadDetails.StartTime = haItems[0].FirstValueInHistory.SourceTimestamp;
    haparams.HistoryReadDetails.EndTime = new UaDateTime();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #6 success expected." ) ) {
        if( OPCF.HA.Analysis.Date.FlowsForward( { RawData: haItems[0].Value } ) ) print( "Data flows forwards!" );
        else result = false;
        if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint not expected (test #6).", "ContinuationPoint not received (test #6)." ) ) result = false;
    }
    else result = false;
    CUVariables.ResetItems();


    // LAST TEST: reverse the data order used previously; data flows BACKWARDS
    if( CUVariables.Debug ) print( "\n\nTEST 7\n" );
    haparams.HistoryReadDetails.StartTime = new UaDateTime();
    haparams.HistoryReadDetails.EndTime = haItems[0].LastValueInHistory.SourceTimestamp;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() #7 success expected." ) ) {
        if( OPCF.HA.Analysis.Date.FlowsBackward( { RawData: haItems[0].Value } ) ) print( "Data flows backwards!" );
        else result = false;
        if( !Assert.Equal( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint not expected (test #7).", "ContinuationPoint not received (test #7)." ) ) result = false;
    }
    else result = false;

    return( result );
}

Test.Execute( { Procedure: readraw002 } );