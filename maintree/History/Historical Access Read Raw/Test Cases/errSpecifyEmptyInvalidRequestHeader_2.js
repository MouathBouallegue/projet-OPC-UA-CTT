/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: HistoryRead with an empty request. */

function readrawErr026() {
    var result = true;
    
    var timestamp1 = UaDateTime.utcNow();
    var timestampX = timestamp1.clone();
    timestampX.addHours( 24 );

    var haparams = {
          PreHook: function( ) { HistoryReadHelper.Request.NodesToRead.length = 0; },
          NodesToRead: new MonitoredItem.fromNodeIds( new UaNodeId() )[0],
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: timestamp1,
                                    EndTime: timestampX,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo ),
          Debug: CUVariables.Debug };

    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() 'BadNothingToDo' expected." ) ) result = false;


    return( result );
}// function readrawErr026()

Test.Execute( { Procedure: readrawErr026 } );