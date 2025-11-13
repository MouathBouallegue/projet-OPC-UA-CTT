/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Specify a lifetimeInHours that is zero.
    Expectation: Success, but the revisedLifetimeHours should be different, even if is just "1".
*/

function subscriptionDurable003() {
    var result = true;
    // we need a subscription to continue
    var subscription003 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription003 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription003.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: Constants.UInt32_Min } );
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
                    if ( !Assert.GreaterThan( 0, CallHelper.Response.Results[0].OutputArguments[0].toUInt32(), "The value of the RevisedLifetimeInHours (" + CallHelper.Response.Results[0].OutputArguments[0] + ") was expected to be greater than the requested LifetimeInHours (" + lifeTimeInHours + ")" ) ); result = false;
                }
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription003 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable003 } );