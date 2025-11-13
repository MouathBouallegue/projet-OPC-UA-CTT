/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a subscription and add one or more monitored items to it. Then invoke SetSubscriptionDurable on the subscription.
    Expectation: Service result good; operation result: badInvalidState
*/

function subscriptionDurableErr007() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr007 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr007 } ) ) return ( false );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr007 } );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr007.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
    if ( !CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid )] } ) ) result = false;

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr007 } );