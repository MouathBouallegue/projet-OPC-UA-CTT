include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/basicCreateMonitoredItemsTest.js" );
include( "./library/ServiceBased/Helpers.js" );

// check we have some items to use
var items = MonitoredItem.GetRequiredNodes( { Number: 10, Settings: Settings.ServerTest.NodeIds.Static.Settings } );

if( !isDefined( items ) || items.length === 0 ) {
    addSkipped( "No scalar items are defined. Please check your settings." );
    stopCurrentUnit();
}

var defaultSubscription = new Subscription();

if( !Test.Connect() ) {
    addError( "Connect failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}
else {
    if( !CreateSubscriptionHelper.Execute( { Subscription: defaultSubscription } ) ) { 
        stopCurrentUnit();
    }
}