/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a subscription and add one or more monitored items to it. Then invoke SetSubscriptionDurable on the subscription.
    Expectation: Service result good; operation result: badInvalidState
*/

function subscriptionDurableErr005() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr005 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr005 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr005.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
    if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
        var systemTime = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ) );
        if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: systemTime, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscriptionErr005 } ) ) {
            UaVariant.Increment( { Value: lifeTimeInHours } );
            CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadInvalidState )] } );
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr005 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr005 } );