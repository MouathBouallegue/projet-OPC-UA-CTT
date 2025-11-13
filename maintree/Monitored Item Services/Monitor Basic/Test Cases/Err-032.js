/*  Test prepared by Development; compliance@opcfoundation.org
    Description: Specify an invalid subscriptionId on DeleteMonitoredItems. */

function deleteMonitoredItems595Err001() {
    var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems } );
    if( items == null || items.length < 2 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }
    // subscription is created and deleted in initialize and cleanup scripts
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return( false );
    }
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToCreate: scalarItems[0] } ) ) {
        // delete monitored item, specifying an invalid subscription id (temporarily modify the subscription id)
        MonitorBasicSubscription.SubscriptionId += 0x1234;
        DeleteMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToDelete: scalarItems[0], ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) } );
        MonitorBasicSubscription.SubscriptionId -= 0x1234;
        // real clean-up
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: scalarItems[0], SubscriptionId: MonitorBasicSubscription } );
    }
    return( true );
}

Test.Execute( { Procedure: deleteMonitoredItems595Err001 } );