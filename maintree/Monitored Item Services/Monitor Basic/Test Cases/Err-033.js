/*  Test prepared by Development; compliance@opcfoundation.org
    Description: Specify a valid subscriptionId and an invalid monitoredItemId, on DeleteMonitoredItems. */

function deleteMonitoredItems595Err002() {
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
    if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToCreate: items } ) ) {
        // delete monitored item, but temporarily break it's monitoredItemId
        items[0].MonitoredItemId += 0x4321;
        DeleteMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToDelete: items[0], OperationResults: new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) } );
        items[0].MonitoredItemId -= 0x4321;
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: MonitorBasicSubscription } );
    }
    return( true );
}

Test.Execute( { Procedure: deleteMonitoredItems595Err002 } );