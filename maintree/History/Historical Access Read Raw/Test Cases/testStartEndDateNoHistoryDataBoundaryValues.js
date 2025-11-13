/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Vary the start/end times while requesting bounds */

function readraw004() {
    // items with more than 10 records are needed. Search all configured items
    // that have >= 12 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( 12 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (more than 11 records)" ); return( false ); }
    
    // calculated timestamps shall be based on the 10th record
    var timestamp1 = haItems[0].RawValues[1].SourceTimestamp.clone();
    var endTime = haItems[0].RawValues[10].SourceTimestamp.clone();
    
    var startInvalid = timestamp1.clone();
    startInvalid.addMilliSeconds( -3 );
    var endInvalid = endTime.clone();
    endInvalid.addMilliSeconds( 3 );
    
    var haparams = { 
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: timestamp1,
                                    EndTime: endInvalid,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // TEST ONE: start=valid; end=invalid.
    if( CUVariables.Debug ) print( "\nTEST 1\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] success expected." ) ) {
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "First record's timestamp '" + haItems[0].Value[0].SourceTimestamp + "' does not match the requested StartTime '" + haparams.HistoryReadDetails.StartTime + "'.", "First record's timestamp '" + haItems[0].Value[0].SourceTimestamp + "' matches the requested StartTime: " + haparams.HistoryReadDetails.StartTime ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[11].SourceTimestamp,
                      haItems[0].LastRecord().SourceTimestamp, 
                      "Last value's SourceTimestamp does not match expected result." ) ) result = false;
    }// test 1
    else result = false;
    CUVariables.ResetItems();


    // TEST TWO: start=invalid; end=valid.
    if( CUVariables.Debug ) print( "\nTEST 2\n" );
    haparams.HistoryReadDetails.StartTime = startInvalid.clone();
    haparams.HistoryReadDetails.EndTime = endTime.clone();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] success expected." ) ) {
        if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].FirstRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[0].SourceTimestamp mismatch. Expected one record before the StartTime.", "One record before the StartTime returned as expected" ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, haItems[0].LastRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[last].SourceTimestamp mismatch. Expected requested EndTime.", "Requested EndTime returned as expected" ) ) result = false;
    }// test 2
    else result = false;
    CUVariables.ResetItems();


    // TEST THREE: start=invalid; end=invalid
    if( CUVariables.Debug ) print( "\nTEST 3\n" );
    haparams.HistoryReadDetails.EndTime = endInvalid.clone();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] success expected." ) ) {
        if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].FirstRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[0].SourceTimestamp mismatch. Expected one record before the StartTime.", "One record before the StartTime returned as expected" ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[11].SourceTimestamp,
                      haItems[0].LastRecord().SourceTimestamp, 
                      "Last value's SourceTimestamp does not match expected result." ) ) result = false;
    }// test 3
    else result = false;
    
    
    // TEST FOUR: start=valid; end=invalid; but in reverse order
    if( CUVariables.Debug ) print( "\nTEST 4\n" );
    haparams.HistoryReadDetails.StartTime = endInvalid.clone();
    haparams.HistoryReadDetails.EndTime = timestamp1.clone();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #4] success expected." ) ) {
        if( !Assert.Equal( haItems[0].RawValues[11].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "First record's timestamp '" + haItems[0].Value[0].SourceTimestamp + "' does not match the requested StartTime '" + haparams.HistoryReadDetails.StartTime + "'.", "First record's timestamp '" + haItems[0].Value[0].SourceTimestamp + "' matches the requested StartTime: " + haparams.HistoryReadDetails.StartTime ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.EndTime,
                      haItems[0].LastRecord().SourceTimestamp, 
                      "Last value's SourceTimestamp does not match expected result." ) ) result = false;
        if( OPCF.HA.Analysis.Date.FlowsBackward( { RawData: haItems[0].Value } ) ) result = false;
    }// test 4
    else result = false;
    CUVariables.ResetItems();


    // TEST FIVE: start=invalid; end=valid; but in reverse order
    if( CUVariables.Debug ) print( "\nTEST 5\n" );
    haparams.HistoryReadDetails.StartTime = endTime.clone();
    haparams.HistoryReadDetails.EndTime = startInvalid.clone();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #5] success expected." ) ) {
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].FirstRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[0].SourceTimestamp mismatch. Expected one record before the StartTime.", "One record before the StartTime returned as expected" ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].LastRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[last].SourceTimestamp mismatch. Expected requested EndTime.", "Requested EndTime returned as expected" ) ) result = false;
        if( OPCF.HA.Analysis.Date.FlowsBackward( { RawData: haItems[0].Value } ) ) result = false;
    }// test 5
    else result = false;
    CUVariables.ResetItems();


    // TEST SIX: start=invalid; end=invalid; but in reverse order
    if( CUVariables.Debug ) print( "\nTEST 6\n" );
    haparams.HistoryReadDetails.StartTime = endInvalid.clone();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #6] success expected." ) ) {
        if( !Assert.Equal( haItems[0].RawValues[11].SourceTimestamp, haItems[0].FirstRecord().SourceTimestamp, "ReadHistory.Response.Results[0].HistoryData[0].SourceTimestamp mismatch. Expected one record before the StartTime.", "One record before the StartTime returned as expected" ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp,
                      haItems[0].LastRecord().SourceTimestamp, 
                      "Last value's SourceTimestamp does not match expected result." ) ) result = false;
        if( OPCF.HA.Analysis.Date.FlowsBackward( { RawData: haItems[0].Value } ) ) result = false;
    }// test 6
    else result = false;
    

    if( CUVariables.Debug ) print( "\n\nEND OF TEST\n" );
    return( result );
}

Test.Execute( { Procedure: readraw004 } );