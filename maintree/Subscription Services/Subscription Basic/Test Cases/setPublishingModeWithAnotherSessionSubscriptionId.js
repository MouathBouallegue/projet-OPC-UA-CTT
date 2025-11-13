/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Call SetPublishingMode for a subscription which was already created in another session.
    Expectation: SeviceResult: Good, OperationResult: BadSubscriptionIdInvalid. Publishing is still enabled in the subscription.
*/

function SubscriptionBasicErr032() {
    
    // check if writable static item is defined
    if( !isDefined( WritableDefaultStaticItem ) || WritableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    var result = true;
    var subscription = new Subscription();

    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableDefaultStaticItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription } ) ) {
            // now open the second session
            var newSession = SessionCreator.Connect();
            if( newSession.result ) {
                if( !SetPublishingModeHelper.Execute( { SubscriptionIds: subscription, PublishingEnabled: false, OperationResults: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) } ) ) result = false;
            }
            SessionCreator.Disconnect( newSession );
            InstanciateHelpers( { Session: Test.Session } );
            // call Publish(), as we want to consume the initial data values 
            PublishHelper.Execute();
            PublishHelper.SetItemValuesFromDataChange( [WritableDefaultStaticItem] );
            UaVariant.Increment( { Item: WritableDefaultStaticItem } );
            WriteHelper.Execute( { NodesToWrite: WritableDefaultStaticItem, ReadVerification: false } );
            PublishHelper.WaitInterval( { Subscription: subscription } );
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
        addError( "CreateSubscription failed. Abort test." );
        result = false;
    }
    return ( result );
}

Test.Execute( { Procedure: SubscriptionBasicErr032 } );
