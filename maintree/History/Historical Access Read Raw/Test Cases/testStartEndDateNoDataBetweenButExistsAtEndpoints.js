/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify Start and End dates where there is no data between the start and end timestamps in the history database; but data exists for either the Start or End date. Verify the timestamp ordering and bounds requested. */

function readraw007() {
    var result = true;
    // first, we need some dates where we KNOW that there's no history between them.
    var startTime = CUVariables.Items[0].FirstValueInHistory.SourceTimestamp.clone();
    var endTime   = OPCF.HA.Analysis.Date.GenerateNew( { RawData: CUVariables.Items[0].RawValues,
                                                         StartDate: CUVariables.Items[0].RawValues[1].SourceTimestamp,
                                                         OffsetMSEC: -105 } );

    // TEST 1: start=good; end=valid but no data; expects start-time
    var haparams = { 
          NodesToRead: CUVariables.Items[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: startTime,
                                    EndTime: endTime,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };
    if( CUVariables.Debug ) print( "\nTEST 1\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] success expected." ) ) {
        if( !Assert.Equal( 1, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( startTime, CUVariables.Items[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 1
    else result = false;
    CUVariables.ResetItems();


    // TEST 2: repeat test #1 but while requesting bounds; expect timestamp1 is the start-bound
    if( CUVariables.Debug ) print( "\nTEST 2\n" );
    haparams.HistoryReadDetails.ReturnBounds = true;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] success expected." ) ) {
        if( !Assert.Equal( 2, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, CUVariables.Items[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.Equal( CUVariables.Items[0].RawValues[1].SourceTimestamp, CUVariables.Items[0].Value[1].SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 2
    else result = false;
    CUVariables.ResetItems();


    // TEST 3: repeat test #1 but switch the dates; expect no data.
    if( CUVariables.Debug ) print( "\nTEST 3\n" );
    var tmp = haparams.HistoryReadDetails.StartTime.clone();
    haparams.HistoryReadDetails.StartTime = haparams.HistoryReadDetails.EndTime.clone();
    haparams.HistoryReadDetails.EndTime = tmp;
    haparams.HistoryReadDetails.ReturnBounds = false;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] success expected." ) ) {
        if( !Assert.Equal( 0, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.GoodNoData ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 3
    else result = false;
    CUVariables.ResetItems();


    // TEST 4: repeat test #3 but request bounds; expect timestamp1 is the end-bound.
    if( CUVariables.Debug ) print( "\nTEST 4\n" );
    haparams.HistoryReadDetails.ReturnBounds = true;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #4] success expected." ) ) {
        if( !Assert.Equal( 2, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, CUVariables.Items[0].LastRecord().SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.Equal( CUVariables.Items[0].RawValues[1].SourceTimestamp, CUVariables.Items[0].FirstRecord().SourceTimestamp, "Wrong record received." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 4
    else result = false;
    CUVariables.ResetItems();


    // TEST 5: startTime=valid/no data; endTime=valid/has data; no bounds. Expects 0 data returned.
    if( CUVariables.Debug ) print( "\nTEST 5\n" );
    haparams.HistoryReadDetails.StartTime = OPCF.HA.Analysis.Date.GenerateNew( { RawData: CUVariables.Items[0].RawValues,
                                                     StartDate: CUVariables.Items[0].RawValues[0].SourceTimestamp,
                                                     OffsetMSEC: +105 } );
    haparams.HistoryReadDetails.EndTime = OPCF.HA.Analysis.Find.Date.Next( { StartDate: CUVariables.Items[0].RawValues[0].SourceTimestamp, RawData: CUVariables.Items[0].RawValues } ).SourceTimestamp;
    haparams.HistoryReadDetails.ReturnBounds = false;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #5] success expected." ) ) {
        if( !Assert.Equal( 0, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.GoodNoData ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 5
    else result = false;
    CUVariables.ResetItems();


    // TEST 6: repeat test #5 but request bounds. Expect timestampX is the end-bound.
    if( CUVariables.Debug ) print( "\nTEST 6\n" );
    haparams.HistoryReadDetails.ReturnBounds = true;
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #6] success expected." ) ) {
        if( !Assert.Equal( 2, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( haparams.HistoryReadDetails.EndTime, CUVariables.Items[0].LastRecord().SourceTimestamp, "Wrong record received.", "Correct timestamp received." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
    }// test 6
    else result = false;
    CUVariables.ResetItems();


    return( result );
}// function readraw007()

Test.Execute( { Procedure: readraw007 } );