/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a subscription with default parameter. Create an additional Session and try to modify the previous created subscription by specifying a longer PublishingInterval. Verify that the client is still receiving DataChangeNotifications within the original PublishingInterval.
    Expectation: SeviceResult: BadSubscriptionIdInvalid. The parameter of the Subscription did not change.
*/

function SubscriptionBasicErr031() {
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    var result = true;
    var subscription = new Subscription();

    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // call Publish(), as we want to consume the initial data values 
            PublishHelper.Execute();
            PublishHelper.SetItemValuesFromDataChange( [WritableDefaultStaticItem] );
            var waitTime = subscription.PublishingInterval;
            // now open the second session
            var newSession = SessionCreator.Connect();
            if( newSession.result ) {
                var newWaitTime;
                if( waitTime < 1000 ) newWaitTime = 1000;
                else newWaitTime = 2 * waitTime;
                subscription.SetParameters( newWaitTime, true, 30, 10, 0, 0 );
                if( !ModifySubscriptionHelper.Execute( { SubscriptionId: subscription, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) } ) ) result = false;
            }
            SessionCreator.Disconnect( newSession );
            InstanciateHelpers( { Session: Test.Session } );
            // write a value and receive the DataChangeNotification
            UaVariant.Increment( { Item: WritableDefaultStaticItem } );
            WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem, ReadVerification: false } );
            PublishHelper.WaitInterval( { Subscription: subscription } );
            PublishHelper.Execute();
            if( !Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification because we just wrote a value to the MonitoredItem." ) ) result = false;
            PublishHelper.SetItemValuesFromDataChange( [WritableDefaultStaticItem] );
            // second write to verify the next publish is received within the original PublihsingInterval
            UaVariant.Increment( { Item: WritableDefaultStaticItem } );
            WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem, ReadVerification: false } );
            UaDateTime.CountDown( { Msecs: waitTime, Message: "Small delay" } );
            PublishHelper.Execute();
            if( !Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification because we just wrote a value to the MonitoredItem." ) ) result = false;
            DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        }
        else {
            addError( "CreateMonitoredItems failed. Abort test." );
            result = false;
        }
    }
    else {
        addError( "CreateSubsciption failed. Abort test." );
        result = false;
    }
    return ( result );
}

Test.Execute( { Procedure: SubscriptionBasicErr031 } );
