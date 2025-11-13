include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );

include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/writeToDeadbandAndCheckWithPublish.js" );
include( "./library/ServiceBased/Helpers.js" );

var __republishNotSupported = false;
var subSessionThread = new SessionThread();

function initialize() {
    Test.Connect( );
    subSessionThread.Start( { Session: Test.Session } );
    return ( Test.Session.Session.Connected );
}// function initialize()

function setInitialLargeFiletypeValues( items ) { 
    if( !isDefined( items ) ) return( false );
    for( var i=0; i<items.length; i++ ) {
        items[i].OriginalValues = items[i].Value.Value.clone();
        if( items[i].Value.Value.DataType === BuiltInType.Int64 )       items[i].Value.Value.setInt64( 0 );
        else if( items[i].Value.Value.DataType === BuiltInType.UInt64 ) items[i].Value.Value.setUInt64( 0 );
        else if( items[i].Value.Value.DataType === BuiltInType.Double ) items[i].Value.Value.setDouble( 0 );
        else if( items[i].Value.Value.DataType === BuiltInType.Float )  items[i].Value.Value.setFloat( 0 );
    }
    WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
}// function captureOriginalValues( items )

// check the fastest support publishingInterval setting
var fastestPublishingIntervalSupported = gServerCapabilities.FastestPublishIntervalSupported;

var defaultStaticItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: false, SkipCreateSession: false } );
if( defaultStaticItem !== undefined && defaultStaticItem !== null && defaultStaticItem.length !== 0 ) {
    defaultStaticItem = defaultStaticItem[0];
    defaultStaticItem.DataType = UaNodeId.GuessType( defaultStaticItem.NodeSetting );
}

var WritableDefaultStaticItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
if( WritableDefaultStaticItem !== undefined && WritableDefaultStaticItem !== null && WritableDefaultStaticItem.length !== 0 ) {
    WritableDefaultStaticItem = WritableDefaultStaticItem[0];
    WritableDefaultStaticItem.DataType = UaNodeId.GuessType( WritableDefaultStaticItem.NodeSetting );
}

var maxMonitoredItems = (Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0 ? MAXMONITOREDITEMLIMITS : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems);

var SubscriptionMonitoredItems = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems, Writable: false, SkipCreateSession: true });
var WritableSubscriptionMonitoredItems = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems, Writable: true, SkipCreateSession: true });

if( initialize() ) {
    Test.PostTestFunctions.push( clearPublish );
    // obtain the current value of our default statis item
    if( isDefined( defaultStaticItem ) && defaultStaticItem.length !== 0 ) ReadHelper.Execute( { NodesToRead: defaultStaticItem } );
    if( isDefined( WritableDefaultStaticItem ) && WritableDefaultStaticItem.length !== 0 ) ReadHelper.Execute( { NodesToRead: WritableDefaultStaticItem } );
    // clone the value
    if( isDefined( defaultStaticItem ) && defaultStaticItem.length !== 0 ) defaultStaticItem.OriginalValue = defaultStaticItem.Value.Value.clone();
    if( isDefined( WritableDefaultStaticItem ) && WritableDefaultStaticItem.length !== 0 ) WritableDefaultStaticItem.OriginalValue = WritableDefaultStaticItem.Value.Value.clone();
}
else stopCurrentUnit();

// after each test, lets Reset the PublishHelper
function clearPublish() {
    print( "\n\n** Post Test Function: clearPublish() **\n" );
    var serviceResults = new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoSubscription ] );
    PublishHelper.Execute( { AckAllAvailableSequenceNumbers: true, 
                             SkipValidation: true,
                             SuppressMessaging: false } );
    PublishHelper.Clear();
}