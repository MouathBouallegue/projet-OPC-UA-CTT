/*  Test prepared by compliance@opcfoundation.org
    Description: Request an IndexRange for a node that is not of type Array. */

function readrawErr023() { 
	notImplemented("This test case has been obsoleted.");
	return (true);
    
    /*var result = true;
    var indexRanges = [ "1:3", "2:3", "5:7", "3:4" ];
    var haparams = {
          NodesToRead: CUVariables.Items[0],
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.Items[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          Debug: CUVariables.Debug,
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
          OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.BadIndexRangeNoData, StatusCode.BadIndexRangeInvalid ] ) ] };

    for( var i=0; i<indexRanges.length; i++ ) {
        CUVariables.Items[0].IndexRange = indexRanges[i];
        if( CUVariables.Debug ) print( "\nIndexRange: '" + indexRanges[i] + "'" );
        // issue the call and check the result
        if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #"+ (1+i) + "] ServiceResult 'Good' expected; error codes expected at the operation level." ) ) result = false;
    }// for i...

    // clean-up and exit
    CUVariables.Items[0].IndexRange = "";
    return( result );*/
}// function readrawErr009()

Test.Execute( { Procedure: readrawErr023 } );