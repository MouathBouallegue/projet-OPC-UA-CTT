/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specfiying a TimeoutHint smaller than lifetime causes BadTimeout */

var publishesSent=0, publishesReceived=0, errorsReceived=0;

function publishCallback( response, callbackData ) {
    publishesReceived++;
    print( "Publish() [async] received. RequestHandle: " + response.ResponseHeader.RequestHandle );
    if( Assert.StatusCodeIs( StatusCode.BadTimeout, response.ResponseHeader.ServiceResult ) ) errorsReceived++;
}// function publishCallback( response, callbackData ) 

function overwriteTimeoutHint() {
    print( "TimeoutHint (before): " + PublishHelper.Request.RequestHeader.TimeoutHint );
    PublishHelper.Request.RequestHeader.TimeoutHint = 1;
    print( "TimeoutHint (after): " + PublishHelper.Request.RequestHeader.TimeoutHint );
}

function test() {
    var sub = new Subscription2( { PublishingInterval: 500, RequestedLifetimeCount: 20, MaxKeepAliveCount: 3 } );
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_State ) )[0];

    if( CreateSubscriptionHelper.Execute( { Subscription: sub } ) ) {

        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: item, SubscriptionId: sub } ) ) {

            // get our initial data-change and make sure we have a value...
            PublishHelper.WaitInterval( { Items: item, Subscription: sub } );
            PublishHelper.Execute( { FirstPublish: true } );
            Assert.True( PublishHelper.CurrentlyContainsData(), "Expected initial data change" );

            // now to call Publish with an unrealisticly low timeout; should fail!
            for( var i=0; i<2; i++ ) {
                var publishRequest = new UaPublishRequest;
                Test.Session.Session.buildRequestHeader( publishRequest.RequestHeader );
                publishRequest.RequestHeader.TimeoutHint = 10;

                // just use the publish counter as callback data
                // we could also define any type of object and use that as callback data - now it's just a number
                Test.Session.Session.beginPublish( publishRequest, publishCallback, null );
                print( "Publish() [async] called: " + i + ". RequestHandle: " + publishRequest.RequestHeader.RequestHandle + "." );

                publishesSent++;
            }

            // allow up to 5-seconds for both publishes to come back, which is more than necessary
            UaDateTime.CountDown( { Seconds: 5, Message: "Awaiting async Publish responses..." } );

            // clean-up
            wait( 1000 );
        }

        Test.Disconnect();
        Test.Connect();

        Assert.Equal( 2, publishesSent, "Expected to send 2 publishes." );
        Assert.Equal( 2, publishesReceived, "Expected to receive 2 publish responses." );
        Assert.Equal( 2, errorsReceived, "Expected to receive 2 BadTimeout responses." );
    }
    else return( false );

    return( true );
}

Test.Execute( { Procedure: test } );