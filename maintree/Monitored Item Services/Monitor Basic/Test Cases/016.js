/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script deletes multiple monitored items from a subscription */

function setTriggering595002() {
    if( maxMonitoredItems < 3 ) {
        addSkipped( "Server does not support enough # of MonitoredItems to complete this test. Max # MonitoredItems in settings: " + maxMonitoredItems + "; items needed: 3." );
        return( false );
    }
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return( false );
    }

    addLog ( "Ready to create at least 3 monitored items." );
    if( scalarItems == null || scalarItems.length == 0 ) { addSkipped( "Not enough scalarItems to test. Skipping test." ); return( false ); }
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: scalarItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
        // delete some scalarItems, NOT ALL!
        var itemsToDelete = [];
        for (var i = 0; i < scalarItems.length; i++) {
            if (!(i % 2)) itemsToDelete.push(scalarItems[i]);
        }
        if( DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: itemsToDelete, SubscriptionId: MonitorBasicSubscription } ) ) {
            // verify the object is deleted by trying to change the monitoringMode.
            var expectedErrors = [];
            for( var m=0; m<itemsToDelete.length; m++ ) {
                expectedErrors[m] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            }
            SetMonitoringModeHelper.Execute( { MonitoringMode: MonitoringMode.Disabled, MonitoredItemIds: itemsToDelete, SubscriptionId: MonitorBasicSubscription, OperationResults: expectedErrors } );

            // delete the remaining scalarItems
            itemsToDelete = [];
            for(var i = 0; i < scalarItems.length; i++) {
                if (i % 2) itemsToDelete.push(scalarItems[i]);
            }
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: itemsToDelete, SubscriptionId: MonitorBasicSubscription } );
        }
    }
    return( true );
}

Test.Execute( { Procedure: setTriggering595002 } );