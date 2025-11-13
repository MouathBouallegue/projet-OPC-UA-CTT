/*  Test prepared by compliance@opcfoundation.org
    Description: Request different timestamp combinations and check the server responds accordingly */

function readraw001() {
    var haparams = { 
          NodesToRead: CUVariables.Items[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.Items[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.Items[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 10, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };

    var result = true;

    // test SOURCE timestamp first
    if( CUVariables.Debug ) print( "\nTEST 1: Source timestamp\n" );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." ) ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( !Assert.True( HistoryReadHelper.Response.Results[0].StatusCode.isGood(), "OperationResults[0] is not Good! (TimestampsToReturn.Source)" ) ) result = false;
        if( HistoryReadHelper.Response.Results[0].StatusCode.isGood() ) {
            for( var i=0; i<CUVariables.Items[0].Value.length; i++ ) {
                if( !Assert.NotEqual( new UaDateTime(), CUVariables.Items[0].Value[i].SourceTimestamp, "HistoryRead.Response.Results[0].SourceTimestamp has to be provided when TimestampsToReturn=Source is requested." ) ) { result = false; break; }
                if( !Assert.Equal( new UaDateTime(), CUVariables.Items[0].Value[i].ServerTimestamp, "HistoryRead.Response.Results[0].ServerTimestamp should not be returned when TimestampsToReturn=Source is requested." ) ) { result = false; break; }
            }
            // Expect ContinuationPoint if more than 10 values exist between start and end
            var numExpectedValues = OPCF.HA.Analysis.Find.Date.Range( { RawData: CUVariables.Items[0].RawValues, StartTime: haparams.HistoryReadDetails.StartTime, EndTime: haparams.HistoryReadDetails.EndTime } ).length;
            if( numExpectedValues > 10 ) {
                if( !Assert.GreaterThan( 0, HistoryReadHelper.Response.Results[0].ContinuationPoint.length, "Step 1: ContinuationPoint expected.", "Step 1: ContinuationPoint received '" + HistoryReadHelper.Response.Results[0].ContinuationPoint + "'." ) ) result = false;
            }
        }
        CUVariables.ResetItems();
        
        // now test SERVER timestamp
        if( CUVariables.Debug ) print( "\nTEST 2: Server timestamp\n" );
        haparams.TimestampsToReturn = TimestampsToReturn.Server;
        if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected (TimestampsToReturn.Server)" ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadTimestampNotSupported ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Server)" ) ) result = false;
            if( !Assert.StatusCodeIsOneOf( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTimestampNotSupported ] ), 
                                             HistoryReadHelper.Response.Results[0].StatusCode, 
                                             "OperationResults[0] is not Good! (TimestampsToReturn.Server)" ) ) result = false;
            if( HistoryReadHelper.Response.Results[0].StatusCode.isGood() ) {
                for( var i=0; i<CUVariables.Items[0].Value.length; i++ ) {
                    if( !Assert.Equal( new UaDateTime(), CUVariables.Items[0].Value[i].SourceTimestamp, "HistoryRead.Response.Results[0].SourceTimestamp should not be returned when TimestampsToReturn=Server is requested." ) ) { result = false; break; }
                    if( !Assert.NotEqual( new UaDateTime(), CUVariables.Items[0].Value[i].ServerTimestamp, "HistoryRead.Response.Results[0].ServerTimestamp has to be provided when TimestampsToReturn=Server is requested." ) ) { result = false; break; }
                }
            }
        }
        else result = false;
        CUVariables.ResetItems();
        
        // now test BOTH timestamps
        if( CUVariables.Debug ) print( "\nTEST 3: Both timestamps\n" );
        haparams.TimestampsToReturn = TimestampsToReturn.Both;
        if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected (TimestampsToReturn.Both)" ) ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadTimestampNotSupported ), HistoryReadHelper.Response.ResponseHeader.ServiceResult, "Service Result not Good! (TimestampsToReturn.Both)" ) ) result = false;
            if( !Assert.StatusCodeIsOneOf( new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadTimestampNotSupported ), 
                                             HistoryReadHelper.Response.Results[0].StatusCode, 
                                             "OperationResults[0] is not Good! (TimestampsToReturn.Both)" ) ) result = false;
            if( HistoryReadHelper.Response.Results[0].StatusCode.isGood() ) {
                for( var i=0; i<CUVariables.Items[0].Value.length; i++ ) {
                    if( !Assert.NotEqual( new UaDateTime(), CUVariables.Items[0].Value[i].SourceTimestamp, "HistoryRead.Response.Results[0].SourceTimestamp has to be provided when TimestampsToReturn=Both is requested." ) ) { result = false; break; }
                    if( !Assert.NotEqual( new UaDateTime(), CUVariables.Items[0].Value[i].ServerTimestamp, "HistoryRead.Response.Results[0].ServerTimestamp has to be provided when TimestampsToReturn=Both is requested." ) ) { result = false; break; }
                }
            }
        }
        else result = false;
    } else result = false;

    return( result );
}

Test.Execute( { Procedure: readraw001 } );