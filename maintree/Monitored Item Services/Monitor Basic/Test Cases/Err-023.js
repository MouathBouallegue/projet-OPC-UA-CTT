/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the items in one subscription but specifies the monitoredItemId of an item from another subscription.
        This test will accept a "Bad_MonitoredItemIdInvalid" or "Good" as the operation level result, because: 
         1) if the server generates unique Ids per subscrition, then the item being modified in the "other" subscription may actually exist in the 
            original subscription. Therefore a "Good" would be received.
         2) if the server generates unique Ids for ALL monitoredItems, then each item will have a different Id and therefore we could expect that 
            the server returns Bad_InvalidMonitoredItemId. */

function modifyMonitoredItems592Err008() {
    var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems } );
    if( items == null || items.length < 4 ) {
        if( maxMonitoredItems < 4 ) addSkipped( "Not enough Max MonitoredItems. At least 4 needed; Configured: " + maxMonitoredItems );
        else addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }
    if (gServerCapabilities.MaxSupportedSubscriptions < 2 && gServerCapabilities.MaxSupportedSubscriptions != 0) {
        addSkipped("Server does not support two subscriptions as needed for this test case. This is only allowed for Nano and Micro Device Server profiles.");
        return (false);
    }
    var i;
    // We already have one subscription created in the initialize routine. Lets's
    // create the second one here
    SecondSubscription = new Subscription();
    CreateSubscriptionHelper.Execute( { Subscription: SecondSubscription } );
    // Just for clarity
    var FirstSubscription = MonitorBasicSubscription;
    if( !FirstSubscription.SubscriptionCreated || !SecondSubscription.SubscriptionCreated ) {
        addError( "One or both subscriptions for conformance unit Monitor Basic was not created." );
        return( false );
    }
    // Add 3 items to the first subscription
    var createMonitoredItemsRequestFirstSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseFirstSub = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( createMonitoredItemsRequestFirstSub.RequestHeader );

    createMonitoredItemsRequestFirstSub.SubscriptionId = FirstSubscription.SubscriptionId;
    createMonitoredItemsRequestFirstSub.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 1;
    // modified
    var numItemsToMonitorFirstSub = (maxMonitoredItems > 3 || maxMonitoredItems == 0)? 3:maxMonitoredItems;
    print( "Creating " + numItemsToMonitorFirstSub + " monitored items in the first subscription." );
    // modified
    var items2 = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: numItemsToMonitorFirstSub } );
    if( items2 == null || items2.length == 0 ) {
        addSkipped( "No Numerics defined in CTT settings. Skipping this test case." );
        return ( false );
    }
    for( i = 0; i < numItemsToMonitorFirstSub; i++ ) {
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].ItemToMonitor.NodeId = items2[i].NodeId;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var uaStatus = Test.Session.Session.createMonitoredItems( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub );
    if ( !uaStatus.isGood() ) {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return( false );
    }

    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub ) ) {
        addError( "Unable to validate parameters when creating monitoring items for the first subscription. Stopping test." );
        return( false );
    }
    print( "Successfully created the " + numItemsToMonitorFirstSub + " monitored items in the first subscription." );        

    // Now add 3 items to the second subscription
    var createMonitoredItemsRequestSecondSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseSecondSub = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( createMonitoredItemsRequestSecondSub.RequestHeader );

    createMonitoredItemsRequestSecondSub.SubscriptionId = SecondSubscription.SubscriptionId;
    createMonitoredItemsResponseSecondSub.TimestampsToReturn = TimestampsToReturn.Both;

    clientHandle = 1;
    // modified
    var numItemsToMonitorSecondSub = (maxMonitoredItems > 3 || maxMonitoredItems == 0)? 3:maxMonitoredItems;
    addLog ( "Creating " + numItemsToMonitorFirstSub + " monitored items in the second subscription." );
    // modified
    var items3 = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: numItemsToMonitorSecondSub } );
    for( i = 0; i < numItemsToMonitorSecondSub; i++ ) {
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].ItemToMonitor.NodeId = items3[i].NodeId;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    uaStatus = Test.Session.Session.createMonitoredItems( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub );
    if ( !uaStatus.isGood() ) {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return( false );
    }
    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub ) ) {
        addError( "Unable to validate parameters when creating monitoring items for the second subscription. Stopping test." );
        return( false );
    }

    print( "Successfully created the " + numItemsToMonitorFirstSub + " monitored items in the second subscription." );        
    print( "Modifying all the items in the first subscription and 1 item from the second subscription while specifying the subscripionID of the first subscription." );
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = FirstSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    for( i = 0; i < (numItemsToMonitorFirstSub + 1); i++ ) modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;

    // Let's specify monitored item in index 1 from the second subscription
    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = createMonitoredItemsRequestFirstSub.ItemsToCreate[0].RequestedParameters.ClientHandle;
    modifyMonitoredItemsRequest.ItemsToModify[1].MonitoredItemId = createMonitoredItemsResponseSecondSub.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[1].RequestedParameters.ClientHandle = createMonitoredItemsRequestSecondSub.ItemsToCreate[0].RequestedParameters.ClientHandle;
    modifyMonitoredItemsRequest.ItemsToModify[2].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[1].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[2].RequestedParameters.ClientHandle = createMonitoredItemsRequestFirstSub.ItemsToCreate[1].RequestedParameters.ClientHandle;
    if( numItemsToMonitorFirstSub > 2 ) {
        modifyMonitoredItemsRequest.ItemsToModify[3].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[2].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[3].RequestedParameters.ClientHandle = createMonitoredItemsRequestFirstSub.ItemsToCreate[2].RequestedParameters.ClientHandle;
    }

    uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
    if( !uaStatus.isGood() ) addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
    else {
        print( "Modified the items. The results are:" );
        // Check results
        // Index 1 should return 'BadMonitoredItemIdInvalid' rest all 'Good'
        var ExpectedOperationResultsArray = [];
        ExpectedOperationResultsArray [0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
        ExpectedOperationResultsArray [1].addExpectedResult( StatusCode.Good );
        ExpectedOperationResultsArray [2] = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( numItemsToMonitorFirstSub > 2 ) ExpectedOperationResultsArray [3] = new ExpectedAndAcceptedResults( StatusCode.Good );
        checkModifyMonitoredItemsError( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedOperationResultsArray );
    }

    // Cleanup
    // Delete the item we added to the first subscription
    var monitoredItemsIdsToDeleteFirstSub = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseFirstSub.Results.length; i++ ) {
        monitoredItemsIdsToDeleteFirstSub[i] = createMonitoredItemsResponseFirstSub.Results[i].MonitoredItemId;
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDeleteFirstSub, SubscriptionId: FirstSubscription } );

    // Delete the item we added to the second subscription
    var monitoredItemsIdsToDeleteSecondSub = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseSecondSub.Results.length; i++ ) {
        monitoredItemsIdsToDeleteSecondSub[i] = createMonitoredItemsResponseSecondSub.Results[i].MonitoredItemId;
    }        
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDeleteSecondSub, SubscriptionId: SecondSubscription } );

    // Delete the second subscription (first subscription will be deleted in the common cleanup code)
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: SecondSubscription } );
    return( true );
}

Test.Execute( { Procedure: modifyMonitoredItems592Err008 } );