/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Invoke SetSubscriptionDurable while specifying three UINT parameters.
    Expectation: Service result: good; operation result: badTooManyArguments.
*/

function subscriptionDurableErr003() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr003 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr003 } ) ) return ( false );

    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr003.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    var thirdArgument = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );

    // call the method
    if ( !CallHelper.Execute( {
        MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours, thirdArgument] }],
        OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadTooManyArguments )]
    } ) ) result = false;

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr003 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr003 } );