include( "./library/Base/safeInvoke.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

var CU_Variables = new Object();
CU_Variables.LocalModelMapService = new BuildLocalCacheMapService();
CU_Variables.LocalModelMap = CU_Variables.LocalModelMapService.GetModelMap();

if( !Test.Connect() ) {
    addError( "Could not connect to the UA Server. Aborting conformance unit." );
    stopCurrentUnit();
}
else {
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session.Session } );
    if( !isDefined( Attribute.AccessLevelEx ) ) Attribute.AccessLevelEx = 27;
}
