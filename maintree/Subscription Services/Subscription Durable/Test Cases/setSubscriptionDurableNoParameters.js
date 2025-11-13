/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Invoke SetSubscriptionDurable without specifying any parameters.
    Expectation: Service result: good; operation result: badArgumentsMissing.
*/

function subscriptionDurableErr001() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr001 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr001 } ) ) return ( false );

    // call the method
    if( !CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId }], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadArgumentsMissing)] } ) ) result = false;

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr001 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr001 } );