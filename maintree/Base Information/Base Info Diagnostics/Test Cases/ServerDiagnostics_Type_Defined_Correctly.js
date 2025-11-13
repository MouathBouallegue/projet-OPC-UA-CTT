/*  Test 1 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Tests the SERVERDIAGNOSTICS object in the Servers address space. */

function testServerObject() {
    // variables and objects needed for the test
    return( TBPTNI.CheckChildStructure( {
            StartingNode:  MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics ) )[0], 
            ObjectDefinition: serverDiagnostics, 
            TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper,
            SuppressMessaging: true
            } ) );
}

function checkSubscriptionDiags() {
    // get the references under SubscriptionDiagnosticsSummary
    var root = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SubscriptionDiagnosticsArray ) )[0];
    if( !BrowseHelper.Execute( { NodesToBrowse: root } ) ) return( false );
    // now to iteratively walk through each of the found items, if any, and check their complex structure
    var result = true;
    if( 0 == BrowseHelper.Response.Results[0].References.length ) notSupported( "Subscription Diagnostics are not supported." );
    for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) {
        if( BrowseHelper.Response.Results[0].References[i].IsForward == true &&
            BrowseHelper.Response.Results[0].References[i].ReferenceTypeId.equals( new UaNodeId( Identifier.HasComponent ) ) ) {
                result &= TBPTNI.CheckChildStructure( {
                    StartingNode:  MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[0].References[i].NodeId.NodeId )[0], 
                    ObjectDefinition: subscriptionDiagnostics, 
                    TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper,
                    SuppressMessaging: true
                    } );
            }
    }
    return( result );
}

function checkSessionDiags() {
    // get the references under SubscriptionDiagnosticsSummary
    var root = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SessionsDiagnosticsSummary_SessionDiagnosticsArray ) )[0];
    if( !BrowseHelper.Execute( { NodesToBrowse: root } ) ) return( false );
    // now to iteratively walk through each of the found items, if any, and check their complex structure
    var result = true;
    if( 0 == BrowseHelper.Response.Results[0].References.length ) notSupported( "Session Diagnostics are not supported." );
    for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) {
        if( BrowseHelper.Response.Results[0].References[i].IsForward == true &&
            BrowseHelper.Response.Results[0].References[i].ReferenceTypeId.equals( new UaNodeId( Identifier.HasComponent ) ) ) {
                result &= TBPTNI.CheckChildStructure( {
                    StartingNode:  MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[0].References[i].NodeId.NodeId )[0], 
                    ObjectDefinition: sessionDiagnostics, 
                    TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper,
                    SuppressMessaging: true
                    } );
            }
    }
    return( result );
}

function testStructure() {
    var result = testServerObject();
    result &= checkSubscriptionDiags();
    result &= checkSessionDiags();
    return( result );
}

Test.Execute( { Debug: true, Procedure: testStructure } );