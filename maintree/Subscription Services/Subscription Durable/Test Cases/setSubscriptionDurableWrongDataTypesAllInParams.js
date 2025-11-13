/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Invoke SetSubscriptionDurable while specifying the right number of parametes, but wrong data-types; repeat for all [IN] parameters.
    Expectation: Service result: good; operation result: badTypeMismatch.
*/

function subscriptionDurableErr004() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr004 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr004 } ) ) return ( false );

    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr004.SubscriptionId } );
    var invalidSubscriptionId = UaVariant.New( { Type: BuiltInType.String, Value: subscriptionErr004.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    var invalidLifeTimeInHours = UaVariant.New( { Type: BuiltInType.String, Value: 1 } );

    // call the method
    if ( !CallHelper.Execute( {
        MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [invalidSubscriptionId, lifeTimeInHours] }],
        OperationResults: [new ExpectedAndAcceptedResults(StatusCode.BadInvalidArgument)],
        InputArgumentResults: [new ExpectedAndAcceptedResults(StatusCode.BadTypeMismatch)]
    } ) ) result = false;

    // call the method
    if ( !CallHelper.Execute( {
        MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, invalidLifeTimeInHours] }],
        OperationResults: [new ExpectedAndAcceptedResults(StatusCode.BadInvalidArgument)],
        InputArgumentResults: [new ExpectedAndAcceptedResults(StatusCode.BadTypeMismatch)]
    } ) ) result = false;

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr004 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr004 } );