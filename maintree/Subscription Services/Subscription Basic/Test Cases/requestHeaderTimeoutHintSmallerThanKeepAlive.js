/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Invoke a Publish call with a requested timeout that is smaller than 
                 the subscription's keepAlive count */

function overwriteTimeoutHint() {
    print( "TimeoutHint (before): " + PublishHelper.Request.RequestHeader.TimeoutHint );
    PublishHelper.Request.RequestHeader.TimeoutHint = 1;
    print( "TimeoutHint (after): " + PublishHelper.Request.RequestHeader.TimeoutHint );
}

function test() {
    addSkipped( "This test case is currently under review by the Compliance Working Group and therefore is being skipped." )
    return ( true );

    var sub = new Subscription2( { PublishingInterval: 500, RequestedLifetimeCount: 5, MaxKeepAliveCount: 3 } );
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_State ) )[0];

    if( CreateSubscriptionHelper.Execute( { Subscription: sub } ) ) {

        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, SubscriptionId: sub } ) ) {

            // get our initial data-change and make sure we have a value...
            PublishHelper.WaitInterval( { Items: item, Subscription: sub } );
            PublishHelper.Execute( { FirstPublish: true } );
            Assert.True( PublishHelper.CurrentlyContainsData(), "Expected initial data change" );

            // now to call Publish with an unrealisticly low timeout; should fail!
            PublishHelper.Execute( { 
                PreHook: overwriteTimeoutHint,
                ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadTimeout ] ) } );

            print( "PublishHelper result: " + PublishHelper.Response.ResponseHeader.ServiceResult );

            // clean-up
            wait( 1000 );
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: item, SubscriptionId: sub } );
        }

        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub } );
    }
    else return( false );

    return( true );
}

Test.Execute( { Procedure: test, Debug: true } );