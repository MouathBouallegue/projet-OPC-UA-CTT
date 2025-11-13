/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create a Monitored Item and request an unsupported DataTypeEncoding, e.g. "Modbus". */

function CreateMonitoredItemsErr004() { 
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus ) )[0];

    // specify the encoding
    item.DataEncoding.Name = "modbus";

    // create a subscription
    var subscription = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) return( false );

    // create the item
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, SubscriptionId: subscription, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadDataEncodingUnsupported ] ) } ) ) {
        // if received status code Good, check status code after first DataChangeNotification
        if ( CreateMonitoredItemsHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.Good ) {
            // publish the item, and test the failure condition 
            PublishHelper.WaitInterval( { Items: item, Subscription: subscription } );
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
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}//func

Test.Execute( { Procedure: CreateMonitoredItemsErr004 } );