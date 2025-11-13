/*  Test 5.10.1 Test 28, prepared by Nathan Pocock; compliance@opcfoundation.org
    Description:    	Create a subscription (no monitoredItems) with a RequestedPublishingInterval of 1000 and a RequestedMaxKeepAliveCount of 5.
                        Wait (RevisedPublishingInterval + 500) milliseconds and then call Publish().
                        Wait ((RevisedPublishingInterval * RevisedMaxKeepAliveCount) + 500) milliseconds and then call Publish() again.
    ExpectedResult:     All service and operation results are Good.
                        Both Publish calls immediately return a keep-alive notificationMessage.
     */

function createSubscription5101028()
{
    var subscription = new Subscription2( {
            PublishingInterval:1000,
            RequestedMaxKeepAliveCount:5 } );
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) )
    {
        UaDateTime.CountDown( { Msecs: subscription.RevisedPublishingInterval + 500 } );
        // test #1
        PublishHelper.Execute();

        // test #1 expectations state: publish #1 is a keepalive and sequenceNumber=1
        Assert.False( PublishHelper.CurrentlyContainsData(), "Expected a KeepAlive only. We have not added any monitored items to the subscription!" );
        Assert.Equal( 1, PublishHelper.Response.NotificationMessage.SequenceNumber, "The first sequence number should always be 1." );
        Assert.Equal( subscription.SubscriptionId, PublishHelper.Response.SubscriptionId, "Received Publish response in relation to an unexpected Subscription." );
        var timeTolerance = Number( Settings.ServerTest.TimeTolerance );
        Assert.InRange( 0, timeTolerance, PublishHelper.PublishDuration, "Expected the initial Publish response to be immediate." );

        UaDateTime.CountDown( { Msecs: ( subscription.RevisedPublishingInterval * subscription.RevisedMaxKeepAliveCount ) + 500 } );

        // test #2
        PublishHelper.Execute();

        // test #2 expectations state: publish #1 is a keepalive and sequenceNumber=1
        Assert.False( PublishHelper.CurrentlyContainsData(), "Expected a KeepAlive only. We have not added any monitored items to the subscription!" );
        Assert.Equal( 1, PublishHelper.Response.NotificationMessage.SequenceNumber, "The first sequence number should always be 1." );
        Assert.Equal( subscription.SubscriptionId, PublishHelper.Response.SubscriptionId, "Received Publish response in relation to an unexpected Subscription." );
        Assert.InRange( 0, timeTolerance, PublishHelper.PublishDuration, "Expected the second Publish response to be immediate." );

    }
    // Since we need to call deleteSubscriptions anyway, let's just use it to
    // validate if the subscription expired or not (i.e., the operation result
    // should be BadSubscriptionIdInvalid if the subscription expired before
    // its expected lifetime).
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: createSubscription5101028 } );