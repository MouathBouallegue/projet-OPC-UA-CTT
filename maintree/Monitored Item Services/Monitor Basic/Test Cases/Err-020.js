/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script modifies the ClientHandle for the first item to a number already in use by another MonitoredItem.
        How this test works:
            1. create 3 monitored items with ClientHandle's = 0, 1, 2.
            2. modify the 1st handle to be "1". So all 3 items shoudl have handles 1, 1, 2.
            3. we do not expect any errors since the ClientHandle is of no significance to the Server. */

function modifyMonitoredItems592Err005() {
    if( !isDefined( scalarItems ) || scalarItems.length < 2 ) { addSkipped( "Not enough Scalar scalarItems to test with." ); return( false ); }
    if( !MonitorBasicSubscription.SubscriptionCreated ) { addError( "Subscription for Monitor Basic was not created" ); return( false ); }

    var result = true;

    // Add 3 monitored scalarItems using default parameters
    if( !CreateMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToCreate: scalarItems } ) ) return( false );

    // show the original ClientHandles
    print( "Original Client Handles: ");
    for( var h=0; h<scalarItems.length; h++ ) print( "\tItem # " + h + " = " + CreateMonitoredItemsHelper.Request.ItemsToCreate[h].RequestedParameters.ClientHandle );

    print( "Created the " + scalarItems.length + " monitored scalarItems." );
    print( "Modifying the " + scalarItems.length + " monitored scalarItems. Setting the ClientHandle of the first item to the ClientHandle of another item." );

    // Modify the the monitoredItem
    // While the spec does not prohibit this behavior, it is actually a bad idea.
    scalarItems[1].OriginalClientHandle = scalarItems[1].ClientHandle;
    scalarItems[1].ClientHandle = scalarItems[0].ClientHandle;
    if( !ModifyMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToModify: scalarItems[1] } ) ) result = false;

    // Cleanup
    scalarItems[1].ClientHandle = scalarItems[1].OriginalClientHandle;
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: scalarItems, SubscriptionId: MonitorBasicSubscription } );
    return( result );
}

Test.Execute( { Procedure: modifyMonitoredItems592Err005 } );