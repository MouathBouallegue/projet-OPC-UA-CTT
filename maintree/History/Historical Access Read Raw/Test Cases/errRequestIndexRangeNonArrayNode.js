/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request indexRange for non-array node. Expects 'BadIndexRangeNoData or BadIndexRangeInvalid'. */

function readrawErr009() {    
    var item;
    // find a node of a type other than ByteString and String
    for( var i=0; i< CUVariables.Items.length; i++ ) {
        if( UaNodeId.GuessType( CUVariables.Items[i].NodeSetting ) != BuiltInType.ByteString &&
            UaNodeId.GuessType( CUVariables.Items[i].NodeSetting ) != BuiltInType.String ) {
                item = CUVariables.Items[i];
                break;
            }
    }
    if( !isDefined( item ) ) {
        addSkipped( "No item of a type other than ByteString or String defined. Check Settings ('/Server Test/NodeIds/Static/HA Profile/Scalar')" );
        return( false );
    }
    
    var result = true;
    var indexRanges = [ "1:3", "1:10987", "1:3,6:10", "1" ];
    var haparams = {
          NodesToRead: item,
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: item.FirstValueInHistory.SourceTimestamp,
                                    EndTime: item.LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          Debug: CUVariables.Debug,
          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ),
          OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData ) ] };

    for( var i=0; i<indexRanges.length; i++ ) {
        item.IndexRange = indexRanges[i];
        if( CUVariables.Debug ) print( "\nIndexRange: '" + indexRanges[i] + "'" );
        // issue the call and check the result
        if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #"+ (1+i) + "] ServiceResult 'Good' expected; error codes expected at the operation level." ) ) result = false;
    }// for i...

    // clean-up and exit
    item.IndexRange = "";
    return( result );
}// function readrawErr009()

Test.Execute( { Procedure: readrawErr009 } );