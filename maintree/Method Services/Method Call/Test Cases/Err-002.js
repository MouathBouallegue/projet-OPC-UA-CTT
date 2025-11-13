/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Call while specifying an invalid Method nodeid. */

Test.Execute( { Procedure: test = function() {
    return( CallHelper.Execute( { 
                OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.BadMethodInvalid ] ) ],
                MethodsToCall:    [ { MethodId: UaNodeId.fromString( Settings.Advanced.NodeIds.Invalid.Invalid1 ),
                                      ObjectId: new UaNodeId( Identifier.Server ) } ] } ) );
} } );