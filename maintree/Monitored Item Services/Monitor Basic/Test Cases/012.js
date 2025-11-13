/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the queueSize of the first item to max UInt32. We expect that no server will accept a queue of this size, so we are checking 
        to make usre the size != max UInt32. */

function modifyMonitoredItems592012() {
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
    print( "Creating " + numItemsToMonitor + " monitored scalarItems." );
    for( var i = 0; i<scalarItems.length; i++ ) {
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
        print( "Modifying the " + numItemsToMonitor + " monitored scalarItems. Setting the 'QueueSize' of the first item to max unsigned int value('" + Constants.UInt32_Max + "')." );
        // Modify the three monitoredItems; Specify MAX UINT32 for the QueueSize of the first item
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        for( var i = 0; i < numItemsToMonitor; i++ ) {
            modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[i].MonitoredItemId;

            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle;

            if( i == numItemsToMonitor - 1 ) {
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = Constants.UInt32_Max;
            }
            else {
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.DiscardOldest = false;
            }
        }

        uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
        if( !uaStatus.isGood() ) {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
            return ( false );
        }

        print( "Modified the scalarItems. The results are:" );
        // Check the results of the modification.
        checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

        // make sure the revisedQueueSize != maxInt32
        Assert.NotEqual( Constants.UInt32_Max, modifyMonitoredItemsResponse.Results[numItemsToMonitor - 1].RevisedQueueSize, "Server did not revise the maxInt value of the queueSize. Servers must put a cap on the max size of queue they support to avoid consuming too many resources." );

        // Cleanup
        // Delete the scalarItems we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( i = 0; i < createMonitoredItemsResponse.Results.length; i++ ) {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
        return ( true );
    }
    else {
        // Cleanup
        // Delete the scalarItems we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( i = 0; i < createMonitoredItemsResponse.Results.length; i++ ) {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
        return ( true );
    }
}

Test.Execute( { Procedure: modifyMonitoredItems592012 } );