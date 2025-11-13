/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Invoke SetSubscriptionDurable while specifying one of the two parameters.
    Expectation: Service result: good; operation result: badArgumentsMissing.
*/

function subscriptionDurableErr002() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr002 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr002 } ) ) return ( false );

    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr002.SubscriptionId } );
    // call the method
    if ( !CallHelper.Execute( {
        MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId] }],
        OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadArgumentsMissing )]
    } ) ) result = false;

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr002 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr002 } );