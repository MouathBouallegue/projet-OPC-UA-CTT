/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de  */
include( "./library/Base/safeInvoke.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

Identifier.ServerType_ResendData = 12871;
Identifier.ServerType_ResendData_InputArguments = 12872;
Identifier.Server_ResendData = 12873;
Identifier.Server_ResendData_InputArguments = 12874;

var CU_Variables = new Object();
CU_Variables.LocalModelMapService = new BuildLocalCacheMapService();
CU_Variables.LocalModelMap = CU_Variables.LocalModelMapService.GetModelMap();


if( !Test.Connect() ) stopCurrentUnit();
else {
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session.Session } );

    CU_Variables.ResendData = new Object();
    CU_Variables.ResendData.TypeSystemNode = new MonitoredItem( new UaNodeId( Identifier.ServerType_ResendData ) );
    CU_Variables.ResendData.InstanceNode = new MonitoredItem( new UaNodeId( Identifier.Server_ResendData ) );

    CU_Variables.References = CU_Variables.LocalModelMap.Get( CU_Variables.ResendData.InstanceNode.NodeId.toString() );
    if( !isDefined( CU_Variables.References ) || !isDefined( CU_Variables.References.ReferenceDescriptions ) ) {
        addNotSupported( "ResendData method is not supported in the server. Aborting ConformanceUnit." );
        stopCurrentUnit();
    }
}

// get the parent node of a specified node
function init_GetMethodParent( methodNodeId ) {
    var parentObject = null;
    methodNodeId.BrowseDirection = BrowseDirection.Inverse;
    var hasComponentNodeId = new UaNodeId( Identifier.HasComponent );
    if( BrowseHelper.Execute( { NodesToBrowse: methodNodeId, SuppressMessaging: true } ) ) {   // browse our method node for inverse references
        for( var i = 0; i < BrowseHelper.Response.Results.length; i++ ) {                          // iterate thru all browse results
            if( BrowseHelper.Response.Results[i].StatusCode.isGood() ) {                       // we care for good results only
                for( var r = 0; r < BrowseHelper.Response.Results[i].References.length; r++ ) {    // iterate thru all returned references for *this* result
                    if( BrowseHelper.Response.Results[i].References[r].ReferenceTypeId.equals( hasComponentNodeId ) ) { // HasComponent?
                        parentObject = MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[i].References[r].NodeId.NodeId )[0]; // capture the parent object
                        break;                                                                       // exit this inner loop; outer loop exited next.
                    }
                }// for r...
            }// is good
            if( parentObject !== null ) break;                                                       // escape the loop if the object is defined
        }//for i...
    }// browse
    return ( parentObject );
}
