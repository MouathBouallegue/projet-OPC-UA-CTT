/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Start/End times do not contain history. Vary the ordering. */

function readraw003() {
    // items with at least 10 records are needed. Search all configured items
    // that have >= 10 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( 10 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (at least 10 records)" ); return( false ); }
    
    // set the start time to a record before the 10th; end time based on 10th record, but gently increased
    var startTime = haItems[0].FirstValueInHistory.SourceTimestamp.clone();
    var endTime = haItems[0].RawValues[9].SourceTimestamp.clone();
    endTime.addMilliSeconds( 3 );

    var haparams = { 
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: startTime,
                                    EndTime: endTime,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // TEST ONE: start=valid; end=invalid.
    if( CUVariables.Debug ) print( "\n\nTEST 1\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] success expected." ) ) {
        Assert.Equal( haparams.HistoryReadDetails.StartTime, haItems[0].Value[0].SourceTimestamp, "First record received expected to be the StartTime.", "First record received is the StartTime, as expected." );
        Assert.Equal( haItems[0].RawValues[9].SourceTimestamp, haItems[0].LastRecord().SourceTimestamp, "Last record received expected to be the last record before the EndTime.", "Last record received is the last record before the EndTime, as expected." );
    }// test 1
    else result = false;
    CUVariables.ResetItems();


    // TEST TWO: start=invalid; end=valid.
    if( CUVariables.Debug ) print( "\n\nTEST 2\n" );
    startTime = haItems[0].FirstValueInHistory.SourceTimestamp.clone();
    startTime.addMilliSeconds( -3 );
    haparams.HistoryReadDetails.StartTime = startTime;
    haparams.HistoryReadDetails.EndTime = OPCF.HA.Analysis.Find.Date.Next( { Skip: 2, RawData: haItems[0].RawValues } ).SourceTimestamp;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] success expected." ) ) {
        if( !Assert.Equal( haItems[0].FirstValueInHistory.SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "SourceTimestamp expected to be the first in history.", "First SourceTimestamp in history received as expected." ) ) result = false;
        if( !Assert.Equal( OPCF.HA.Analysis.Find.Date.Previous( { RawData: haItems[0].RawValues, StartDate: haparams.HistoryReadDetails.EndTime } ).SourceTimestamp , haItems[0].LastRecord().SourceTimestamp, "SourceTimestamp of the last record received expected to be the last valid timestamp before the EndTime.", "SourceTimestamp of the last record received is the last valid timestamp before the EndTime, as expected." ) ) result = false;
    }// test 2
    else result = false;
    CUVariables.ResetItems();


    // TEST THREE: start=invalid; end=invalid
    if( CUVariables.Debug ) print( "\n\nTEST 3\n" );
    haparams.HistoryReadDetails.StartTime = OPCF.HA.Analysis.Date.GenerateNew( { StartDate: haItems[0].FirstValueInHistory.SourceTimestamp, RawData: haItems[0].RawValues, OffsetMSEC: -3 } );
    haparams.HistoryReadDetails.EndTime   = OPCF.HA.Analysis.Date.GenerateNew( { StartDate: haItems[0].RawValues[9].SourceTimestamp, RawData: haItems[0].RawValues, OffsetMSEC: 3 } );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] success expected." ) ) {
        if( !Assert.Equal( haItems[0].FirstValueInHistory.SourceTimestamp , haItems[0].FirstRecord().SourceTimestamp, "SourceTimestamp of the first record received expected to be the first valid timestamp after the StartTime.", "SourceTimestamp of the first record received is the first valid timestamp after the StartTime, as expected." ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[9].SourceTimestamp , haItems[0].LastRecord().SourceTimestamp, "SourceTimestamp of the last record received expected to be the last valid timestamp before the EndTime.", "SourceTimestamp of the last record received is the last valid timestamp before the EndTime, as expected." ) ) result = false;
    }// test 3
    else result = false;

    return( result );
}

Test.Execute( { Procedure: readraw003 } );