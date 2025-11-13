include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/ServiceBased/AttributeServiceSet/Write/writeMask_writeValues.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

addLog( "TESTING AN -- OPTIONAL -- CONFORMANCE UNIT" );

var VQTsupport = UaVQTSupport.None;
var WriteExpectedResult = new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadWriteNotSupported ] );

// get some items that we can use throughout this CU
var scalarNodes = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
if( scalarNodes == null || scalarNodes.length < 1 ) {
    addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
    stopCurrentUnit();
}
// read the original values of all scalar types, because we will revert to their original values at the end of the test 
var originalScalarValues = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: false } );
if (originalScalarValues !== null && originalScalarValues.length !== 0) {
    if (!Test.Connect()) stopCurrentUnit();
    else {
        if (!ReadHelper.Execute({ NodesToRead: originalScalarValues })) {
            addError("Unable to read the initial values of the test nodes. Aborting testing.");
            stopCurrentUnit();
        }
        else {
            for (var i = 0; i < originalScalarValues.length; i++) originalScalarValues[i].OriginalValue = originalScalarValues[i].Value.Value.clone();
        }
    }
}

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TESTS STARTING ******\n" );