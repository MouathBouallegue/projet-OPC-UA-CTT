include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// include all library scripts specific to browse tests
include( "./library/Base/array.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_error.js" );
include("./library/Information/IsSubTypeOfType.js");
include("./library/Information/GetTypeHierarchy.js");

var nodeClassItems = [];
var nodeClassParents = [];
var nodeClasses = [];
var nodesToBrowse = [];
var IsSubTypeOfTypeHelper = null;
var GetTypeHierarchyHelper = null;

// Connect to the server 
function startTests() {
    if( !Test.Connect() ) {
        addError( "Connect failed. Stopping execution of current conformance unit." );
        stopCurrentUnit();
    }
    else { 
        // cache the NodeId settings for the NodeClass tests
        nodeClassItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.NodeClasses.Settings );
        // do we have enough nodes for testing?
        if( 0 === nodeClassItems.length ) {
            addSkipped( "Will not be able to complete all tests. Zero nodes configured for nodeClass testing." );
            stopCurrentUnit();
            return( false );
        }
        else if( nodeClassItems.length !== Settings.ServerTest.NodeIds.NodeClasses.Settings.length ) {
            addLog( "Some NodeClasses will not be tested because they are not configured." );
        }

        for( var i=0; i<nodeClassItems.length; i++ ) {
            nodesToBrowse.push( nodeClassItems[i].NodeId );
            switch( nodeClassItems[i].NodeSetting ) {
                case "/Server Test/NodeIds/NodeClasses/Object":   nodeClasses.push( NodeClass.Object );   break;
                case "/Server Test/NodeIds/NodeClasses/Variable": nodeClasses.push( NodeClass.Variable ); break;
                case "/Server Test/NodeIds/NodeClasses/Method":   nodeClasses.push( NodeClass.Method );   break;
                case "/Server Test/NodeIds/NodeClasses/ObjectType":   nodeClasses.push( NodeClass.ObjectType );    break;
                case "/Server Test/NodeIds/NodeClasses/VariableType": nodeClasses.push( NodeClass.VariableType );  break;
                case "/Server Test/NodeIds/NodeClasses/ReferenceType":nodeClasses.push( NodeClass.ReferenceType ); break;
                case "/Server Test/NodeIds/NodeClasses/DataType":     nodeClasses.push( NodeClass.DataType );      break;
            }// switch
        }//for i..

        // now to get the parent nodes of each Node that has been selected for testing.
        for( var i=0; i<nodeClassItems.length; i++ ) nodeClassItems[i].BrowseDirection = BrowseDirection.Inverse;
        if( BrowseHelper.Execute( { NodesToBrowse: nodeClassItems } ) ) {
            if( Assert.Equal( nodeClassItems.length, BrowseHelper.Response.Results.length, "Browse.Response.Results length does not match expectations." ) ) {
                for( var i=0; i<BrowseHelper.Response.Results.length; i++ ) nodeClassParents.push( new MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[i].References[0].NodeId.NodeId )[0] );
            }//assert lengths
        }//browse success
        IsSubTypeOfTypeHelper = new IsSubTypeOfTypeService( { Session: Test.Session } );
        GetTypeHierarchyHelper = new GetTypeHierarchyService( { Session: Test.Session } );
    }
}

function findDerivedReferenceTypes( listOfReferenceTypeIds, desiredLevelOfInheritences ) {
    //now we need to walk through the list of references and see whether we find one which is derived from the current one
    for( var y = 0; y < listOfReferenceTypeIds.length; y++ ) {
        for( var z = 0; z < listOfReferenceTypeIds.length; z++ ) {
            if( z === y || listOfReferenceTypeIds[z].ReferenceTypeId.equals( listOfReferenceTypeIds[y].ReferenceTypeId ) ) continue;
            if( IsSubTypeOfTypeHelper.Execute( {
                ItemNodeId: listOfReferenceTypeIds[z].ReferenceTypeId,
                TypeNodeId: listOfReferenceTypeIds[y].ReferenceTypeId
            } ) );
            if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf == true ) {
                if( isDefined( desiredLevelOfInheritences ) ) {
                    // find the number of inheritence levels
                    GetTypeHierarchyHelper.Execute( { NodeToRead: listOfReferenceTypeIds[z].ReferenceTypeId } );
                    if( GetTypeHierarchyHelper.Response.NodesInHierarchy.length === desiredLevelOfInheritences ) return( true );
                    print( "ItemTypeId:" + listOfReferenceTypeIds[z].ReferenceTypeId.toString() + " is a SubType of TypeNodeId:" + listOfReferenceTypeIds[y].ReferenceTypeId.toString() + " but its inheritenceLevel(" + GetTypeHierarchyHelper.Response.NodesInHierarchy.length + " doesn't match the desire level (" + desiredLevelOfInheritences + ")!" );
                }
                else return( true );
            }
        }
    }
    return( false );
}

startTests();

print( "\n\n\n***** CONFORMANCE UNIT 'View Basic' TESTING STARTING ******\n" );