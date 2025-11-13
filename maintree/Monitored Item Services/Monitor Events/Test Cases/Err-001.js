/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Specify an Event Filter on a Node that does not support Events. We expect error "Bad_FilterNotAllowed". */

function createMonitoredItems591err021() {
    var monitoredItem = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings )[0];
    if( isDefined( monitoredItem ) ) {
        monitoredItem.Filter = Event.GetEventFilter( [ "SourceName", "Message", "Severity", "ReceiveTime" ] );
        var subscription = new Subscription();
        if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
            var expectedError = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
            CreateMonitoredItemsHelper.Execute( {
                        ItemsToCreate: monitoredItem, 
                        TimestampsToReturn: TimestampsToReturn.Both,
                        SubscriptionId: subscription, 
                        OperationResults: expectedError } )

            DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
        }//createSubscription
    }//item exists
    else {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }// item does not exist
    return( true );
}// function createMonitoredItems591err021()

Test.Execute( { Procedure: createMonitoredItems591err021 } );