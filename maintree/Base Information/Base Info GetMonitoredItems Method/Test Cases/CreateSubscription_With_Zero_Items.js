/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org 
    Description: Create a subscription with no items, call GetMonitoredItems. */

Test.Execute( { Procedure: test = function() {
    // create two subscriptions
    var subscription1 = new Subscription(), subscription2 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { SubscriptionId: subscription1 } ) ) return( false );

    // TEST ONE: check subscription 1
    if( CallHelper.Execute( {
                ServiceResult:    new ExpectedAndAcceptedResults( StatusCode.Good ),
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadNoMatch ) ],
                MethodsToCall:    [ { 
                    MethodId: gmiNodeId, 
                    ObjectId: gmiObject,
                    InputArguments: UaVariant.New( { Value: subscription1.SubscriptionId, Type: BuiltInType.UInt32 } ) } ] } ) ) {

        // check the call results; we expect 2 items for ServerHandles (out1) and ClientHandles (out2)
        if( CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
            addError( "GetMonitoredItems.OutArguments[0] (ServerHandles) returned an empty Variant." );
        }
        else if( CallHelper.Response.Results[0].OutputArguments[0].getArraySize() != 0 &&
                CallHelper.Response.Results[0].OutputArguments[0].getArraySize() != -1 ) addError( "GetMonitoredItems.OutArguments[0] (ServerHandles) length mismatch." );
                
        if( CallHelper.Response.Results[0].OutputArguments[1].isEmpty() ) {
            addError( "GetMonitoredItems.OutArguments[1] (ClientHandles) returned an empty Variant." );
        }
        else if( CallHelper.Response.Results[0].OutputArguments[1].getArraySize() != 0 &&
                CallHelper.Response.Results[0].OutputArguments[1].getArraySize() != -1 ) addError( "GetMonitoredItems.OutArguments[1] (ClientHandles) length mismatch." );

    }

    // cleanup all subscriptions
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: [ subscription1, subscription2 ] } );
    return( true );
} } );