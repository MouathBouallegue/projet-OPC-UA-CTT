/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script deletes all monitored items from a subscription. */

function setTriggering595004() {
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return( false );
    }

    if( scalarItems == null || scalarItems.length == 0 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }

    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: scalarItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
        if( DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: scalarItems, SubscriptionId: MonitorBasicSubscription } ) ) {
            // verify the object is deleted by trying to change the monitoringMode.
            var expectedErrors = []
            for( var m=0; m<scalarItems.length; m++ ) {
                expectedErrors[m] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            }
            SetMonitoringModeHelper.Execute( { MonitoringMode: MonitoringMode.Disabled, MonitoredItemIds: scalarItems, SubscriptionId: MonitorBasicSubscription, OperationResults: expectedErrors } );
        }
    }
    return( true );
}

Test.Execute( { Procedure: setTriggering595004 } );