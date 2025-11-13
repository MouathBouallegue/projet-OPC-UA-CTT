include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/testParallelSubscriptions.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/ServiceBased/Helpers.js" );

const ISDEBUG = false;
const SUBSCRIPTION_PUBLISH_MIN_05_PUBLISHCALLCOUNT   = 10;   // how many times to call Publish() per session
const SUBSCRIPTION_PUBLISH_MIN_05_SESSIONCREATECOUNT = 5; // how many sessions to create
const DO_NOT_VERIFY_WRITE = false;

var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: false, SkipCreateSession: false } );
var testItems = []; // these are the items that we will use for reading 
for (var i = 0; i < items.length; i++) {
    testItems.push(items[i]);
}

var writableItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
var writableTestItems = []; // these are the items that we will use for writing 
for (var i = 0; i < writableItems.length; i++) {
    writableTestItems.push( writableItems[i] );
}

if( !isDefined( testItems ) || testItems.length === 0 ) {
    addSkipped( "No items defined in settings. Please configure the CTT." );
    stopCurrentUnit();
}
else {
    if( !Test.Connect() ) {
        addError( "Unable to connect to Server. Aborting." );
        stopCurrentUnit();
    }
    else {
        // read the test-items and then store their original values
        if( ReadHelper.Execute( { NodesToRead: testItems } ) ) for( var i=0; i<testItems.length; i++ ) testItems[i].OriginalValue = testItems[i].Value.Value.clone(); // store the original value 
        // read the writable test-items if available
        if (isDefined(writableTestItems) && writableTestItems.length > 0) ReadHelper.Execute({ NodesToRead: writableTestItems });
        // after each test, rever the values of the test-items back to their initial state
        Test.PostTestFunctions[0] = __revertOriginalValues;
    }
}

function __revertOriginalValues() {
    var expectedResults = [];
    for( var i=0; i<testItems.length; i++ ) {
        testItems[i].Value.Value = testItems[i].OriginalValue.clone();
        expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNotWritable ] ) );
    }
    WriteHelper.Execute( { NodesToWrite: testItems, OperationResults: expectedResults } );
    Test.Disconnect();
    if( !Test.Connect() ) {
        addError( "Unable to connect to Server. Aborting." );
        stopCurrentUnit();
    }
}