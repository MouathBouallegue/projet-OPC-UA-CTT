/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Specify a lifetimeInHours that is the max size of a UInt32.
    Expectation: Success, the revisedLifetimeHours may be different. Issue a warning if the revised value is different from the request (not a failure!)
*/

function subscriptionDurable002() {
    var result = true;
    // we need a subscription to continue
    var subscription002 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription002 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription002.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: Constants.UInt32_Max } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // check the output
            if ( !Assert.Equal( 1, CallHelper.Response.Results[0].OutputArguments.length, "Expected 1 argument to be returned." ) ) result = false;
            else {
                if ( CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                    addError( "The returned argument is empty." ); // make sure a value exists
                    result = false;
                }
                else {
                    if ( lifeTimeInHours != CallHelper.Response.Results[0].OutputArguments[0].toUInt32() ) addWarning( "The value of the RevisedLifetimeInHours (" + CallHelper.Response.Results[0].OutputArguments[0] + ") defers from the requested LifetimeInHours (" + lifeTimeInHours + ")." );
                }
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription002 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable002 } );