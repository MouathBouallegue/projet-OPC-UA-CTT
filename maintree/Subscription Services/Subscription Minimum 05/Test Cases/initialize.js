include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/testParallelSubscriptions.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/dictionary.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );

include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

// some helpful constants
const DO_NOT_VERIFY_WRITE = false;
const DO_NOT_ACK_SEQUENCE = true;
const SUBSCRIPTIONCOUNT = 5;

// setup a default monitoredItem that we can use for the scripts within this CU.
var monitoredItem;
function InitSubscriptionMin5() {
    monitoredItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: false, SkipCreateSession: false } );
    if( monitoredItem === undefined || monitoredItem === null || monitoredItem.length < 1 ) {
        addSkipped( "Conformance unit skipped. Please check settings." );
        stopCurrentUnit();
    }
    else {
        monitoredItem = monitoredItem[0];
    }
    
    WritableMonitoredItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
    if( WritableMonitoredItem !== undefined && WritableMonitoredItem !== null && WritableMonitoredItem.length !== 0 ) WritableMonitoredItem = WritableMonitoredItem[0];
}
InitSubscriptionMin5();

function defaultConnection() {
    return( Test.Connect() );
}

function clearPublish() { 
    PublishHelper.Clear();
}

if( !defaultConnection() ) stopCurrentUnit();
else Test.PostTestFunctions.push( clearPublish );