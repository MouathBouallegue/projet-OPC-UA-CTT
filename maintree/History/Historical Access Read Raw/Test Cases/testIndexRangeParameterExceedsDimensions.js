/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request an indexRange that is out of bounds, on array-based nodes */

function readraw012() {
    var result = true;

    // can we do this test?
    if( CUVariables.ArrayItems === null || CUVariables.ArrayItems.length === 0 ) {
        addSkipped( "No historical items of type Array are configured in settings. Skipping test." );
        return( true );
    }

    var haparams = { 
          NodesToRead: CUVariables.ArrayItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.ArrayItems[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.ArrayItems[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };


    // identify the bounds of the array first
    if( !HistoryReadHelper.Execute( haparams ) ) return( false );
    var arrayBounds = CUVariables.ArrayItems[0].Value[0].Value.getArraySize();
    if( !Assert.GreaterThan( 0, arrayBounds, "Node not an array! Aborting test." ) ) return( false );

    // TEST 1: indexRange = "<too big>"
    CUVariables.ArrayItems[0].IndexRange = "" + ( arrayBounds + 10 );
    haparams.OperationResults = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData );
    if( CUVariables.Debug ) print( "\nTEST1 1: indexRange = \"" + CUVariables.ArrayItems[0].IndexRange + "\"\n" );
    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] success expected." ) ) result = false;
    CUVariables.ResetItems();
    
    // TEST 2: indexRange = "<equal to array length>"
    CUVariables.ArrayItems[0].IndexRange = "" + ( arrayBounds );
    haparams.OperationResults = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData );
    if( CUVariables.Debug ) print( "\nTEST2 1: indexRange = \"" + CUVariables.ArrayItems[0].IndexRange + "\"\n" );
    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] success expected." ) ) result = false;

    CUVariables.ArrayItems[0].IndexRange = "";
    return( result );
}// function readraw012

Test.Execute( { Procedure: readraw012 } );