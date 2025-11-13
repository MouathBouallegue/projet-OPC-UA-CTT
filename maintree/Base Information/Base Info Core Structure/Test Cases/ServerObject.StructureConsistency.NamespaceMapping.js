/*  Test 1 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Tests the SERVER object in the Servers address space.

    November 2015: ServerDiagnostics are removed from the ServerObject despite being marked as Mandatory in the specifications (Part 3 Table 8), they are NOT intended to be used in 
                   embedded devices. This was discussed at length in the UA Working Group on Nov-10-2015 (CTT Release Day) with the final decision being to update Part 7 to add text
                   that says mandatory functionality can be made optional within profiles, such as with this case. An errata will be released shortly. */

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );
include("./library/Information/_Base/NodeContainsSubStructure.js");
include("./library/Information/InfoFactory.js");
include("./library/Information/NodeSet2.xml/UaNodeSetFileV104.js");

var namespaces = [
    "http://opcfoundation.org/UA/"
]

var objectCheckingResults = new Array();
var objectCheckedResults = new Array();
var NamespaceIndex = null;

// Update the ServerDiagnostics object definition if EnabledFlag is set to false
function updateServerDiagnostics( uaObject ) {
    if ( !isDefined( uaObject.length ) ) uaObject = [uaObject];
    for ( var i = 0; i < uaObject.length; i++ ) {
        if( uaObject[i].NodeId == new UaNodeId( Identifier.ServerDiagnosticsType ).toString() ||
            uaObject[i].NodeId == new UaNodeId( Identifier.SessionsDiagnosticsSummaryType ).toString() ) {
            for ( var s = 0; s < uaObject[i].References.length; s++ ) {
                for ( var v = 0; uaObject[i].References[s].References.length; v++ ) {
                    if ( new UaNodeId( eval( uaObject[i].References[s].References[v].ReferenceTypeId ) ) == new UaNodeId( Identifier.HasModellingRule ).toString() ) {
                        uaObject[i].References[s].References[v].NodeId = UaNodeId( 80 ).toString();
                        break;
                    }
                }
                uaObject[i].References[s].MaybeNotReadable = true;
            }
        }
        if ( uaObject[i].SubObjects !== undefined && uaObject[i].SubObjects.length !== undefined ) {
            for ( var t = 0; t < uaObject[i].SubObjects.length; t++ ) {
                updateServerDiagnostics( uaObject[i].SubObjects[t] );
            }
        }
    }
}

/* Corrects the NamespaceIndex associated with a specified NodeId. */
function fixNamespaceIndex(stringNID, newNamespaceIndex) {
    if (stringNID == undefined || stringNID == null || newNamespaceIndex == undefined || newNamespaceIndex == null) return (false);
    if (newNamespaceIndex == 0) return (stringNID);
    var newNID = "ns=" + newNamespaceIndex + stringNID.substring(stringNID.lastIndexOf(";"));
    return (newNID);
}

/* Updates the object definition defined in the CTT so that its definition matches what is
   defined within the server, specifically the NamespaceIndex. */
function updateObject(uaObject, oldNamespaceIndex, newNamespaceIndex) {
    if (uaObject == undefined || newNamespaceIndex == undefined) return;
    newNamespace = parseInt(newNamespaceIndex);
    if (uaObject.NodeId !== undefined) {
        uaObject.NodeId = UaNodeId.fromString(fixNamespaceIndex(uaObject.NodeId.toString(), newNamespaceIndex));
        uaObject.BrowseName = uaObject.BrowseName.replace(oldNamespaceIndex + ":", newNamespaceIndex + ":");
    }
    // does this object have references? if so, update them too
    if (uaObject.References !== undefined && uaObject.References.length !== undefined) {
        for (var r = 0; r < uaObject.References.length; r++) {
            uaObject.References[r].NodeId = UaNodeId.fromString(fixNamespaceIndex(uaObject.References[r].NodeId, newNamespace));
            uaObject.References[r].BrowseName = uaObject.References[r].BrowseName.replace(oldNamespaceIndex + ":", newNamespaceIndex + ":");
        }
    }
    // does this object have nested types/ if so, update them and go recursive
    if (uaObject.SubObjects !== undefined && uaObject.SubObjects.length !== undefined) {
        for (var s = 0; s < uaObject.SubObjects.length; s++) {
            uaObject.SubObjects[s].NodeId = UaNodeId.fromString(fixNamespaceIndex(uaObject.SubObjects[s].NodeId, newNamespaceIndex));
            uaObject.SubObjects[s].BrowseName = uaObject.SubObjects[s].BrowseName.replace(oldNamespaceIndex + ":", newNamespaceIndex + ":");
            updateObject(uaObject.SubObjects[s], oldNamespaceIndex, newNamespaceIndex);
        }//for s...
    }
}

/* Recusively browses the definition of an Object while comparing its definition to
   that which is defined within the CTT. */
function checkObject( uaObject ) {
    print( "\n\n" );
    // check whether the type (uaObject) is available in the TypeSystem of the server
    var currentType = CU_Variables.LocalModelMap.Get( uaObject.NodeId.toString() );
    if( isDefined( currentType ) &&
        isDefined( currentType.ReferenceDescriptions ) &&
        currentType.ReferenceDescriptions.length > 0 ) {
        // now to check each object definition is properly represented in the type system
        TBPTNI.CheckChildStructure( {
            StartingNode: MonitoredItem.fromNodeIds( uaObject.NodeId )[0],
            ObjectDefinition: uaObject,
            TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper
        } );
        // check each sub-object
        if( uaObject.SubObjects !== undefined && uaObject.SubObjects.length !== undefined ) {
            for( var s = 0; s < uaObject.SubObjects.length; s++ ) {
                checkObject( uaObject.SubObjects[s] );
            }//for s...
        }// do we have sub-objects defined?
    }
    else {
        var typeResult = new Object();
        typeResult.status = false;
        typeResult.TypeNodeId = uaObject.NodeId;
        CU_Variables.LocalModelMap.Iterate( findNodesOfflineForBaseInfoCore, typeResult );

        // For all profiles: If no instance of the Type is present in the address space of the server -> Skipped
        // For Standard and Embedded: If an instance is present of a non existing Type -> Error
        // For Nano and Micro:  If an instance is present of a non existing (UA) Type -> Not supported
        // For Nano and Micro:  If an instance is present of a non existing (vendor) Type -> Error

        if( Settings.ServerTest.ExposeTypeSystem == true ) {
            addError( "Unable to find the TypeDefinition for '" + uaObject.NodeId.toString() + " in the TypeSystem of the server even though 'Server Test/Full Exposed Type System' is set." );
        }
        else {
            if( typeResult.status ) {
                if( uaObject.NodeId.NamespaceIndex == 0 ) {
                    if( ArrayContains( gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/NanoEmbeddedDevice2017" ) ||
                        ArrayContains( gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/MicroEmbeddedDevice2017" ) ||
                        ArrayContains( gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/NanoEmbeddedDevice" ) ||
                        ArrayContains( gServerCapabilities.ServerProfileArray, "http://opcfoundation.org/UA-Profile/Server/MicroEmbeddedDevice" ) ) {
                        addNotSupported( "Unable to find the TypeDefinition for '" + uaObject.NodeId.toString() + " in the TypeSystem of the server, but an instance of that type has been found. This is allowed only for servers supporting the Nano Embedded Device Profile or the Micro Embedded Device Profile." );
                    }
                    else {
                        addError( "Unable to find the TypeDefinition for '" + uaObject.NodeId.toString() + " in the TypeSystem of the server, but an instance of that type has been found. Servers, supporting the Embedded UA Server Profile or higher, must expose all used types." );
                    }
                }
                else addError( "Unable to find the TypeDefinition for '" + uaObject.NodeId.toString() + " in the TypeSystem of the server, but an instance of that type has been found. All types not defined in NamespaceIndex 0 must be exposed." );
            }
        }
    }
}

function testServerObject () {
    // Is the session connected?
    if (Test.Session.Session.Connected) {
        if (uaStandardObjects.length == undefined || uaStandardObjects.length == null) uaStandardObjects = [uaStandardObjects]; // turn the object into an array, if not already

        // read the namespace index array because we will need to dynamically update our info model nodeids
        var namespaceArray = MonitoredItem.fromNodeIds(new UaNodeId(Identifier.Server_NamespaceArray))[0];
        if (ReadHelper.Execute({ NodesToRead: namespaceArray })) {
            // find the namespace item
            if (namespaceArray.Value.StatusCode.isGood()) {
                var serversNamespaces = namespaceArray.Value.Value.toStringArray();
                // iterate through each namespace in our array
                for (var n = 0; n < namespaces.length; n++) {
                    for (var s = 0; s < serversNamespaces.length; s++) {
                        if (serversNamespaces[s] == namespaces[n]) {
                            namespaces[n] = { Namespace: namespaces[n], NamespaceIndex: s, OldNamespaceIndex: n + 1};
                            NamespaceIndex = s;
                            break;
                        }// found a hit?
                    }// iterate thru all servers' namespaces
                }// iterate thru all namespaces to find ours...

                // iterate through all namespace indexes and then do a global search/replace on each defined object...
                for (var n = 0; n < namespaces.length; n++) {
                    for (var o = 0; o < uaStandardObjects.length; o++) {
                        updateObject(uaStandardObjects[o], namespaces[n].OldNamespaceIndex, namespaces[n].NamespaceIndex); // replace all nodeids with the updated namespace
                    }
                }

                // STEP 1) now to read the structures in the addresss space to confirm they match the structure of this script
                print("\n\nSTEP 1: Check object definitions as currently defined in script...");
                for (var i = 0; i < uaStandardObjects.length; i++) checkObject(uaStandardObjects[i]); // replace all nodeids with the updated namespace

                // STEP 1b) Errata 1.03.1: When diagnostics are turned off, the Server can return Bad_NodeIdUnknown for all static diagnostic Nodes except the EnabledFlag Property. Dynamic diagnostic Nodes (such as the Session Nodes) will not appear in the AddressSpace. 
                var enabledFlag = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ) )[0];
                ReadHelper.Execute( { NodesToRead: enabledFlag } );
                if( isDefined( enabledFlag ) && isDefined( enabledFlag.Value ) && isDefined( enabledFlag.Value.Value ) && enabledFlag.Value.Value == false ) {
                    for( var i = 0; i < uaStandardObjects.length; i++ ) {
                        if( uaStandardObjects[i].SubObjects !== undefined && uaStandardObjects[i].SubObjects.length !== undefined ) {
                            for( var t = 0; t < uaStandardObjects[i].SubObjects.length; t++ ) {
                                updateServerDiagnostics( uaStandardObjects[i].SubObjects[t] );
                            }
                        }
                    }
                }

                // STEP 2) walk through the address-space, starting at 'Objects', and look for object instances that we can
                //         check for compliance against their type-definition.
                print("\n\nSTEP 2: Walk through address-space checking instances...");
                var objectNodeId = new UaNodeId(Identifier.Server);
                var o = walkThroughObject({
                    Object: objectNodeId,
                    IsFolder: false,
                    TypeDefinition: new UaNodeId(Identifier.ServerType),
                    Path: ["Server"],
                    FollowNonHierarchicalReferences: true,
                    SkipHasTypeDefinition: true,
                    ObjectCheckingResults: objectCheckingResults,
                    ObjectCheckedResults: objectCheckedResults,
                    ModelMap: CU_Variables.LocalModelMap
                });
            }// good quality read?
        }// read namespace array
    }

    _currentWalkthroughCount = 0;

    // NOW TO DISPLAY THE RESULTS
    print("\n\n\n-----------------------------------------------------------------");
    print("Compliant Objects (instances compliant with objects defined in this script):");
    for (key in objectCheckingResults) if (objectCheckingResults[key] == "compliant") print("\t" + key);
    print("\nNon-Compliant Objects (instances not compliant with objects defined in this script):");
    for (key in objectCheckingResults) {
        if (objectCheckingResults[key] == "NON COMPLIANT") {
            print("\t" + key);
            addError("Object " + key + " is not compliant with the UA 1.04 NodeSetFile.");
        }
    }
    print("\nSkipped Objects (not defined in this script):");
    for (key in objectCheckingResults) if (objectCheckingResults[key].toString().indexOf("skipped") == 0) print("\t" + key);

    return true;
}

Test.Execute( { Procedure: testServerObject } );

function findNodesOfflineForBaseInfoCore( nodeId, object, args ) {
    if( args.status == true) return(args.status);
    var z = new UaNodeId.fromString( nodeId );
    if( object.ReferenceDescriptions.length > 1 ) {
            var alreadyChecked = [];
            for( var i = 0; i < object.ReferenceDescriptions.length; i++ ) {
                if( object.ReferenceDescriptions[i].ReferenceTypeId.equals( new UaNodeId( Identifier.HasTypeDefinition ) ) ){
                    if( object.ReferenceDescriptions[i].NodeId.NodeId.equals( args.TypeNodeId ) ) {
                        args.status = true;
                    }
                    break;
                }
            }
    }
    return( args.status );
}