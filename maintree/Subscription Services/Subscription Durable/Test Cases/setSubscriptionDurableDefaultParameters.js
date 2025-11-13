/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Invoke SetSubscriptionDurable and set default values for all parameters. Default LifetimeInHours = 5.
    Expectation: Success.
*/

function subscriptionDurable001() {
    var result = true;
    // we need a subscription to continue
    var subscription001 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription001 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription001.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( !CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) result = false;
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription001 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable001 } );