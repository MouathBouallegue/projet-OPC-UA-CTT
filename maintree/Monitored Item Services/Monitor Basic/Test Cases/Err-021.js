/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script specifies some valid and some invalid monitoredItemIds. */

function modifyMonitoredItems592Err006() {
    if( maxMonitoredItems < 2 ) {
        addSkipped( "Server does not support enough # of MonitoredItems to complete this test. Max # MonitoredItems in settings: " + maxMonitoredItems + "; scalarItems needed: 2." );
        return( false );
    }
    if( !isDefined( scalarItems ) || scalarItems.length < 2 ) { addSkipped( "Not enough Scalar scalarItems to test with." ); return( false ); }
    var i;
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for Monitor Basic was not created" );
        return( false );
    }

    // Add scalarItems.length monitored scalarItems using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var numItemsToMonitor = scalarItems.length;
    print( "Creating " + numItemsToMonitor + " monitored scalarItems." );
    for( i=0; i<numItemsToMonitor; i++ ) {
        createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = scalarItems[i].NodeId;
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = i+1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var uaStatus = Test.Session.Session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() ) {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) ) {
        print( "Successfully created the " + numItemsToMonitor + " monitored scalarItems." );
        print( "Modifying monitored scalarItems. Specifying some valid and some invalid monitoredItemIds." );
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;        
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        for( i = 0; i < numItemsToMonitor; i++ ) {
            // Only parameter being modified
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle;
        }

        // Let's specify indices 1,3,5 as invalid MonitoredItemIds
        // Indices 1,3,5 should return 'BadMonitoredItemIdInvalid' rest all 'Good'
        var ExpectedOperationResultsArray = [];
        for (var i = 0; i < scalarItems.length; i++) {
            if (i % 2) {
                modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[i].MonitoredItemId;
                ExpectedOperationResultsArray.push(new ExpectedAndAcceptedResults(StatusCode.Good));
            }
            else {
                modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = 0xC000 + i;
                ExpectedOperationResultsArray.push(new ExpectedAndAcceptedResults(StatusCode.BadMonitoredItemIdInvalid));
            }
        }

        uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
        if( !uaStatus.isGood() ) {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        }

        print( "Modified the scalarItems. The results are:" );

        checkModifyMonitoredItemsError( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedOperationResultsArray );
    }//if checkCreateMonitoredItemsValidParameter

    // Cleanup
    // Delete the scalarItems we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ ) {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }        
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
    return( true );
}

Test.Execute( { Procedure: modifyMonitoredItems592Err006 } );