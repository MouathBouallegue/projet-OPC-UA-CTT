/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org 
    Description: Checks GetMonitoredItems reports correct info with 2 subscriptions and 2 items */

Test.Execute( { Procedure: test = function() {
    // create two subscriptions
    var subscription1 = new Subscription(), subscription2 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { SubscriptionId: subscription1 } ) ) return( false );
    if( !CreateSubscriptionHelper.Execute( { SubscriptionId: subscription2 } ) ) { DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription1 } ); return( false ); }

    // create 2 monitored items for subscription1 and subscription2
    var sub1Items = MonitoredItem.GetRequiredNodes( { Number: 2, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings } );
    var sub2Items = MonitoredItem.GetRequiredNodes( { Number: 2, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings } );

    // check if items are defined
    if( !isDefined( sub1Items ) || sub1Items.length === 0 ) {
        addSkipped( "Not enough static scalar items configured. Skipping test." );
        return( false );
    }
    
    // add both items to both subscriptions
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: sub1Items, SubscriptionId: subscription1 } ) ) {
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: sub2Items, SubscriptionId: subscription2 } ) ) {


            // TEST ONE: check subscription 1
            if( CallHelper.Execute( {
                        ServiceResult:    new ExpectedAndAcceptedResults( StatusCode.Good ),
                        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadNoMatch ) ],
                        MethodsToCall:    [ { 
                            MethodId: gmiNodeId, 
                            ObjectId: gmiObject,
                            InputArguments: UaVariant.New( { Value: subscription1.SubscriptionId, Type: BuiltInType.UInt32 } ) } ] } ) ) {

                // check the call results; we expect 2 items for ServerHandles (out1) and ClientHandles (out2)
                Assert.Equal( 2, CallHelper.Response.Results[0].OutputArguments[0].toUInt32Array().length, "Subscription#1 - GetMonitoredItems.OutArguments[0] (ServerHandles) length mismatch." );
                Assert.Equal( 2, CallHelper.Response.Results[0].OutputArguments[1].toUInt32Array().length, "Subscription#1 - GetMonitoredItems.OutArguments[1] (ClientHandles) length mismatch." );

                // now check the ClientHandles actually match
                var clientHandles = CallHelper.Response.Results[0].OutputArguments[1].toUInt32Array();
                for( var i=0; i<2; i++ ) Assert.True( ArrayContains( clientHandles, sub1Items[i].ClientHandle ), "Subscription#1 - Unable to find ClientHandle " + sub1Items[i].ClientHandle );
            }



            // TEST TWO: check subscription 2
            if( CallHelper.Execute( {
                        ServiceResult:    new ExpectedAndAcceptedResults( StatusCode.Good ),
                        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadNoMatch ) ],
                        MethodsToCall:    [ { 
                            MethodId: gmiNodeId, 
                            ObjectId: gmiObject,
                            InputArguments: UaVariant.New( { Value: subscription2.SubscriptionId, Type: BuiltInType.UInt32 } ) } ] } ) ) {

                // check the call results; we expect 2 items for ServerHandles (out1) and ClientHandles (out2)
                Assert.Equal( 2, CallHelper.Response.Results[0].OutputArguments[0].toUInt32Array().length, "Subscription#2 - GetMonitoredItems.OutArguments[0] (ServerHandles) length mismatch." );
                Assert.Equal( 2, CallHelper.Response.Results[0].OutputArguments[1].toUInt32Array().length, "Subscription#2 - GetMonitoredItems.OutArguments[1] (ClientHandles) length mismatch." );

                // now check the ClientHandles actually match
                var clientHandles = CallHelper.Response.Results[0].OutputArguments[1].toUInt32Array();
                for( var i=0; i<2; i++ ) Assert.True( ArrayContains( clientHandles, sub2Items[i].ClientHandle ), "Subscription#2 - Unable to find ClientHandle " + sub1Items[i].ClientHandle );
            }



        }// cmi #2
    }// cmi #1

    // cleanup all subscriptions
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: sub1Items, SubscriptionId: subscription1 } );
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: sub2Items, SubscriptionId: subscription2 } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: [ subscription1, subscription2 ] } );
    return( true );
} } );