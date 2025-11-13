/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: In a loop of 3, check the Current/CumulatedSubscriptionCount diagnostic properties for the subscription */

Test.Execute( { Procedure: function test() {
    // get the initial value of the diagnostics
    if( ReadHelper.Execute( { NodesToRead: [ _currSubsCountNode, _cumulSubsCountNode ] } ) ) {
        _currSubsCountNode.InitialValue  = _currSubsCountNode.Value.Value.clone();
        _cumulSubsCountNode.InitialValue = _cumulSubsCountNode.Value.Value.clone();

        // create some items for our subscriptions
        var items = MonitoredItem.GetRequiredNodes( { Number: 3, Settings: Settings.ServerTest.NodeIds.Static.All() } );
        if( !isDefined( items ) || items.length == 0 ) { addSkipped( "No static items configured to test with. Skipping test." ); return( false ); }
    
        // create a subscription
        var subscriptions = [];

        // this is where we do our test 3 times
        for( var i=0; i<3; i++ ) {
            subscriptions.push( new Subscription() );
            // create the subscription
            if( CreateSubscriptionHelper.Execute( { Subscription: subscriptions[i] } ) ) {

                // add the monitored items
                if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscriptions[i], ItemsToCreate: items[i] } ) ) {
                    // check the diagnostic again...
                    if( ReadHelper.Execute( { NodesToRead: [ _currSubsCountNode, _cumulSubsCountNode ] } ) ) {
                        Assert.GreaterThan( _currSubsCountNode.InitialValue.toUInt32(),  _currSubsCountNode.Value.Value.toUInt32(), "CurrentSubscriptionCount expected to grow.", "CurrentSubscriptionCount grew to: " + _currSubsCountNode.Value.Value.toUInt32() );
                        Assert.GreaterThan( _cumulSubsCountNode.InitialValue.toUInt32(), _cumulSubsCountNode.Value.Value.toUInt32(), "CumulatedSubscriptionCount expected to grow.", "CumulatedSubscriptionCount grew to: " + _cumulSubsCountNode.Value.Value.toUInt32() );
                        // record the current values ready for the next test
                        _currSubsCountNode.InitialValue  = _currSubsCountNode.Value.Value.clone();
                        _cumulSubsCountNode.InitialValue = _cumulSubsCountNode.Value.Value.clone();
                    }
                }// create monitored items
            }// create subscription
        }// for i...

        // clean-up
        for( var i=0; i<3; i++ ) DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscriptions[i], ItemsToDelete: items[i] } );
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptions } );

    }
    return( true );
} } );