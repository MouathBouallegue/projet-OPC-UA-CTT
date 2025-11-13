/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the Current/CumulatedSubscriptionCount diagnostic properties for the subscription */

Test.Execute( { Procedure: function test() {
    // get the initial value
    if( ReadHelper.Execute( { NodesToRead: [ _currSubsCountNode, _cumulSubsCountNode ] } ) ) {
        _currSubsCountNode.InitialValue  = _currSubsCountNode.Value.Value.clone();
        _cumulSubsCountNode.InitialValue = _cumulSubsCountNode.Value.Value.clone();

        // create a subscription
        var subscription = new Subscription();
        if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {

            // check the diagnostic again...
            if( ReadHelper.Execute( { NodesToRead: [ _currSubsCountNode, _cumulSubsCountNode ] } ) ) {
                Assert.GreaterThan( _currSubsCountNode.InitialValue.toUInt32(),  _currSubsCountNode.Value.Value.toUInt32(), "CurrentSubscriptionCount expected to grow." );
                Assert.GreaterThan( _cumulSubsCountNode.InitialValue.toUInt32(), _cumulSubsCountNode.Value.Value.toUInt32(), "CumulatedSubscriptionCount expected to grow." );
            }

            DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        }

    }
    return( true );
} } );