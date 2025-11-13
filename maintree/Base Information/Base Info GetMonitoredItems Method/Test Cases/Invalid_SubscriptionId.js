/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org 
    Description: Call GetMonitoredItems specifying an invalid subscription id */

Test.Execute( { Procedure: test = function() {
    CallHelper.Execute( {
                ServiceResult:    new ExpectedAndAcceptedResults( StatusCode.Good ),
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ],
                MethodsToCall:    [ { 
                    MethodId: gmiNodeId, 
                    ObjectId: gmiObject,
                    InputArguments: UaVariant.New( { Value: 0x1234, Type: BuiltInType.UInt32 } ) } ] } );

    return( true );
} } );