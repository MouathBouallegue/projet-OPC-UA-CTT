include( "./library/Information/BuildLocalCacheMap.js" );

var BaseVariables = new Object();
if( !isDefined( BaseVariables.ModelMapHelper ) ) BaseVariables.ModelMapHelper = new BuildLocalCacheMapService();
if( !isDefined( BaseVariables.ModelMap ) ) BaseVariables.ModelMap = BaseVariables.ModelMapHelper.GetModelMap();

/**
 * Used to refresh the ModelMap during runtime if the AddressSpace changed
 *
 * @returns {boolean} Returns true;
 */
function refreshBaseVariablesModelMap( sessionThread ) {
    ClearModelCacheHelper.Execute();
    ClearRawDataCacheHelper.Execute();
    sessionThread.End();
    Test.Disconnect();
    Test.ModelMap = null;
    BuildCacheMapServiceHelper = new BuildCacheMapService();
    BuildCacheMapServiceHelper.Execute();
    BaseVariables.ModelMapHelper = new BuildLocalCacheMapService();
    BaseVariables.ModelMap = BaseVariables.ModelMapHelper.GetModelMap();
    Test.Connect();
    sessionThread.Start( { Session: Test.Session } );
    return true;
}

/**
 * Used to refresh the ModelMap if the AddressSpace changed, starting from a certain Node
 * 
 * @param {UaNodeId} nodeId - The starting node to browse from
 * 
 * @returns {boolean} Returns true;
 */
function refreshBaseVariablesModelMapByNodeId( nodeId, sessionThread ) {
    var req = new UaBrowseAddressSpaceRequest();
     req.NodeToRead[0] = nodeId;
    var res = new UaBrowseAddressSpaceResponse();
    Test.Session.Session.browseAddressSpace( req, res );
    Test.ModelMap = null;
    sessionThread.End();
    Test.Disconnect();
    BuildCacheMapServiceHelper = new BuildCacheMapService();
    BuildCacheMapServiceHelper.Execute();
    BaseVariables.ModelMapHelper = new BuildLocalCacheMapService();
    BaseVariables.ModelMap = BaseVariables.ModelMapHelper.GetModelMap();
    Test.Connect();
    sessionThread.Start( { Session: Test.Session } );
    return true;
}

/**
 * Scans the AddressSpace for Nodes of a certain Type and recursively initializes all children as object structure of MonitoredItems
 * 
 * @param {object} args - An object containing all parameter
 * @param {MonitoredItem} args.Type - The desired Type to search for
 * @param {boolean} args.IncludeSubTypes - (Optional) True = Include SubTypes, False = Do not include SubTypes (default=false)
 * @param {Number} args.MaxNodesToReturn - (Optional) Maximum number of nodes to return (default=0 (no limit))
 *
 * @returns {MonitoredItem[]} Returns an array of all nodes matching the criteria. If nothing was found, an empty array will be returned.
 */
function FindAndInitializeAllNodesOfType( args ) {
    if( !isDefined( args ) ) throw( "FindAndInitializeAllNodesOfType(): args not specified" );
    if( !isDefined( args.Type ) ) throw( "FindAndInitializeAllNodesOfType(): Type not specified" );
    if( !isDefined( args.IncludeSubTypes ) ) args.IncludeSubTypes = false;
    var results = [];
    
    var Instances = FindObjectsOfTypeHelper.Execute( { TypeToFind: args.Type.NodeId, IncludeSubTypes: args.IncludeSubTypes, MaxNodesToReturn: args.MaxNodesToReturn } );
    
    if( Instances.result ) {
        var mis = new MonitoredItem.fromNodeIds( Instances.nodes );
        for( var i=0; i < mis.length; i++ ) {
            mis[i].References = BaseVariables.ModelMap.Get( mis[i].NodeId );
            if( isDefined( mis[i].References ) ) {
                BaseVariables.ModelMapHelper.FindPaths( mis[i].References );
            }
            if( isDefined( mis[i].References ) && isDefined( mis[i].References.Paths ) ) {
                for ( var s=0; s<mis[i].References.Paths.length; s++ ) if( mis[i].References.Paths[s].indexOf( "/Types/" ) > -1 ) break;
                if( s === mis[i].References.Paths.length ) results.push( mis[i] );
            }
        }
        if( results.length > 0 ) {
            for( var r=0; r<results.length; r++ ) SetAllChildren_recursive( results[r] );
            return results;
        }
        else return [];
    }
    else return [];
}

/**
 * Function recursively browses and initializes all children of a node
 * 
 * @param {MonitoredItem} obj - MonitoredItem object to set all children on
 * @param {Number} level - (To be left blank) Recursion level used for indenting while printing browsed nodes
 * @param {string[]} alreadyBrowsedList - (To be left blank) Contains (already browsed) NodeIds (as string) to exclude, to prevent possible loops
 *
 * @returns {boolean} Returns false if the NodeId of obj is found in alreadyBrowsedList, true on success.
 */
function SetAllChildren_recursive( obj, level, alreadyBrowsedList ) {
    if( !isDefined( level ) ) var level = 0;
    if( !isDefined( alreadyBrowsedList ) ) var alreadyBrowsedList = [];
    // do not browse already browsed nodes to prevent unexpected loops
    for( var i=0; i<alreadyBrowsedList.length; i++ ) if( alreadyBrowsedList[i] == obj.NodeId.toString() ) { print( alreadyBrowsedList[i] + " already browsed. Node skipped to prevent loops." ); return( false ) };
    alreadyBrowsedList.push( obj.NodeId.toString() );
    if( level == 0 ) print( "\nInitializing node: " + obj.NodeId + ":" );
    if( isDefined( obj ) ) {
        if( !isDefined( obj.References ) || !isDefined( obj.References.ReferenceDescriptions ) ) obj.References = BaseVariables.ModelMap.Get( obj.NodeId );
        if( isDefined( obj.References ) && isDefined( obj.References.ReferenceDescriptions ) ){
            for( var i=0; i<obj.References.ReferenceDescriptions.length; i++ ) {
                IsSubTypeOfTypeHelper.Execute( { ItemNodeId: obj.References.ReferenceDescriptions[i].ReferenceTypeId, TypeNodeId: new UaNodeId( Identifier.HierarchicalReferences ) } );
                if( obj.References.ReferenceDescriptions[i].IsForward && IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                    var indent = "";
                    for( var t=0; t<=level; t++ ) indent += "    ";
                    print( indent + "-> " + obj.References.ReferenceDescriptions[i].BrowseName.Name + " (" + obj.References.ReferenceDescriptions[i].NodeId.NodeId + ")" );
                    obj[obj.References.ReferenceDescriptions[i].BrowseName.Name] = new MonitoredItem( obj.References.ReferenceDescriptions[i].NodeId.NodeId );
                    SetAllChildren_recursive( obj[obj.References.ReferenceDescriptions[i].BrowseName.Name], level + 1, alreadyBrowsedList );
                }
            }
        }
    }
    return( true );
}

/**
 * Function to verify that a Node has certain references and those references have certain attributes
 * 
 * @param {object} args - An object containing all parameter
 * @param {MonitoredItem} args.Node - Node to verify.
 * @param {string} args.Node.NameOfMissingNode - (Optional) Can be defined to print the Name of the Node if the Node could not be found on the server
 * @param {boolean} args.IsModellingRuleOptional - If set to true, a message when no HasModellingRule reference could be found on the node will be suppressed (default=false)
 * @param {object[]} args.Elements - Array of objects describing the elements of the node to be verified
 * @param {UaNodeId} args.Elements.ReferenceTypeId - ReferenceTypeId of the reference to be verified
 * @param {boolean} args.Elements.IsForward - (Optional) BrowseDirection of the reference to be verified (default=true)
 * @param {UaQualifiedName} args.Elements.BrowseName - BrowseName of the reference to be verified
 * @param {Number} args.Elements.NodeClass - (Optional) NodeClass of the referenced node to be verified
 * @param {MonitoredItem|UaNodeId} args.Elements.DataType - (Optional) DataType of the referenced Node to be verified 
 * @param {string} args.Elements.DataType.NameOfMissingNode - (Optional) If defined, the verification of the DataType will be skipped and an according error message will be printed
 * @param {Number} args.Elements.ValueDataType - (Optional) DataType of the value attribute of the referenced Node to be verified 
 * @param {Number} args.Elements.ValueRank - (Optional) ValueRank of the referenced Node to be verified
 * @param {MonitoredItem|UaNodeId} args.Elements.TypeDefinition - (Optional) TypeDefinition of the referenced Node to be verified (if a member 'NameOfMissingNode' is defined in the MonitoredItem, verification of this attribute will be skipped and an error message printed)
 * @param {string} args.Elements.TypeDefinition.NameOfMissingNode - (Optional) If defined, the verification of the TypeDefinition will be skipped and an according error message will be printed
 * @param {UaNodeId} args.Elements.ModellingRule - (Optional) ModellingRule of the referenced Node to be verified
 * @param {boolean} args.Elements.IsOptional - (Optional) True=Suppress message if referenced Node could no be found (default=false)
 *
 * @returns {boolean} Returns true on successful verification of all elements
 */
function VerifyElementsOfNode( args ) {
    var result = true;
    if( !isDefined( args ) ) throw( "VerifyElementsOfNode(): args not specified" );
    if( !isDefined( args.Node ) ) throw( "VerifyElementsOfNode(): Node not specified" );
    if( !isDefined( args.Elements ) ) throw( "VerifyElementsOfNode(): Elements not specified" );
    if( !isDefined( args.IsModellingRuleOptional ) ) args.IsModellingRuleOptional = false;
    
    // Check if an argument of an Element is undefined and print a warning (to unmask false positive asserts)
    for( var i=0; i<args.Elements.length; i++ ) {
        for( a in args.Elements[i] ) if( args.Elements[i][a] === undefined ) addWarning( "Value of passed argument 'Elements[" + i + "]." + a + "' is " + args.Elements[i][a] );
    }
    
    if( isDefined( args.Node.NodeId ) ) {
        // get all references of the node to verify and iterate through them
        var NodeReferences = BaseVariables.ModelMap.Get( args.Node.NodeId );
        if( isDefined( NodeReferences ) ) {
            var NodeReferenceDescriptions = NodeReferences.ReferenceDescriptions;
        
            for( i in args.Elements ) {
                if( !isDefined( args.Elements[i].IsForward ) ) args.Elements[i].IsForward = true;
                if( !isDefined( args.Elements[i].IsOptional ) ) args.Elements[i].IsOptional = false;
                // get the reference to be verified
                var searchDefinition = [
                    {
                        ReferenceTypeId: args.Elements[i].ReferenceTypeId,
                        IsForward: args.Elements[i].IsForward,
                        BrowseName: args.Elements[i].BrowseName
                    }
                ];
                FindReferencesVerifyingNamespaceIndex( NodeReferenceDescriptions, searchDefinition, BaseVariables.ModelMapHelper );
                if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    // create a MonitoredItem of the referenced node to check its attributes
                    args.Elements[i].MonitoredItem = new MonitoredItem( NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                    args.Elements[i].MonitoredItem.References = BaseVariables.ModelMap.Get( args.Elements[i].MonitoredItem.NodeId.toString() );
                    
                    // Check attributes
                    
                    // NodeClass
                    if( isDefined( args.Elements[i].NodeClass ) ) {
                        if( !Assert.Equal( args.Elements[i].NodeClass, NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeClass, "NodeClass of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                    }
                    // TypeDefinition
                    if( isDefined( args.Elements[i].TypeDefinition ) ) {
                        if( isDefined( args.Elements[i].TypeDefinition.NameOfMissingNode ) ) {
                            addError( "TypeDefinition of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' could not be verified. TypeDefinition '" + args.Elements[i].TypeDefinition.NameOfMissingNode + "' not found in server." );
                            result = false;
                        }
                        else {
                            if( isDefined( args.Elements[i].TypeDefinition.NodeId ) ) {
                                if( !Assert.Equal( args.Elements[i].TypeDefinition.NodeId, NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].TypeDefinition.NodeId, "TypeDefinition of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                            }
                            else {
                                if( !Assert.Equal( args.Elements[i].TypeDefinition, NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].TypeDefinition.NodeId, "TypeDefinition of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                            }
                        }
                    }
                    // DataType
                    if( isDefined( args.Elements[i].DataType ) ) {
                        if( isDefined( args.Elements[i].DataType.NameOfMissingNode ) ) {
                            addError( "DataType of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' could not be verified. TypeDefinition '" + args.Elements[i].DataType.NameOfMissingNode + "' not found in server." );
                            result = false;
                        }
                        else {
                            var expectedNodeId = args.Elements[i].DataType;
                            if( isDefined( args.Elements[i].DataType.NodeId ) ) expectedNodeId = args.Elements[i].DataType.NodeId;
                            // Read the DataType
                            args.Elements[i].MonitoredItem.AttributeId = Attribute.DataType;
                            if( ReadHelper.Execute( { NodesToRead: args.Elements[i].MonitoredItem } ) ) {
                                var dataType = args.Elements[i].MonitoredItem.Value.Value;
                                if( isDefined( dataType ) ) {
                                    if( !Assert.Equal( expectedNodeId, dataType.toNodeId(), "DataType of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                                }
                                else {
                                    addError( "DataType of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' is empty. Expected: '" + expectedNodeId + "'." );
                                    result = false;
                                }
                            }
                            else {
                                addError( "Could not verify the DataType of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "'. Read failed. Would have expected: '" + expectedNodeId + "'." );
                                result = false;
                            }
                        }
                    }
                    // ValueDataType
                    if( isDefined( args.Elements[i].ValueDataType ) ) {
                        var expectedIdentifier = args.Elements[i].ValueDataType;
                        // Read the Value attribute
                        args.Elements[i].MonitoredItem.AttributeId = Attribute.Value;
                        if( ReadHelper.Execute( { NodesToRead: args.Elements[i].MonitoredItem } ) ) {
                            var dataType = args.Elements[i].MonitoredItem.Value.Value.DataType;
                            if( isDefined( dataType ) ) {
                                if( !Assert.Equal( expectedIdentifier, dataType, "DataType of Value attribute of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                            }
                            else {
                                addError( "DataType of Value attribute of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' is empty. Expected: " + expectedIdentifier + " (" + Identifier.toString( new UaNodeId( expectedIdentifier ) ) + ")." );
                                result = false;
                            }
                        }
                        else {
                            addError( "Could not verify the DataType of Value attribute of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "'. Read failed. Would have expected: " + expectedIdentifier + " (" + Identifier.toString( new UaNodeId( expectedIdentifier ) ) + ")." );
                            result = false;
                        }
                    }
                    // ValueRank
                    if( isDefined( args.Elements[i].ValueRank ) ) {
                        // Read the ValueRank
                        args.Elements[i].MonitoredItem.AttributeId = Attribute.ValueRank;
                        if( ReadHelper.Execute( { NodesToRead: args.Elements[i].MonitoredItem } ) ) {
                            var valueRank = args.Elements[i].MonitoredItem.Value.Value;
                            if( isDefined( valueRank ) ) {
                                if( !Assert.Equal( args.Elements[i].ValueRank, valueRank.toInt32(), "ValueRank of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                            }
                            else {
                                addError( "ValueRank of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' is empty. Expected: '" + args.Elements[i].ValueRank + "'." );
                                result = false;
                            }
                        }
                        else {
                            addError( "Could not verify the ValueRank of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "'. Read failed. Would have expected: '" + args.Elements[i].ValueRank + "'." );
                            result = false;
                        }
                    }
                    // ModellingRule
                    if( isDefined( args.Elements[i].ModellingRule ) ) {
                        var searchDefinition_ModellingRule = [
                            {
                                ReferenceTypeId: new UaNodeId( Identifier.HasModellingRule ),
                                IsForward: true
                            }
                        ];
                        BaseVariables.ModelMapHelper.FindReferences( args.Elements[i].MonitoredItem.References.ReferenceDescriptions, searchDefinition_ModellingRule );
                        if( isDefined( searchDefinition_ModellingRule[0].ReferenceIndex ) ) {
                            var modellingRule = args.Elements[i].MonitoredItem.References.ReferenceDescriptions[searchDefinition_ModellingRule[0].ReferenceIndex].NodeId.NodeId;
                            if( !Assert.Equal( args.Elements[i].ModellingRule, modellingRule, "ModellingRule of Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not match expectation." ) ) result = false;
                        }
                        else {
                            if( !args.IsModellingRuleOptional ) {
                                addError( "Element '" + args.Elements[i].BrowseName.Name + "' of Node '" + args.Node.NodeId + "' does not have HasModellingRule reference. Would have expected: '" + args.Elements[i].ModellingRule + "'." );
                                result = false;
                            }
                        }
                    }
                    
                }
                else if( !args.Elements[i].IsOptional ) {
                    addError( "Verification of Elements of node '" + args.Node.NodeId + "' failed: \n  Element '" + args.Elements[i].BrowseName.Name + "' not found" );
                    result = false;
                }
            }
        }
        else {
            addError( "Node to verify " + args.Node.NodeId + " not found in ModelMap." );
            result = false;
        }
    }
    else {
        addError( "Node to verify " + ( isDefined( args.Node.NameOfMissingNode ) ? ( "('" + args.Node.NameOfMissingNode + "') " ) : "" ) + "not found in server" );
        result = false;
    }
    return( result );
}

/**
 * Function to get all children (hierarchical referenced target nodes) of a node as MonitoredItem array
 * 
 * @param {MonitoredItem} mI - Node to get all children from.
 * 
 * @returns {MonitoredItem[]} Returns all children as MonitoredItem array (empty array if node has no children)
 */
function GetChildNodes( mI ) {
    var results = [];
    if( !isDefined( mI ) ) throw( "GetChildNodes(mI): No MonitoredItem defined to get children from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetChildNodes(mI): Passed object appears to not be of type MonitoredItem" );
    mI.References = BaseVariables.ModelMap.Get( mI.NodeId );
    if( isDefined( mI.References ) && isDefined( mI.References.ReferenceDescriptions ) ) {
        for( var i=0; i<mI.References.ReferenceDescriptions.length; i++ ) {
            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: mI.References.ReferenceDescriptions[i].ReferenceTypeId, TypeNodeId: new UaNodeId( Identifier.HierarchicalReferences ) } );
            if( mI.References.ReferenceDescriptions[i].IsForward && IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                results.push( new MonitoredItem( mI.References.ReferenceDescriptions[i].NodeId.NodeId ) );
                results[results.length-1].BrowseName = mI.References.ReferenceDescriptions[i].BrowseName;
                results[results.length-1].NodeClass = mI.References.ReferenceDescriptions[i].NodeClass;
            }
        }
    }
    return( results );
}

/**
 * Function to get all children of a node referenced by a certain reference type
 * 
 * @param {MonitoredItem} mI - Node to get all children from.
 * @param {UaNodeId} referenceTypeId - Reference type to search for.
 * @param {boolean} isForward - (Optional) Search for forward(TRUE) or inverse references(FALSE) (default=TRUE)
 * 
 * @returns {MonitoredItem[]} Returns all children referenced by the given reference type as MonitoredItem array (empty array if node has no children reference by the given reference type)
 */
function GetChildNodesByReferenceTypeId( mI, referenceTypeId, isForward ) {
    var results = [];
    if( !isDefined( mI ) ) throw( "GetChildNodesByReferenceTypeId(mI, referenceTypeId): No MonitoredItem defined to get children from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetChildNodesByReferenceTypeId(mI, referenceTypeId): Passed object appears to not be of type MonitoredItem" );
    if( !isDefined( referenceTypeId ) ) throw( "GetChildNodesByReferenceTypeId(mI, referenceTypeId): No referenceTypeId defined" );
    if( !isDefined( isForward ) ) var isForward = true;
    if( !isDefined( mI.References ) || !isDefined( mI.References.ReferenceDescriptions ) ) mI.References = BaseVariables.ModelMap.Get( mI.NodeId );
    if( isDefined( mI.References ) && isDefined( mI.References.ReferenceDescriptions ) ){
        for( var i=0; i<mI.References.ReferenceDescriptions.length; i++ ) {
            if( mI.References.ReferenceDescriptions[i].IsForward == isForward && mI.References.ReferenceDescriptions[i].ReferenceTypeId.equals( referenceTypeId ) ) {
                results.push( new MonitoredItem( mI.References.ReferenceDescriptions[i].NodeId.NodeId ) );
                results[results.length-1].BrowseName = mI.References.ReferenceDescriptions[i].BrowseName;
                results[results.length-1].NodeClass = mI.References.ReferenceDescriptions[i].NodeClass;
            }
        }
    }
    return( results );
}

/**
 * Finds and returns the NodeId of the first parent of a given reference type (first SubtypeOf reference)
 *
 * @param {object} args An object containing all parameter
 * @param {UaNodeId} args.TypeNodeId - NodeId of the reference type to get the parent of
 *
 * @returns {UaNodeId} NodeId of the first parent of the given reference type, or a null value if no parent was found
 */
function GetReferenceTypeFirstParent( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "GetReferenceTypeFirstParent(): No args specified" );
    if( !isDefined( args.TypeNodeId ) ) throw( "GetReferenceTypeFirstParent(): No TypeNodeId specified" );
    var referenceDescriptions = BaseVariables.ModelMap.Get( args.TypeNodeId ).ReferenceDescriptions;
    for( var i=0; i<referenceDescriptions.length; i++ ) {
        // return NodeId of the first found 'SubtypeOf' reference
        if( referenceDescriptions[i].ReferenceTypeId.toString() == "i=45" &&
            referenceDescriptions[i].IsForward == false ) return referenceDescriptions[i].NodeId;
    }
    // return null if no 'SubtypeOf' reference description is available 
    return( null );
}

/**
 * Finds and returns the first parent (first inverse hierarchical reference target) of a given node
 *
 * @param {MonitoredItem} mI - Node to get the first parent from.
 * 
 * @returns {MonitoredItem} Returns a MonitoredItem of the first parent node found. If no parent was found, a MonitoredItem with an empty NodeId will be returned.
 */
function GetParentNode( mI ) {
    var result = new MonitoredItem( new UaNodeId() );
    if( !isDefined( mI ) ) throw( "GetParentNode(mI): No MonitoredItem defined to get parent from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetParentNode(mI): Passed object appears to not be of type MonitoredItem" );
    if( !isDefined( mI.References ) || !isDefined( mI.References.ReferenceDescriptions ) ) mI.References = BaseVariables.ModelMap.Get( mI.NodeId );
    if( isDefined( mI.References ) && isDefined( mI.References.ReferenceDescriptions ) ){
        for( var i=0; i<mI.References.ReferenceDescriptions.length; i++ ) {
            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: mI.References.ReferenceDescriptions[i].ReferenceTypeId, TypeNodeId: new UaNodeId( Identifier.HierarchicalReferences ) } );
            if( !mI.References.ReferenceDescriptions[i].IsForward && IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                result = new MonitoredItem( mI.References.ReferenceDescriptions[i].NodeId.NodeId );
                result.BrowseName = mI.References.ReferenceDescriptions[i].BrowseName;
                result.NodeClass = mI.References.ReferenceDescriptions[i].NodeClass;
            }
        }
    }
    return( result );
}

/**
 * Finds and returns the NodeId of the TypeDefinition of a node referenced by a HasTypeDefinition reference
 *
 * @param {MonitoredItem} mI - Node to get the TypeDefinition from.
 * 
 * @returns {UaNodeId} Returns the NodeId of the found HasTypeDefinition target node or an empty NodeId if no HasTypeDefinition reference was found.
 */
function GetTypeDefinitionOfNode( mI ) {
    var result = new UaNodeId();
    if( !isDefined( mI ) ) throw( "GetTypeDefinitionOfNode(mI): No MonitoredItem defined to get children from" );
    if( !isDefined( mI.NodeId ) ) throw( "GetTypeDefinitionOfNode(mI): Passed object appears to not be of type MonitoredItem" );
    if( !isDefined( mI.References ) || !isDefined( mI.References.ReferenceDescriptions ) ) mI.References = BaseVariables.ModelMap.Get( mI.NodeId );
    if( isDefined( mI.References ) && isDefined( mI.References.ReferenceDescriptions ) ){
        var searchDefinition = [ { ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ) } ];
        BaseVariables.ModelMapHelper.FindReferences( mI.References.ReferenceDescriptions, searchDefinition );
        if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
            result = mI.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId;
        }
    }
    return result;
}

/**
 * Reads an returns the value of the DataType attribute of a node
 *
 * @param {UaNodeId} nodeId - Node to get the DataType attribute from.
 * 
 * @returns {UaNodeId} Returns the value of the DataType attribute of the given NodeId.
 */
function GetDataTypeOfNodeByNodeId( nodeId ) {
    var result = new UaNodeId();
    if( !isDefined( nodeId ) ) throw( "GetDataTypeOfNodeByNodeId(nodeId): No nodeId defined" );
    var mI = new MonitoredItem( nodeId );
    mI.AttributeId = Attribute.DataType;
    if( ReadHelper.Execute( { NodesToRead: mI } ) ) result = mI.Value.Value.toNodeId();
    return result;
}

/**
 * Reads an returns the value of the NodeClass attribute of a node
 *
 * @param {UaNodeId} nodeId - Node to get the NodeClass attribute from.
 * 
 * @returns {Number} Returns the NodeClass of the given NodeId.
 */
function GetNodeClassOfNodeByNodeId( nodeId ) {
    var result = 0;
    if( !isDefined( nodeId ) ) throw( "GetNodeClassOfNodeByNodeId(nodeId): No nodeId defined" );
    var mI = new MonitoredItem( nodeId );
    mI.AttributeId = Attribute.NodeClass;
    if( ReadHelper.Execute( { NodesToRead: mI } ) ) result = mI.Value.Value.toInt32();
    return result;
}

/**
 * Reads an returns the value of the BrowseName attribute of a node
 *
 * @param {UaNodeId} nodeId - Node to get the BrowseName attribute from.
 * 
 * @returns {UaQualifiedName} Returns the BrowseName of the given NodeId.
 */
function GetBrowseNameOfNodeByNodeId( nodeId ) {
    var result = 0;
    if( !isDefined( nodeId ) ) throw( "GetBrowseNameOfNodeByNodeId(nodeId): No nodeId defined" );
    var mI = new MonitoredItem( nodeId );
    mI.AttributeId = Attribute.BrowseName;
    if( ReadHelper.Execute( { NodesToRead: mI } ) ) result = mI.Value.Value.toQualifiedName();
    return result;
}

/**
 * Reads an returns the value of the ValueRank attribute of a node
 *
 * @param {UaNodeId} nodeId - Node to get the ValueRank attribute from.
 * 
 * @returns {Number} Returns the ValueRank of the given NodeId.
 */
function GetValueRankOfNodeByNodeId( nodeId ) {
    var result = 0;
    if( !isDefined( nodeId ) ) throw( "GetValueRankOfNodeByNodeId(nodeId): No nodeId defined" );
    var mI = new MonitoredItem( nodeId );
    mI.AttributeId = Attribute.ValueRank;
    if( ReadHelper.Execute( { NodesToRead: mI } ) ) result = mI.Value.Value.toInt32();
    return result;
}

/**
 * Reads an returns the value of the Value attribute of a node
 *
 * @param {UaNodeId} nodeId - Node to get the Value attribute from.
 * 
 * @returns {UaVariant} Returns the Value of the given NodeId.
 */
function GetValueOfNodeByNodeId( nodeId ) {
    var result = 0;
    if( !isDefined( nodeId ) ) throw( "GetValueOfNodeByNodeId(nodeId): No nodeId defined" );
    var mI = new MonitoredItem( nodeId );
    mI.AttributeId = Attribute.Value;
    if( ReadHelper.Execute( { NodesToRead: mI } ) ) result = mI.Value.Value;
    return result;
}

/**
 * Checks if a Node has a HasTypeDefinition referencing a target node of a certain type or subtype
 *
 * @param {MonitoredItem} node - Node to check the TypeDefinition of.
 * @param {MonitoredItem|UaNodeId} typeNode - Node to check the TypeDefinition for.
 * 
 * @returns {boolean} Returns TRUE if the node has a HasTypeDefinition reference and the target node is of the given type or subtype, FALSE otherwise.
 */
function isNodeOfTypeOrSubType( node, typeNode ) {
    if( !isDefined( node ) ) throw( "isNodeOfType(): 'node' not defined" );
    if( !isDefined( typeNode ) ) throw( "isNodeOfType(): 'typeNode' not defined" );
    if( isDefined( typeNode.NodeId ) ) typeNode = typeNode.NodeId;
    var typeDefinition = GetTypeDefinitionOfNode( node );
    if( !typeDefinition.equals( new UaNodeId() ) ) {
        if( !typeDefinition.equals( typeNode ) ) {
            // if typeDefinition is not of typeNode, check if it is a subtype of it
            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: typeDefinition, TypeNodeId: typeNode } );
            if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) return( true );
        }
        else return( true );
    }
    return false;
}

/**
 * Checks if a node has a certain reference and returns the NodeId of the referenced node if found
 * 
 * @param {object} args - An object containing all parameter
 * @param {MonitoredItem} args.Node - Node to check the existence of the reference on
 * @param {string} args.Node.NameOfMissingNode - (Optional) Can be defined to print the Name of the Node if the Node could not be found on the server
 * @param {UaNodeId} args.ReferenceTypeId - ReferenceTypeId of the reference to check
 * @param {boolean} args.IsForward - (Optional) BrowseDirection of the reference to check (default=true)
 * @param {string} args.Name - BrowseName.Name of the reference to check
 * @param {Number} args.NamespaceIndex - (Optional) BrowseName.NamespaceIndex of the reference to check (default=0)
 * @param {string} args.Message - (Optional) Custom message to print if reference could not be found (default=standard message)
 * @param {boolean} args.SuppressMessages - (Optional) True = Suppress messages (default=false)
 * 
 * @returns {boolean|UaNodeId} Returns false if the defined reference could not be found on the defined Node, otherwise the NodeId of the found referenced node will be returned
 */
function CheckHasReferenceTo( args ) {
    if( !isDefined( args ) ) throw( "CheckHasReferenceTo(): args not specified" );
    if( !isDefined( args.Node ) ) throw( "CheckHasReferenceTo(): Node not specified" );
    if( !isDefined( args.Name ) ) throw( "CheckHasReferenceTo(): Name not specified" );
    if( !isDefined( args.NamespaceIndex ) ) args.NamespaceIndex = 0;
    if( !isDefined( args.IsForward ) ) args.IsForward = true;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    if( isDefined( args.Node.NodeId ) ) {
        var NodeReferenceDescriptions = BaseVariables.ModelMap.Get( args.Node.NodeId ).ReferenceDescriptions;
        var searchDefinition = [
            {
                ReferenceTypeId: args.ReferenceTypeId,
                IsForward: args.IsForward,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: args.NamespaceIndex, Name: args.Name } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( NodeReferenceDescriptions, searchDefinition, BaseVariables.ModelMapHelper, true );
        if( !isDefined( searchDefinition[0].ReferenceIndex ) ) { 
            if( !args.SuppressMessages ) {
                if( isDefined( args.Message ) ) addError( args.Message );
                else addError( "'" + args.Node.NodeId + "' has no reference '" + args.Name + "'" );
            }
            return( false );
        }
        else return( NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
    }
    else if( !args.SuppressMessages ) addError( "Node " + ( isDefined( args.Node.NameOfMissingNode ) ? ( "'" + args.Node.NameOfMissingNode + "' " ) : "" ) + "not found in server" );
    
    return( false );
}

/**
 * Placeholder for a function to call a generic method. Prints a notSupported message yet.
 *
 * @param {MonitoredItem} method - The method to call
 * @param {ExpectedAndAcceptedResults} serviceResult - (Optional) Expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} operationResults - (Optional) Expected OperationResults (default=[Good])
 * 
 * @returns {boolean} Returns TRUE
 */
function callGenericMethod( method, serviceResult, operationResults ) {
    if( !isDefined( method ) ) throw( "callGenericMethod(): No method defined" );
    if( !isDefined( method.NodeId ) ) throw( "callGenericMethod(): Defined Method appears to be no MonitoredItem" );
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    // TODO: Implement function
    addNotSupported( "CTT cannot execute generic method calls yet. Please check method '" + method.NodeId + "' manually." );
    return( true );
}

/**
 * Checks if a node has a certain reference and returns the NodeId of the referenced node if found
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.SourceNode - Node to check the existence of the reference on
 * @param {UaNodeId} args.TargetNode - BrowseName.Name of the reference to check
 * @param {UaNodeId} args.ReferenceTypeId - ReferenceTypeId of the reference to check
 * @param {boolean} args.IsForward - (Optional) BrowseDirection of the reference to check (default=true)
 * 
 * @returns {boolean|UaNodeId} Returns false if the defined reference could not be found on the defined Node, otherwise the NodeId of the found referenced node will be returned
 */
function CheckHasReferenceToNodeId( args ) {
    if( !isDefined( args ) ) throw( "CheckHasReferenceTo(): args not specified" );
    if( !isDefined( args.SourceNode ) ) throw( "CheckHasReferenceTo(): SourceNode not specified" );
    if( !isDefined( args.TargetNode ) ) throw( "CheckHasReferenceTo(): TargetNode not specified" );
    if( !isDefined( args.ReferenceTypeId ) ) throw( "CheckHasReferenceTo(): ReferenceTypeId not specified" );
    if( !isDefined( args.IsForward ) ) args.IsForward = true;
    
    var NodeReferenceDescriptions = BaseVariables.ModelMap.Get( args.SourceNode ).ReferenceDescriptions;
    var searchDefinition = [
        {
            ReferenceTypeId: args.ReferenceTypeId,
            IsForward: args.IsForward,
            NodeId: UaExpandedNodeId.New( { NodeId: args.TargetNode } )
        }
    ];
    BaseVariables.ModelMapHelper.FindReferences( NodeReferenceDescriptions, searchDefinition );
    return( isDefined( searchDefinition[0].ReferenceIndex ) );
}

/**
 * Finds and returns the NodeId of a referenced node by the targets name and the ReferenceTypeId
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.SourceNode - Node containing the reference
 * @param {UaQualifiedName} args.TargetNode - BrowseName of the TargetNode to get
 * @param {UaNodeId} args.ReferenceTypeId - ReferenceTypeId of the reference pointing at the target
 * @param {boolean} args.IsForward - (Optional) BrowseDirection of the reference to check (default=true)
 * 
 * @returns {MonitoredItem} Returns null if the defined target node could not be found, otherwise a MonitoredItem of the found target is returned
 */
function GetTargetNode( args ) {
    if( !isDefined( args ) ) throw( "GetTargetNode(): args not specified" );
    if( !isDefined( args.SourceNode ) ) throw( "GetTargetNode(): SourceNode not specified" );
    if( !isDefined( args.TargetNodeName ) ) throw( "GetTargetNode(): TargetNodeName not specified" );
    if( !isDefined( args.ReferenceTypeId ) ) throw( "GetTargetNode(): ReferenceTypeId not specified" );
    if( !isDefined( args.IsForward ) ) args.IsForward = true;
    
    result = null;
    
    var NodeReferenceDescriptions = BaseVariables.ModelMap.Get( args.SourceNode ).ReferenceDescriptions;
    var searchDefinition = [
        {
            ReferenceTypeId: args.ReferenceTypeId,
            IsForward: args.IsForward,
            BrowseName: args.TargetNodeName
        }
    ];
    BaseVariables.ModelMapHelper.FindReferences( NodeReferenceDescriptions, searchDefinition );
    if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
        result = new MonitoredItem( NodeReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
    }
    return result;
}

/**
 * Function to check if reading a Node return Bad_NodeIdUnknown
 * 
 * @param {UaNodeId} nodeId - The NodeId to check the existence of
 * 
 * @returns {boolean} Only returns FALSE if Bad_NodeIdUnknown is received, TRUE in all other cases
 */
function NodeExistsInAddressSpace( nodeId ) {
    if( !isDefined( nodeId ) ) {
        addError( "NodeExistsInAddressSpace(): No nodeId defined" );
        return false;
    }

    var temp_mI = new MonitoredItem( nodeId );
    ReadHelper.Execute( { 
        NodesToRead: temp_mI,
        TimestampsToReturn: TimestampsToReturn.Neither,
        SuppressMessaging: true,
        SuppressBadValueStatus: true
    } );
    
    return ( ReadHelper.Response.Results[0].StatusCode.StatusCode != StatusCode.BadNodeIdUnknown );
}

/**
 * Follows inverse hierarchical references to the first instance of a certain type
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.ItemId - The NodeId to get the containing entity for
 * @param {UaNodeId|Number} args.TypeNodeId - The type of the containing entity
 * 
 * @returns {MonitoredItem} Returns the first entity found, reverse browsing the hierarchy, that has the passed typeId.
                            Returns null if no entity was found
 */
function GetContainingEntity( args ) {
    if( !isDefined( args.ItemId ) ) throw( "GetContainingEntity(): Argument itemNodeId is not defined" );
    if( !isDefined( args.ItemId.IdentifierType ) ) throw( "GetContainingEntity(): Argument itemNodeId does not appear to be a NodeId" );
    if( isDefined( args.TypeNodeId.NodeId ) ) args.TypeNodeId =  args.TypeNodeId.NodeId;
    if( !isDefined( args.TypeNodeId ) ) throw( "GetContainingEntity(): Argument itemNodeId is not defined" );
    if( !isDefined( args.TypeNodeId.IdentifierType ) ) args.TypeNodeId = new UaNodeId( args.TypeNodeId );
    var result = null;
    
    this._getContainingEntity = function( itemId, typeNodeId ) {
        var item_mI = new MonitoredItem( itemId );
        var itemFirstParent = GetParentNode( item_mI );
        delete item_mI;
        if( itemFirstParent.NodeId.equals( new UaNodeId() ) ) return null;
        if( GetTypeDefinitionOfNode( itemFirstParent ).equals( typeNodeId ) ) return itemFirstParent;
        else return this._getContainingEntity( itemFirstParent.NodeId, typeNodeId );
    }
    
    return this._getContainingEntity( args.ItemId, args.TypeNodeId );
}