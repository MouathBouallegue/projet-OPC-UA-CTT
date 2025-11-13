include( "./library/Base/safeInvoke.js" );
include( "./library/NodeTypeBased/AnalogItemType/MultiStateDiscreteType.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/direction_test.js" );
include( "./library/ClassBased/DerivesFrom.js" );

// check if we have enough settings to proceed with testing this conformance unit
var itemsForTesting = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.DiscreteItemType.MultiStateDiscretes );
var maxMonitoredItems = ( Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems == 0? Settings.ServerTest.NodeIds.Static.DAProfile.DiscreteItemType.MultiStateDiscretes.length : Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems );
var multiStateItems = [];//MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.DiscreteItemType.MultiStateDiscretes, Number: maxMonitoredItems } );

if( !isDefined( itemsForTesting ) || itemsForTesting.length == 0 ) { 
    addSkipped( SETTING_UNDEFINED_DADISCRETE );
    stopCurrentUnit();
}
else {

    if( !Test.Connect() ) {
        addError( "Unable to Connect to Server. Please check settings." );
        stopCurrentUnit();
    }
    else {
        // read the nodes that we'll use for testing and then cache the initial values
        if( ReadHelper.Execute( { NodesToRead: itemsForTesting } ) ) for( var i=0; i<itemsForTesting.length; i++ ) itemsForTesting[i].InitialValue = itemsForTesting[i].Value.Value.clone();
        Test.PostTestFunctions.push( resetStats );
        // now to prepare the large quantity of items needed for testing. We will do this by cloning our items that we've previously read 
        // because this will also clone the initial value.
        var i=0;
        while( multiStateItems.length < maxMonitoredItems ) {
            multiStateItems.push( itemsForTesting[i].clone() );
            if( i++ == ( itemsForTesting.length - 1 ) ) i = 0;
        }

        var multiStateValueDiscreteItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.MultiStateValueDiscreteType.Settings );
        if( multiStateValueDiscreteItems.length > 0 ) {
            var multiStateLength = Settings.ServerTest.NodeIds.Static.DAProfile.MultiStateValueDiscreteType.Settings.length;
            if( !ReadHelper.Execute( { NodesToRead: multiStateValueDiscreteItems } ) ) stopCurrentUnit();
            else {
                i = 0;
                while( multiStateValueDiscreteItems.length < maxMonitoredItems ) {
                    multiStateValueDiscreteItems.push( multiStateValueDiscreteItems[i].clone() );
                    if( i++ == multiStateLength ) i = 0;
                }
            }
        }// we have multiStateValueDiscreteItems?
        else { 
            addSkipped( SETTING_UNDEFINED_DAMULTISTATE );
            notSupported( "MultiStateValueDiscreteItemType" );
        }

    }
}

// methods to invoke after each test
function resetStats() {
    ReadHelper.Clear();
    WriteHelper.Clear();
    // reset the values of the items we're testing...
    for( var i=0; i<itemsForTesting.length; i++ ) itemsForTesting[i].Value.Value = itemsForTesting[i].InitialValue.clone();
    WriteHelper.Execute( { NodesToWrite: itemsForTesting, ReadVerification: false, SuppressMessaging: true } );
}