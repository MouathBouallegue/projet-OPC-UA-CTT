include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );

if( !Test.Connect() ) stopCurrentUnit();

// the GetMonitoredItems node
var gmiNodeId = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_GetMonitoredItems ) )[0];
var gmiObject = GetMethodParent( gmiNodeId );