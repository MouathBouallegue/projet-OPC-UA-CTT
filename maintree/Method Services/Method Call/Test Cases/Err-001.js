/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Call while specifying an invalid Object nodeid. */

Test.Execute( { Procedure: test = function() {
    return( CallHelper.Execute( {
                OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                MethodsToCall:    [ { MethodId: UaNodeId.fromString( "ns=0;i=11489" ), // GetMonitoredItems
                                      ObjectId: UaNodeId.fromString( Settings.Advanced.NodeIds.Invalid.Invalid1 ) } ] } ) );
} } );