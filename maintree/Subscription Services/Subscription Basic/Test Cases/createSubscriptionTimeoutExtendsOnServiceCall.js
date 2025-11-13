/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create a subscription and make subscription calls (non-Publish). Each call
                 should extend the subscription lifetime counter.
                 Do: ModifyMonitoredItems, ModifySubscription, SetPublishingMode, Republish, SetMonitoringMode, SetTriggering*, DeleteMonitoredItems */

function test063() {
    // get our items from the settings
    var testItems = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: 2, SkipCreateSession: true } );
    if ( testItems === undefined || testItems === null || testItems.length < 1 ) {
        addSkipped( "Not enough scalar items configured." );
        return ( false );
    }

    // create the new subscription
    var doNextTest = true;
    var sub = new Subscription2( { RequestedLifetimeCount: 5 } );
    if( CreateSubscriptionHelper.Execute( { Subscription: sub, SuppressMessaging: true } ) ) {
        // test 1: wait and then call CreateMonitoredItems()
        var timeout = parseInt( sub.Expiration() * 0.8 ); // create our timeout to be 80% of lifetimeCount * publishInterval
        print( "Timeout = " + timeout + " ms. This is based on 80% of subscription expiration (" + sub.Expiration() + ") ms." );
        UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling CreateMonitoredItems()" } );
        if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: testItems, SubscriptionId: sub, SuppressMessaging: true } ) ) doNextTest = false;

        // test 2: wait and call ModifyMonitoredItems()
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling ModifyMonitoredItems()" } );
            if( !ModifyMonitoredItemsHelper.Execute( { ItemsToModify: testItems[0], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: sub, SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 3: wait and call ModifySubscription() { adjust publishing interval }
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling ModifySubscription()" } );
            if( !ModifySubscriptionHelper.Execute( { SubscriptionId: sub, RequestedPublishingInterval: 2 * sub.RevisedPublishingInterval, SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 4: wait and call SetPublishingMode() -- call it twice, to disable and then re-enable publishing
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling SetPublishingMode() (twice)" } );
            if( !SetPublishingModeHelper.Execute( { SubscriptionIds: sub, PublishingEnabled: false, SuppressMessaging: true } ) ) doNextTest = false;
            if( !SetPublishingModeHelper.Execute( { SubscriptionIds: sub, PublishingEnabled: true, SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 9: call Publish(), we expect the subscription to be alive and to contain the initial data set.
        if ( doNextTest ) {
            UaDateTime.CountDown( { Msecs: timeout, Message: "prior to calling Publish()" } );
            PublishHelper.Execute( { FirstPublish: true, SuppressMessaging: true } );
            Assert.True( PublishHelper.CurrentlyContainsData(), "Publish.Response expected the initial data-change notification because the Subscription's expiration should have incremented on each subscription service-call." );
        }

        // test 5: wait and call Republish() -- allow this to fail because we'll request an invalid sequence
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling Republish()" } );
            if( !RepublishHelper.Execute( { SubscriptionId: sub, RetransmitSequenceNumber: 0, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadSequenceNumberUnknown, StatusCode.BadMessageNotAvailable ] ), SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 6: wait and call SetMonitoringMode() -- toggle to sampling, and then reporting
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling SetMonitoringMode() (twice)" } );
            if( !SetMonitoringModeHelper.Execute( { SubscriptionId: sub, MonitoredItemIds: testItems[0], MonitoringMode: MonitoringMode.Sampling, SuppressMessaging: true } ) ) doNextTest = false;
            if( !SetMonitoringModeHelper.Execute( { SubscriptionId: sub, MonitoredItemIds: testItems[0], MonitoringMode: MonitoringMode.Reporting, SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 7: wait and call SetTriggering() - may not be supported!
        if( doNextTest ) {
            UaDateTime.CountDown( { Milliseconds: timeout, Message: "prior to calling SetTriggering() -- may not be supported" } );
            if( !SetTriggeringHelper.Execute( { SubscriptionId: sub, TriggeringItemId: testItems[0], LinksToAdd: testItems[1], ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadServiceUnsupported, StatusCode.BadMessageNotAvailable ] ), SuppressMessaging: true } ) ) doNextTest = false;
        }

        // test 8: wait and call DeleteMonitoredItems()
        if( doNextTest ) {
            UaDateTime.CountDown( { Msecs: timeout, Message: "prior to calling DeleteMonitoredItems()" } );
           DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: testItems[0], SubscriptionId: sub, SuppressMessaging: true } );
        }

        //wait to verify the DeleteMonitoredItems also extended the lifetime and then clean-up
        UaDateTime.CountDown( { Msecs: timeout, Message: "after calling DeleteMonitoredItems" } );
        // clean-up
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub, SuppressMessaging: true } );
    }// CreateSubscription
    return( true );
}

Test.Execute( { Procedure: test063 } );