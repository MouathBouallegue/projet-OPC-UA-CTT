/*  Test prepared by compliance@opcfoundation.org
    Description: Request range that has known UNCERTAIN quality data */

function readraw018() {
    var uncertainQualityTimestamp;
    var haItem;
    // find an item with UNCERTAIN Quality data in the recordset
    for( var i=0; i<CUVariables.Items.length; i++ ) {
        uncertainQualityTimestamp = uncertainQualityTimestamp = OPCF.HA.Analysis.Find.Date.First( { Filter: "uncertain", RawData: CUVariables.Items[i].RawValues } ).SourceTimestamp;
        if( !uncertainQualityTimestamp.equals( new UaDateTime() ) ) { haItem = CUVariables.Items[i]; break; }
    }
    if( uncertainQualityTimestamp.equals( new UaDateTime() ) ) {
        addSkipped( "No UNCERTAIN Quality data detected in recordset (cached in CTT). Aborting test." );
        return( true );
    }

    var haparams = { 
          NodesToRead: haItem,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: OPCF.HA.Analysis.Find.Date.Previous( { 
                                                StartDate: uncertainQualityTimestamp,
                                                RawData: haItem.RawValues } ).SourceTimestamp,
                                    EndTime: OPCF.HA.Analysis.Find.Date.Next( { 
                                                StartDate: uncertainQualityTimestamp,
                                                RawData: haItem.RawValues } ).SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: true } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    if( CUVariables.Debug ) print( "\nTEST: request range having known UNCERTAIN quality data\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;

        // we expect 3 values: {startTime}, {uncertain value}, {endTime}
        if( !Assert.Equal( 3, haItem.Value.length, "Wrong # records returned.", "Correct # records returned." ) ) result = false;
        else {
            if( !Assert.Equal( haparams.HistoryReadDetails.StartTime, haItem.Value[0].SourceTimestamp, "Wrong record #1 timestamp.", "Correct record #1 timestamp." ) ) result = false;
            if( !Assert.Equal( uncertainQualityTimestamp,             haItem.Value[1].SourceTimestamp, "Wrong record #2 timestamp.", "Correct record #2 timestamp." ) ) result = false;
            if( !Assert.True ( haItem.Value[1].StatusCode.isUncertain(), "Not 'UNCERTAIN', record #2 StatusCode.", "Correct StatusCode (uncertain) record #2." ) ) result = false;
            if( !Assert.Equal( haparams.HistoryReadDetails.EndTime,   haItem.Value[2].SourceTimestamp, "Wrong record #3 timestamp.", "Correct record #3 timestamp." ) ) result = false;
        }

    } 
    else result = false;

    return( result );
}

Test.Execute( { Procedure: readraw018 } );