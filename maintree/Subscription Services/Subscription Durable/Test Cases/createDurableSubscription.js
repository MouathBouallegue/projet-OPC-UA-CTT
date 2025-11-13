/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a durable subscription with 0 monitored items. Invoke the method again using different parameter values.
    Expectation: All calls are successful.
*/

function subscriptionDurable011() {
    var result = true;
    // we need a subscription to continue
    var subscription011 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription011 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription011.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
    if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
        var systemTime = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ) );
        if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: systemTime, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription011 } ) ) {
            UaVariant.Increment( { Value: lifeTimeInHours } );
            if ( !CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadInvalidState )] } ) ) result = false;
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: systemTime, SubscriptionId: subscription011 } );
            UaVariant.Increment( { Value: lifeTimeInHours } );
            if ( !CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) result = false;
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription011 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable011 } );