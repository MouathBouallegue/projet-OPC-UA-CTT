/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the samplingInterval to 10 msec for one item. */

function modifyMonitoredItems592008() {
    if (!isDefined(scalarItems) || scalarItems.length < 1) { addSkipped("Not enough Scalar scalarItems to test with."); return (false); }
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
    addLog ( "Creating " + numItemsToMonitor + " monitored scalarItems using the default sampling interval." );
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
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) ) {
        addLog ( "Successfully created the " + numItemsToMonitor + " monitored scalarItems." );

        addLog ( "Modifying the " + numItemsToMonitor + " monitored scalarItems. Setting the sampling interval of the second item to a 10ms." );
        // Modify the three monitoredItems; Specify a sampling interval of 10ms for the second item
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;
        for (var i = 0; i < numItemsToMonitor; i++) {
            modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle;

            if (i == numItemsToMonitor - 1) {
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.SamplingInterval = 10;
            }
        }
        uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
        if( !uaStatus.isGood() ) {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        }
        else {
            addLog ( "Modified the scalarItems. The results are:" );
            // Check the results of the modification.
            checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
            if (modifyMonitoredItemsResponse.Results[numItemsToMonitor - 1].RevisedSamplingInterval == 10 ) {
                addLog ( "The sampling interval of 10ms for the second item was accepted by the UA server." );
            }
            else {
                addLog("The sampling interval of 10ms for the second item was revised to " + modifyMonitoredItemsResponse.Results[numItemsToMonitor - 1].RevisedSamplingInterval + " by the UA server." );
            }
        }
    }
    // Cleanup
    // Delete the scalarItems we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ ) {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }        
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
    return( true );
}

Test.Execute( { Procedure: modifyMonitoredItems592008 } );