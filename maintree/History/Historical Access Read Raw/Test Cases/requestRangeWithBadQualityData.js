/*  Test prepared by compliance@opcfoundation.org
    Description: Request range that has known bad quality data */

function readraw017() {
    var badQualityTimestamp;
    var haItem;
    // find an item with BAD Quality data in the recordset
    for( var i=0; i<CUVariables.Items.length; i++ ) {
        badQualityTimestamp = OPCF.HA.Analysis.Find.Date.First( { Filter: "bad", RawData: CUVariables.Items[i].RawValues } ).SourceTimestamp;
        if( !badQualityTimestamp.equals( new UaDateTime() ) ) { haItem = CUVariables.Items[i]; break; }
    }
    if( badQualityTimestamp.equals( new UaDateTime() ) ) {
        addSkipped( "No BAD Quality data detected in recordset (cached in CTT). Aborting test." );
        return( true );
    }

    var haparams = { 
          NodesToRead: haItem,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: OPCF.HA.Analysis.Find.Date.Previous( { 
                                                StartDate: badQualityTimestamp,
                                                RawData: haItem.RawValues } ).SourceTimestamp,
                                    EndTime: OPCF.HA.Analysis.Find.Date.Next( { 
                                                StartDate: badQualityTimestamp,
                                                RawData: haItem.RawValues } ).SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    if( CUVariables.Debug ) print( "\nTEST: request range having known BAD quality data\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;

        // we expect 3 values: {startTime}, {bad value}, {endTime}
        if( !Assert.Equal( 3, haItem.Value.length, "Wrong # records returned.", "Correct # records returned." ) ) result = false;
        else {
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItem.Value[0].SourceTimestamp, "Wrong record #1 timestamp.", "Correct record #1 timestamp." ) ) result = false;
            if( !Assert.Equal( badQualityTimestamp,                   haItem.Value[1].SourceTimestamp, "Wrong record #2 timestamp.", "Correct record #2 timestamp." ) ) result = false;
            if( !Assert.True ( haItem.Value[1].StatusCode.isBad(), "Not 'BAD', record #2 StatusCode.", "Correct StatusCode (bad) record #2." ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.EndTime,   haItem.Value[2].SourceTimestamp, "Wrong record #3 timestamp.", "Correct record #3 timestamp." ) ) result = false;
        }

    } 
    else result = false;

    return( result );
}

Test.Execute( { Procedure: readraw017 } );