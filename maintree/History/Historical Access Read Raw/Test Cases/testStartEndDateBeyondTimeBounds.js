/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify Start and End dates where one or both dates go beyond the time-bounds of the data in the history database. */

function readraw005() { 
    var startTime = CUVariables.Items[0].FirstValueInHistory.SourceTimestamp.clone();
    startTime.addHours( -1 );
    var endTime = CUVariables.Items[0].FirstValueInHistory.SourceTimestamp.clone();
    endTime.addHours( 1 );

    var haparams = { 
          NodesToRead: CUVariables.Items[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: startTime,
                                    EndTime: endTime,
                                    NumValuesPerNode: 10, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true; // we assume the test will pass, all other logic below will reverse that if applicable

    // TEST ONE: initially, set the start/end times to be -1 to +1 hours at the start of history
    if( CUVariables.Debug ) print( "\nTEST 1\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] success expected." ) ) {
        // The first 10-records in History are received, or less if fewer records exist
        var numExpectedValues = OPCF.HA.Analysis.Find.Date.Range( { RawData: CUVariables.Items[0].RawValues, StartTime: startTime, EndTime: endTime } ).length;
        numExpectedValues = numExpectedValues < 10 ? numExpectedValues : 10;
        if( Assert.Equal( numExpectedValues, CUVariables.Items[0].Value.length, "Response did not return expected number of values.", numExpectedValues + " values received, as expected." ) ) {
            if( !Assert.Equal( CUVariables.Items[0].FirstValueInHistory.SourceTimestamp, CUVariables.Items[0].Value[0].SourceTimestamp, "First record's timestamp '" + CUVariables.Items[0].Value[0].SourceTimestamp + "' does not match the requested StartDate '" + haparams.HistoryReadDetails.StartTime + "'.", "First record's timestamp '" + CUVariables.Items[0].Value[0].SourceTimestamp + "' matches the requested StartTime: " + haparams.HistoryReadDetails.StartTime ) ) result = false;
            if( !OPCF.HA.Analysis.Date.FlowsForward( { RawData: CUVariables.Items[0].Value } ) ) result = false;
        }
        else result = false;
    }// test 1
    else result = false;
    CUVariables.ResetItems();


    // TEST TWO: time-range before history
    if( CUVariables.Debug ) print( "\nTEST 2\n" );
    haparams.HistoryReadDetails.StartTime.addHours( -2 );
    haparams.HistoryReadDetails.EndTime = haparams.HistoryReadDetails.StartTime.clone();
    haparams.HistoryReadDetails.EndTime.addHours( 1 );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] success expected." ) ) {
        if( !Assert.Equal( 0, CUVariables.Items[0].Value.length, "No items expected.", "No items, as expected." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.GoodNoData ), HistoryReadHelper.Response.Results[0].StatusCode, "GoodNoData expected.", "GoodNoData, as expected." ) ) result = false;
    }// test 2
    else result = false;
    CUVariables.ResetItems();


    // TEST THREE: start=2h before history; end=null; #items=10.
    if( CUVariables.Debug ) print( "\nTEST 3\n" );
    haparams.HistoryReadDetails.EndTime = new UaDateTime();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] success expected." ) ) {
        // expect 10 records or less if fewer record exist
        var numExpectedValues = CUVariables.Items[0].RawValues.length < 10 ? CUVariables.Items[0].RawValues.length : 10;
        if( !Assert.Equal( numExpectedValues, CUVariables.Items[0].Value.length, "Response did not return expected number of values.", numExpectedValues + " values received, as expected." ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "Good expected.", "Good, as expected." ) ) result = false;
        if( !OPCF.HA.Analysis.Date.FlowsForward( { RawData: CUVariables.Items[0].Value } ) ) result = false;
    }// test 3
    else result = false;
    CUVariables.ResetItems();
    

    // TEST FOUR: start=1h after oldest record; end=1h before history; #items=10
    if( CUVariables.Debug ) print( "\nTEST 4\n" );
    haparams.HistoryReadDetails.StartTime = CUVariables.Items[0].FirstValueInHistory.SourceTimestamp.clone();
    haparams.HistoryReadDetails.StartTime.addHours( 1 );
    haparams.HistoryReadDetails.EndTime = CUVariables.Items[0].FirstValueInHistory.SourceTimestamp.clone();
    haparams.HistoryReadDetails.EndTime.addHours( -1 );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #4] success expected." ) ) {
        // The 10 records in history are received, or less if fewer records exist
        var numExpectedValues = OPCF.HA.Analysis.Find.Date.Range( { RawData: CUVariables.Items[0].RawValues, StartTime: haparams.HistoryReadDetails.EndTime, EndTime: haparams.HistoryReadDetails.StartTime } ).length;
        numExpectedValues = numExpectedValues < 10 ? numExpectedValues : 10;
        if( !Assert.Equal( numExpectedValues, CUVariables.Items[0].Value.length, numExpectedValues + " items expected.", numExpectedValues + " items, as expected." ) ) result = false;
        if( !OPCF.HA.Analysis.Date.FlowsBackward( { RawData: CUVariables.Items[0].Value } ) ) result = false;
    }// test 4
    else result = false;
    CUVariables.ResetItems();
    
    
    // TEST FIVE: set the start/end times to be last record to +1 hours from now
    if( CUVariables.Debug ) print( "\nTEST 5\n" );
    haparams.HistoryReadDetails.StartTime = CUVariables.Items[0].LastValueInHistory.SourceTimestamp.clone();
    haparams.HistoryReadDetails.EndTime = UaDateTime.utcNow();
    haparams.HistoryReadDetails.EndTime.addHours( 1 );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #5] success expected." ) ) {
        // A maximum of 10 records are returned and their timestamps are from the time when the request was made until "now"
        if( !Assert.LessThan( 11, CUVariables.Items[0].Value.length, "Response did not return expected number of values.", "10 or less records received, as expected." ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, CUVariables.Items[0].FirstRecord().SourceTimestamp, "First record's timestamp '" + CUVariables.Items[0].FirstRecord().SourceTimestamp + "' does not match the requested StartTime '" + haparams.HistoryReadDetails.StartTime + "'.", "First record's timestamp '" + CUVariables.Items[0].FirstRecord().SourceTimestamp + "' matches the requested StartTime: " + haparams.HistoryReadDetails.StartTime ) ) result = false;
        var now_temp = UaDateTime.utcNow();
        if( !Assert.LessThan( now_temp, CUVariables.Items[0].LastRecord().SourceTimestamp, "Last record's timestamp '" + CUVariables.Items[0].LastRecord().SourceTimestamp + "' is not older than 'now' '" + now_temp + "'.", "Last record's timestamp '" + CUVariables.Items[0].LastRecord().SourceTimestamp + "' is older than 'now': " + now_temp + " as expected." ) ) result = false;
    }// test 5
    else result = false;
    CUVariables.ResetItems();
    
    
    // TEST SIX: start=1h after now; end=2h after now
    if( CUVariables.Debug ) print( "\nTEST 6\n" );
    haparams.HistoryReadDetails.StartTime = UaDateTime.utcNow();
    haparams.HistoryReadDetails.StartTime.addHours( 1 );
    haparams.HistoryReadDetails.EndTime = UaDateTime.utcNow();
    haparams.HistoryReadDetails.EndTime.addHours( 2 );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #6] success expected." ) ) {
        if( !Assert.Equal( 0, CUVariables.Items[0].Value.length, "No items expected.", "No items, as expected." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.GoodNoData ), HistoryReadHelper.Response.Results[0].StatusCode, "GoodNoData expected.", "GoodNoData, as expected." ) ) result = false;
    }// test 6
    else result = false;
    CUVariables.ResetItems();
    
    
    // TEST SEVEN: start=1h after now; end=null
    if( CUVariables.Debug ) print( "\nTEST 7\n" );
    haparams.HistoryReadDetails.EndTime = new UaDateTime();
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #7] success expected." ) ) {
        if( !Assert.Equal( 0, CUVariables.Items[0].Value.length, "No items expected.", "No items, as expected." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.GoodNoData ), HistoryReadHelper.Response.Results[0].StatusCode, "GoodNoData expected.", "GoodNoData, as expected." ) ) result = false;
    }// test 7
    else result = false;

    return( result ); // status of this test
}// readraw005()


Test.Execute( { Procedure: readraw005 } );