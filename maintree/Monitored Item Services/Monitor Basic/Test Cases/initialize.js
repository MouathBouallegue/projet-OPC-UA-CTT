include( "./library/Base/assertions.js" );
include( "./library/Base/array.js" );
include( "./library/Base/NodeTypeAttributesMatrix.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

var itemSettings = Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings.concat( Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings );
var maxMonitoredItems = (Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0 ? MAXMONITOREDITEMLIMITS : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems);

// make sure that we have some SCALAR nodes configured; if not then we can't continue
var MonitorBasicSubscription;
var scalarItems = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: maxMonitoredItems } );
if ( !isDefined( scalarItems ) || scalarItems.length === 0 ) {
    addSkipped( "Scalar settings not configured. Please check the UACTT settings and then re-run this conformance unit. Aborting conformance unit." );
    stopCurrentUnit();
}
else {
    if( Test.Connect() ) { // create a subscription that can be used for all tests in this conformance unit
        MonitorBasicSubscription = new Subscription();
        if( !CreateSubscriptionHelper.Execute( { Subscription: MonitorBasicSubscription } ) ) {
            stopCurrentUnit();
        }
        else {
            PublishHelper.Execute();
        }
        print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Basic' TEST SCRIPTS STARTING ******\n" );
    }
    else stopCurrentUnit();
}

// after each test, lets Reset the PublishHelper
function clearPublish() {
    print( "\n\n** Post Test Function: clearPublish() **\n" );
    PublishHelper.Execute( { AckAllAvailableSequenceNumbers: true, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoSubscription ] ) } );
    PublishHelper.Clear();
}

/**
 * This function can be used to delete the MonitoredItems created in the test scripts of this CU.
 * @param {any} createMonitoredItemsResponse A UaCreateMonitoredItemsResponse object, that contains the MonitoredItemsIds from the CreateMonitoredItem service
 * @returns The result of the DeleteMonitoredItems service (true or false)
 */
function deleteCreatedMonitoredItems( createMonitoredItemsResponse ) {
    if( !isDefined( createMonitoredItemsResponse ) || !isDefined( createMonitoredItemsResponse.Results ) ) {
        addError( "deleteCreatedMonitoredItems: Required parameter createMonitoredItemsResponse not specified." );
        return ( false );
    }
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( var i = 0; i < createMonitoredItemsResponse.Results.length; i++ ) {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }
    if( monitoredItemsIdsToDelete.length > 0 ) {
        return ( DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } ) );
    }
    else {
        return ( true );
    }
}

Test.PostTestFunctions.push( clearPublish );