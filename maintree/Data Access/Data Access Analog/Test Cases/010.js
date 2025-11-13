/*  Test prepared by Anand Taparia; ataparia@kepware.com    
   Description: Add monitored items of analog type (each supported datatype) to an enabled subscription. Wait for a publishing interval and call Publish()
                to verify the values received match the expected datatype of each node. */

function subscribe613010() {
    // Create the subscription
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) == false ) {
        addError( "Test aborted: Unable to create subscription." );
        return( false );
    }
    
    // Create and add monitored items to the subscription
    var expectedResults = [];
    while( expectedResults.length < AnalogItems.length ) expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadMonitoredItemFilterUnsupported ] ) );
    if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: AnalogItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription, OperationResults: expectedResults } ) == false ) {
        addSkipped( "Test aborted: Unable to add the monitored items to the subscription." );
        return( false );
    }

    if( CreateMonitoredItemsHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.BadMonitoredItemFilterUnsupported ) {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        addSkipped("Skipping test, can't create monitored item with Deadband Absolute of 10 filter. CreateMonitoredItemsHelper.Response.Results[0].StatusCode returned" + CreateMonitoredItemsHelper.Response.Results[0].StatusCode );
        return( true );
    }
    // Wait for one publishing interval
    PublishHelper.WaitInterval( { Items: AnalogItems, Subscription: subscription } );

    // call Publish()
    print( "Calling publish." );
    PublishHelper.RegisterSubscription( subscription );
    if ( PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } ) ) {
        if( PublishHelper.CurrentlyContainsData ) {
            var nNumSuccess = 0;
            var nNumFailure = 0;
            for( var d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) {
                for( var m=0; m<PublishHelper.CurrentDataChanges[d].MonitoredItems.length; m++ ) {
                    var mi = PublishHelper.CurrentDataChanges[d].MonitoredItems[m].ClientHandle;
                    print( "PublishHelper.CurrentDataChanges[" + d + "].MonitoredItems[" + m + "].ClientHandle = " + PublishHelper.CurrentDataChanges[d].MonitoredItems[m].ClientHandle );
                    var analogItemIndex = mi - 1;
                    var found = false;
                    // search item in current data changes
                    if( analogItemIndex < AnalogItems.length ) {
                        if( AnalogItems[analogItemIndex].ClientHandle == mi ) {
                            found = true;
                        }
                    }
                    print( "AnalogItems[" + analogItemIndex + "].ClientHandle = " + AnalogItems[analogItemIndex].ClientHandle );
                    if( !found ) nNumFailure++;
                    else {
                        var currentNodeDataType = UaNodeId.GuessType( AnalogItems[analogItemIndex].NodeSetting );
                        if( currentNodeDataType === '' || PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType == currentNodeDataType ) nNumSuccess++;
                        else {
                            addError( "DataType received for analog node '" + AnalogItems[analogItemIndex].NodeSetting + "' does not match the expected type.\n\t Expected datatype: " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype: " + BuiltInType.toString ( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType) );
                            nNumFailure++;
                        }
                    }
                }
            }
            // Just check if we received responses for all our analog nodes
            if ( ( nNumSuccess + nNumFailure ) != AnalogItems.length ) addError( "Datatypes of all the analog nodes was not verified.\n\tNum of analog nodes: " + AnalogItems.length + "\n\tSuccessfull verification: " + nNumSuccess + "\n\tFailed verification: " + nNumFailure );
        }
        else addError( "No dataChange received after the publish as was expected." );
    }

    // Clean up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: AnalogItems, SubscriptionId: subscription } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    PublishHelper.Clear();
    return( true );
}// function subscribe613010() 

Test.Execute( { Debug: true, Procedure: subscribe613010 } );