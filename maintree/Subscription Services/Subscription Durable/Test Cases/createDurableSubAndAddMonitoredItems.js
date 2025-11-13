/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a Durable subscription and then add 1 or more monitored items.
    Expectation: Success.
*/

function subscriptionDurable007() {
    var result = true;

    // we need a subscription to continue
    var subscription007 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription007 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription007.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // ready to add MonitoredItems to the durable subscription
            var maxMonitoredItems = ( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0 ? MAXMONITOREDITEMLIMITS : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
            var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems } );
            if ( isDefined( items ) && items.length > 0 ) {
                if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription007 } ) ) result = false;
            }
            else {
                addSkipped( "Not enough scalar items defined." );
                result = false;
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription007 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable007 } );