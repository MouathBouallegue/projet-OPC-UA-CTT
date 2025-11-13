include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/dictionary.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );

include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/testParallelSubscriptions.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

// setup a default monitoredItem that we can use for the scripts within this CU.
var defaultStaticItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: false, SkipCreateSession: false } );
if( defaultStaticItem == undefined || defaultStaticItem == null || defaultStaticItem.length < 1 ) {
    addSkipped( "Static Scalar (numeric)" );
    stopCurrentUnit();
}
else {
    defaultStaticItem = defaultStaticItem[0];
    defaultStaticItem.DataType = UaNodeId.GuessType( defaultStaticItem.NodeSetting );
    // setup a default writable monitoredItem that we can use for the scripts within this CU.
    var writableDefaultStaticItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
    if( writableDefaultStaticItem !== undefined && writableDefaultStaticItem !== null && writableDefaultStaticItem.length !== 0 ) {
        writableDefaultStaticItem = writableDefaultStaticItem[0];
        writableDefaultStaticItem.DataType = UaNodeId.GuessType( writableDefaultStaticItem.NodeSetting );
    }
}
if( !Test.Connect() ) {
    addError( "Unable to connect to Server. Please check settings." );
    stopCurrentUnit();
}