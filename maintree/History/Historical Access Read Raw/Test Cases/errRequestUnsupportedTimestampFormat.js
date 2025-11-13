/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request timestamp that is not supported on a node */
    
function readrawErr016() {
    var item = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/HA Profile/NodeDoesNotSupportServerTimestamp" );
    if( !isDefined( item ) ) { addSkipped( "No item to test with. Check setting '/Server Test/NodeIds/Static/HA Profile/NodeDoesNotSupportServerTimestamp'." ); return( true ); };
    var haparams = { 
          NodesToRead: item,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: CUVariables.Items[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: CUVariables.Items[0].LastValueInHistory.SourceTimestamp, 
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Server,
          ReleaseContinuationPoints: false,
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadTimestampNotSupported ),
          Debug: CUVariables.Debug };

    var result = Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() success expected." );

    return( result );
}// function readraw016

Test.Execute( { Procedure: readrawErr016 } );