/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a durable subscription with 0 monitored items. Invoke the method again using different parameter values.
    Expectation: All calls are successful.
*/

function subscriptionDurable010() {
    var result = true;
    // we need a subscription to continue
    var subscription010 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription010 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription010.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // Step 2:
            UaDateTime.CountDown( { Msecs: 1000, Message: "Small delay between the calls." } );
            UaVariant.Increment( { Value: lifeTimeInHours } );
            if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription010 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable010 } );