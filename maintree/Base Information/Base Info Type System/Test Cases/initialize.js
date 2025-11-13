include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/Helpers.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Information/_Base/NodeIsOfCompliantType.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds.js" );
include( "./library/Information/NodeSet2.xml/NodeVerification.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

var _rootNode              = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.RootFolder ) )[0];

// Connect to the server
if( !Test.Connect() ) {
    addError( "Unable to connect and establish a session");
    stopCurrentUnit();
}
else {
    var CU_Variables = new Object();
    CU_Variables.LocalCacheMapService = new BuildLocalCacheMapService();
    CU_Variables.LocalModelMap = CU_Variables.LocalCacheMapService.GetModelMap();
    print( "\n\n\n***** CONFORMANCE UNIT 'Base Info Type System' TESTING BEGINS ******\n" );
} //activateSession