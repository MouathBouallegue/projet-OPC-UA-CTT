/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify an invalid dataEncoding (e.g., the NamespaceIndex doesn`t exist). */ 

function createMonitoredItemsErr015() { 
    // get an item and specify the invalid encoding
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus ) )[0];
    var invalidEncoding = new UaQualifiedName();
    invalidEncoding.NamespaceIndex = 0x123;
    invalidEncoding.Name = "Default Binary";

    item.DataEncoding = invalidEncoding;

    var sub1 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: sub1 } ) ) return( false );

    // Invoke the call and test the result.
    // Expected BadDataEncodingUnsupported because the "Default Binary" encoding doesn't exist in the specified namespace and
    // is therefore invalid!
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, SubscriptionId: sub1, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadDataEncodingUnsupported ] ) } ) ) {
        // if received status code Good, check status code after first DataChangeNotification
        if (CreateMonitoredItemsHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.Good) {
            PublishHelper.WaitInterval( { Items: item, Subscription: sub1 } );
            PublishHelper.Execute( );
            
            var dataChangeEvent = PublishHelper.Response.NotificationMessage.NotificationData[0].toDataChangeNotification();
            // if still not receiving expected status code, print error
            if( dataChangeEvent.MonitoredItems[0].Value.StatusCode.StatusCode != StatusCode.BadDataEncodingUnsupported ) {
                addError( "Expected: BadDataEncodingUnsupported, but received: " + dataChangeEvent.MonitoredItems[0].Value.StatusCode );
                return( false );
            }
            else {
                addWarning( "Though the specification allows to return such errors in the first NotificationMessage, it recommends to rather return it on the CreateMonitoredItems." );
            }
        }
    }
    else {
        addError( "Expected: BadDataEncodingUnsupported, but received: " + CreateMonitoredItemsHelper.Response.Results[0].StatusCode );
        return( false );
    }
    
    // clean-up
    PublishHelper.Clear();
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub1 } );
    return( true );
}//function

Test.Execute( { Procedure: createMonitoredItemsErr015 } );