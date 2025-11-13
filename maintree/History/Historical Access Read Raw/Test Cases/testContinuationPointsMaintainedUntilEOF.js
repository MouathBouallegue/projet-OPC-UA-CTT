/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Test the continuation points are maintained
    See spec: 11 -> 6.4.3.2 Para 3 Sen 3, 4. */

function readraw008() {
    var result = true;

    var haparams = { 
          ClearServerContinuationPoints: false,
          NodesToRead: CUVariables.Items[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.Items[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 1, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    // we have a set of data cached; now read through our database one record at a time forcing the use
    // of a continuation point. We will automate this via a loop, which will iterate one-less than it should
    // as the last iteration requires different analysis and verification.
    var testLength = CUVariables.Items[0].RawValues.length;
    for( var i=0; i<testLength-2; i++ ) {
        if( CUVariables.Debug ) print( "\nTEST " + (i+1) + " of " + (testLength-1) + "\n" );
        if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #" + (i+1) + "] success expected." ) ) {
            if( !Assert.Equal( 1, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
            if( !Assert.Equal( CUVariables.Items[0].RawValues[i].SourceTimestamp, CUVariables.Items[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
            if( !Assert.NotEqual(0,  HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint not received.", "Correct, ContinuationPoint received." ) ) result = false;
        }// test 1
        else result = false;
    }//for i...


    // Last read, to close-out the read; not expecting a CP.
    if( CUVariables.Debug ) print( "\nTEST " + (testLength-1) + " of " + (testLength-1) + "\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #" + CUVariables.Items[0].RawValues.length + "] success expected." ) ) {
        if( !Assert.Equal( 1, CUVariables.Items[0].Value.length, "Wrong # of records returned.", "Correct # records returned." ) ) result = false;
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
        if( !Assert.Equal(0,  HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "ContinuationPoint received.", "Correct, ContinuationPoint not received." ) ) result = false;
    }// test 1
    else result = false;


    return( result );
}// function readraw008()

Test.Execute( { Procedure: readraw008 } );