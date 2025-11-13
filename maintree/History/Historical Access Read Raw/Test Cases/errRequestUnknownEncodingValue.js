/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request invalid dataEncoding. */

function readrawErr011() {
    var result = true;
    
    CUVariables.Items[0].DataEncoding = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidNodeId1" ).toString() );
    
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
          OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadDataEncodingInvalid ) ] };

    
    // TEST 1: Request an unknown encoding value for a node which is not a structure
    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1] ServiceResult 'Good' expected; error codes expected at the operation level." ) ) result = false;

    // TEST 2: Request an unknown encoding value for a structure node
    structureNodeItem = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/HA Profile/StructureNodeSupportingHistory" );
    if( !isDefined( structureNodeItem ) ) {
        addSkipped( "No structure node with history support configured. Check setting '/Server Test/NodeIds/Static/HA Profile/StructureNodeSupportingHistory'. Step 2 will be skipped." );
        result = false;
    }
    else {
        structureNodeItem.DataEncoding = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidNodeId1" ).toString() );
        haparams.NodesToRead = structureNodeItem;
        haparams.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadDataEncodingUnsupported ) ];
        if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2] ServiceResult 'Good' expected; error codes expected at the operation level." ) ) result = false;
        structureNodeItem.DataEncoding = "";
    }
    
    // TEST 3: Request an known encoding value for a node which is not a structure.
    CUVariables.Items[0].DataEncoding = UaQualifiedName.New( { NamespaceIndex: 0, Name: "Default Binary" } );
    haparams.NodesToRead = CUVariables.Items[0];
    haparams.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadDataEncodingInvalid ) ];
    if( !Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3] ServiceResult 'Good' expected; error codes expected at the operation level." ) ) result = false;
    
    // clean-up and exit
    CUVariables.Items[0].DataEncoding = "";
    return( result );
}// function readrawErr011()

Test.Execute( { Procedure: readrawErr011 } );