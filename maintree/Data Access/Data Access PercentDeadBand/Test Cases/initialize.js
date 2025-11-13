// utility functions
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/NodeTypeBased/AnalogItemType/EURange.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/writeToDeadbandAndCheckWithPublish.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );

const OVERFLOWBIT = 0x480;

var items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.NumericSettings );
var item;
var MonitorBasicSubscription;
if( items == undefined || items == null || items.length == undefined || items.length < 1 ) {
    addSkipped( SETTING_UNDEFINED_DAANALOG );
    stopCurrentUnit();
}
else {
    item = items[0];
    if( !Test.Connect() ) {
        addError( "Unable to Connect to Server. Please check settings." );
        stopCurrentUnit();
    }
    else {
        // create a subscription that can be used for all tests in this Conformance Unit.
        MonitorBasicSubscription = new Subscription();  
        CreateSubscriptionHelper.Execute( { Subscription: MonitorBasicSubscription } );
    }
}

function _getEURange( items ) {
    for( var i=0; i<items.length; i++ ) {
        items[i].EURange = GetNodeIdEURange( items[i].NodeSetting );
        if( items[i].EURange === null || items[i].EURange === undefined ) {
            addError( "Test aborted: Setting '" + items[i].NodeSetting + "' did not yield a valid nodeId containing an EURange to test." );
            return( false );
        }
        addLog( items[i].NodeSetting + ": EURange is '" + items[i].EURange + "'." );
    }
}

function _setValuesToMiddleValue( items ) {
    // check that we have euranges first; if not, go get them
    if( items[0].EURange == undefined ) _getEURange( items );
    // set the midway values...
    for( var i=0; i<items.length; i++ ) {
        var midwayValue = GetEURangeMidPoint( items[i].EURange.Low, items[i].EURange.High );
        items[i].SafelySetValueTypeKnown( midwayValue, items[i].DataType );
        addLog( items[i].NodeSetting + ": setting initial value to '" + items[i].Value.Value + "'." );
    }
    if( !WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } ) ) return( false );
}