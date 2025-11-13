/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Empty ReadRawModifiedDetails structure; expect BadHistoryOperationInvalid, or BadInvalidTimestampArgument. */

function readrawErr006() {
	notImplemented("This test case has been obsoleted.");
	return (true);
    /*var result = true;

    var haparams = {
          NodesToRead: CUVariables.Items[0],
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: new UaDateTime(),
                                    EndTime: new UaDateTime(),
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          Debug: CUVariables.Debug,
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
          OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.BadHistoryOperationInvalid, StatusCode.BadInvalidTimestampArgument ] ) ]};

    // issue the call and return the result
    return( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] ServiceResult 'Good' expected; error codes expected at the operation level." ) );*/
}// function readrawErr006()

Test.Execute( { Procedure: readrawErr006 } );