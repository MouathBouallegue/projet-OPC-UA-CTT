/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the queueSize of the first item to zero. Expected Result: 
            ServiceResult = Good The UA server should revise the queueSize > '0'. */

function modifyMonitoredItems592011() {
    if( maxMonitoredItems < 1 ) {
        addSkipped( "No enough scalarItems available for testing. Also check Configuration Settings/ServerTest/Capabilities/MaxSupportedMonitoredItems: " + maxMonitoredItems );
        return( false );
    }
    if( !isDefined( scalarItems ) || scalarItems.length < 1 ) { addSkipped( "Not enough Scalar scalarItems to test with." ); return( false ); }
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for Monitor Basic was not created" );
        return( false );
    }
    // Add scalarItems.length monitored scalarItems using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 1;
    var numItemsToMonitor = scalarItems.length;
    print( "Creating " + numItemsToMonitor + " monitored scalarItems." );
    for( var i = 0; i< numItemsToMonitor; i++ ) {
        createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = scalarItems[i].NodeId;
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var uaStatus = Test.Session.Session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() ) {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return( false );
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) ) {
        print( "Successfully created the " + numItemsToMonitor + " monitored scalarItems." );
        print( "Modifying the " + numItemsToMonitor + " monitored scalarItems. Setting the 'QueueSize' of the first item to ZERO." );
        // Modify the three monitoredItems; Specify '0' for the QueueSize of the first item
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        for (var i = 0; i < numItemsToMonitor; i++) {
            modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle;
            if (i == numItemsToMonitor - 1) {
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 0;
            }
            else {
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.DiscardOldest = false;
            }
        }

        uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
        if( !uaStatus.isGood() ) {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
            return( false );
        }

        print( "Modified the scalarItems. The results are:" );
        // Check the results of the modification.
        checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

        // The server should revise the QueueSize to '1' based on our request to set it to '0'
        Assert.NotEqual(0, modifyMonitoredItemsResponse.Results[numItemsToMonitor - 1].RevisedQueueSize, "The UA server accepted the QueueSize of '0' for the first item. This is not allowed." );
    
        // Cleanup
        // Delete the scalarItems we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ ) {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
        return( true );
    }
    else {
        // Cleanup
        // Delete the scalarItems we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for ( i=0; i<createMonitoredItemsResponse.Results.length; i++ ) {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
        return( false );
    }
}

Test.Execute( { Procedure: modifyMonitoredItems592011 } );