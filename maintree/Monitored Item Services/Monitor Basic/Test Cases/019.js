/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the ClientHandle for the first item to a very large number. */

function modifyMonitoredItems592020() {
    if( !isDefined( scalarItems ) || scalarItems.length == 0 ) { addSkipped( "Not enough Scalar scalarItems to test with." ); return( false ); }
    if( !MonitorBasicSubscription.SubscriptionCreated ) { addError( "Subscription for Monitor Basic was not created" ); return( false ); }

    // Add 3 monitored scalarItems using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 1;
    print( "Creating " + maxMonitoredItems + " monitored scalarItems." );
    for( var i = 0; i< maxMonitoredItems; i++ ) {
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

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    print( "Successfully created the " + maxMonitoredItems + " monitored scalarItems." );
    print( "Modifying the " + maxMonitoredItems + " monitored scalarItems. Setting the ClientHandle of the first item to a negative number." );
    // Modify the three monitoredItems; Specify a negative clienthandle for the first item
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    // set Client handle max
    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = Constants.Int32_Max;
    modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.QueueSize = 2;

    for( var i = 1; i< maxMonitoredItems; i++ ) {
        modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[1].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;
        modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = createMonitoredItemsRequest.ItemsToCreate[1].RequestedParameters.ClientHandle;
    }

    uaStatus = Test.Session.Session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
    if( !uaStatus.isGood() ) addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
    else {
        print( "Modified the scalarItems. The results are:" );
        // Check the results of the modification.
        var ExpectedOperationResultsArray = [];
        while( ExpectedOperationResultsArray.length < maxMonitoredItems ) ExpectedOperationResultsArray.push(new ExpectedAndAcceptedResults( StatusCode.Good ));

        checkModifyMonitoredItemsError( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedOperationResultsArray );
    }
    // Cleanup
    // Delete the scalarItems we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ ) monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
    return( true );
}//function modifyMonitoredItems592020()

Test.Execute( { Procedure: modifyMonitoredItems592020 } );