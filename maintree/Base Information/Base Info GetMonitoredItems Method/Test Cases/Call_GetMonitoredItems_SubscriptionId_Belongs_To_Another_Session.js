/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org 
    Description: Try to obtain information about a subscription belonging to a different session's subscription */

Test.Execute( { Procedure: test = function() {
    // create a second session
    var session2 = SessionCreator.Connect( { InstanciateHelpers: false } );
    if( !session2.result ) {
        SessionCreator.Disconnect( session2 );
        return ( false );
    }

    // create a subscription per session
    var sub1 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { SubscriptionId: sub1 } ) ) return( false );

    // now to try to query information about a subscription owned by a different session
    var CallHelper2 = new CallService( { Session: session2.session } );
    CallHelper2.Execute( {
                ServiceResult:    new ExpectedAndAcceptedResults( StatusCode.Good ),
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied ) ],
                MethodsToCall:    [ { 
                    MethodId: gmiNodeId, 
                    ObjectId: gmiObject,
                    InputArguments: UaVariant.New( { Value: sub1.SubscriptionId, Type: BuiltInType.UInt32 } ) } ] } );

    // clean-up
    DeleteSubscriptionsHelper.Execute( { SubscriptionId: sub1 } );
    SessionCreator.Disconnect( session2 );

    return( true );
} } );