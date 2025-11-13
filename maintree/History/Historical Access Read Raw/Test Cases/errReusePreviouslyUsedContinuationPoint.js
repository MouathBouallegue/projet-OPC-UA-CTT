/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: While iteratively reading through history and using ContinuationPoints successfully, use one that was previously used. */

function readrawErr013() {
    // items with at least 3 records are needed. Search all configured items
    // that have >= 3 historical records 
    var haItems = CUVariables.ItemsHistoryCountExceeds( 3 );
    if( haItems.length === 0 ) { addSkipped( "Not enough history. None of the configured historical items contain enough history (at least 3 records)" ); return( false ); }
    
    var result = true;
    
    var haparams = {
          ClearServerContinuationPoints: false,
          NodesToRead: haItems[0],
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: haItems[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: haItems[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 1, 
                                    ReturnBounds: false } ),
          Debug: CUVariables.Debug };

    // step 1, issue a read while requesting just one item back (force a CP) and then record it
    if( CUVariables.Debug ) print( "\nTEST ONE: Initial read...\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] ServiceResult 'Good' expected." ) ) {
        // data is recieved and is valid
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
    }
    else result = false;
    var firstCP = HistoryReadHelper.Response.Results[0].ContinuationPoint.clone();
    if( firstCP.length === 0 ) { addError( "No ContinuationPoint received. Aborting test." ); return( false ); }

    // step 2, invoke the next read and allow the CP to be used (we have a clone stored in our variable
    if( CUVariables.Debug ) print( "\nTEST TWO: Continued read... valid ContinuationPoint...\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] ServiceResult 'Good' expected." ) ) {
        // more data is recieved and is valid
        if( !Assert.Equal( 1, haItems[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.Equal( haItems[0].RawValues[1].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
    }
    else result = false;

    // step 3, use the CP from the first call. Expect BadContinuationPointInvalid
    if( CUVariables.Debug ) print( "\nTEST THREE: Continued read... invalid ContinuationPoint...\n" );
    haparams.NodesToRead[0].ContinuationPoint = firstCP.clone();
    haparams.OperationResults = new ExpectedAndAcceptedResults( StatusCode.BadContinuationPointInvalid );
    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] ServiceResult 'BadContinuationPointInvalid' expected." ) ) result = false;


    return( result );
}// function readrawErr013()

Test.Execute( { Procedure: readrawErr013 } );