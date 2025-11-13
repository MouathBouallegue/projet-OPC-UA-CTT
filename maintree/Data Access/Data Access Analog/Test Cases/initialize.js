// General includes
include( "./library/Base/array.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/NodeTypeBased/AnalogItemType/EURange.js" );
include( "./library/ClassBased/UaQualifiedName/create_qualified_name.js" );
include( "./library/ClassBased/UaNodeId/create_nodeid.js" );
include( "./library/ServiceBased/Helpers.js" );

const SEMANTICCHANGE_BIT = 0x4000;
const WARNING_EURANGE_NOTWRITABLE = "Write() to EURange failed; either not supported or an access-rights violation.";
const WARNING_EUNITS_NOTWRITABLE = "Write() to EngineeringUnits failed; either not supported or an access-rights violation.";
const WARNING_INSTRANGE_NOTWRITABLE = "Write() to InstrumentRange failed; either not supported or an access-rights violation.";

// get an array of MonitoredItem objects, these will be used by all scripts in this Conformance Unit that do not need write access
var maxMonitoredItems = ( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0 ? MAXMONITOREDITEMLIMITS : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
var AnalogItems = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings, Number: maxMonitoredItems } );
// get an array of MonitoredItem objects for scripts that need write access
var WritableAnalogItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings, Writable: true, maxNumberNeeded: maxMonitoredItems } );

if( AnalogItems == null || AnalogItems.length == 0 ) {
    addSkipped( SETTING_UNDEFINED_DAANALOG );
    stopCurrentUnit();
}
else {
    if( !Test.Connect() ) stopCurrentUnit();
    else {
        // read their initial values and cache them so we can revert them at the end
        if( ReadHelper.Execute( { NodesToRead: AnalogItems, SuppressMessaging: true } ) ) {
            for( var i=0; i<AnalogItems.length; i++ ) AnalogItems[i].InitialValue = AnalogItems[i].Value.Value.clone();
        }
        // now to look at each configured AnalogItem to see if it has an EURange defined: 
        var euBrowsePaths = [];
        var translateResults = [];
        for( var i=0; i<AnalogItems.length; i++ ) {
            euBrowsePaths.push( UaBrowsePath.New( { StartingNode: AnalogItems[i], RelativePathStrings: [ "EURange" ] } ) );
            translateResults.push( new ExpectedResults( { Expected: [ StatusCode.Good, StatusCode.BadNoMatch ] } ) );
        }
        if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: euBrowsePaths, OperationResults: translateResults, SuppressMessaging: true } ) ) {
            var euRangeItems = [];
            for( var i=0; i<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; i++ ) {
                if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].StatusCode.isGood() ) {
                    euRangeItems.push( new MonitoredItem( TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].Targets[0].TargetId.NodeId ) );
                }//is good
            }//for i...
            if( euRangeItems.length > 0 ) {
                if( ReadHelper.Execute( { NodesToRead: euRangeItems } ) ) {
                    for( var i=0; i<ReadHelper.Response.Results.length; i++ ) {
                        AnalogItems[i].EURange = ReadHelper.Response.Results[i].Value.toExtensionObject().toRange();
                    }//for i
                }
            }
        }
        // clear PublishHelper after each test
        Test.PostTestFunctions.push( clearPublish );
    }
}

// clear PublishHelper after each test
function clearPublish() {
    PublishHelper.Clear();
}