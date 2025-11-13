include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/Helpers.js" );


var ISDEBUG=false;

var maxMonitoredItems = (Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0 ? MAXMONITOREDITEMLIMITS : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems);

var items = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems, Writable: false, SkipCreateSession: true });
var testItems = []; // these are the items that we will use for reading 
for (var i = 0; i < items.length; i++) {
    testItems.push(items[i]);
}

var writableItems = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems, Writable: true, SkipCreateSession: true });
var writableTestItems = []; // these are the items that we will use for writing 
for (var i = 0; i < writableItems.length; i++) {
    writableTestItems.push(writableItems[i]);
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
        print( "Trying to get initial values for reverting after the test." );
        if( ReadHelper.Execute( { NodesToRead: testItems } ) ) for( var i=0; i<testItems.length; i++ ) testItems[i].OriginalValue = testItems[i].Value.Value.clone(); // store the original value 
        else {
            addError("Unable to get initial values. Aborting.");
            stopCurrentUnit();
        }
        // after each test, rever the values of the test-items back to their initial state
        Test.PostTestFunctions.push( __revertOriginalValues );
    }
}

function __revertOriginalValues() {
    if( Test.Channel.Channel.IsConnected === true ) {
        var expectedResults = [];
        for( var i=0; i<testItems.length; i++ ) {
            testItems[i].Value.Value = testItems[i].OriginalValue.clone();
            expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNotWritable ] ) );
        }
        WriteHelper.Execute( { NodesToWrite: testItems, OperationResults: expectedResults } );
    }
    Test.Disconnect();
    if( !Test.Connect() ) {
        addError( "Unable to connect to Server. Aborting." );
        stopCurrentUnit();
    }
}