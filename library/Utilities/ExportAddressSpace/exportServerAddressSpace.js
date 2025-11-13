include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse.js" );

var NodeCount = 0;

/* args:
    - NodeId: array of monitoredItem objects to browse.
    - BrowseHelper: a browse() helper method
    - BrowseDirection: browseDirection
    - NodeClass: 
    - ReferenceType: 
    - ResultMask: 
    - MaxDepth: the maximum depth of the browsing
    */
function readNode( args ) {
    if( !isDefined( args ) ){ throw( "args not specified for 'readNode()' function." ); }
    if( !isDefined( args.NodesToBrowse ) ){ throw( "args.NodesToBrowse not specified for 'readNode()' function." ); }
    if( !isDefined( args.FileOutputFunction ) ){ throw( "args.FileOutputFunction not specified for 'readNode()' function." ); }
    if( !isDefined( [ args.BrowseDirection, args.NodeClass, args.ReferenceType, args.ResultMask ] ) ){ throw( "args.BrowseDirection/NodeClass/NodeId/ResultMask not specified." ); }
    if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
    // we will add a "level" property to the args object so that we can track
    // which level we are at within the address-space hierarchy
    if( !isDefined( args.Level ) ){ args.Level = 0; } //1 = root
    if( isDefined( args.MaxDepth ) ){ if( args.Level >= args.MaxDepth ){ return; } }
    // configure the browse options for the node.
    args.NodesToBrowse.SetBrowseOptions( args.BrowseDirection, true, args.NodeClass, args.ReferenceType, args.ResultMask );

    var browseHelper = new BrowseService( args.Session );
    browseHelper.Execute( { NodesToBrowse:args.NodesToBrowse, SuppressMessaging: args.SuppressMessaging } );

    // increase the node count and exit if we have hit a cap
    NodeCount++;
    if( isDefined( args.MaxNodeCount ) ) { 
        if( NodeCount >= args.MaxNodeCount ) { 
            addWarning( "Max number of nodes retrieved." );
            return; 
        } 
        else if( NodeCount % 25 == 0 ) print( "Reading item #" + NodeCount + " of " + args.MaxNodeCount );
    }

    // check the results, and then recursively delve deeper where sub-nodes can be found
    if( browseHelper.Response.Results.length > 0 ) {
        args.Level += 1;

        // iterate through each result (should be only 1)
        for( var r=0; r<browseHelper.Response.Results.length; r++ ) {
            // iterate through each reference (may be 0..many)
            for( var f=0; f<browseHelper.Response.Results[r].References.length; f++ ) {
                // pass each reference to the writer function
                // if it matches any specified filter
                if( isDefined( args.Filter ) ) {
                    if( args.Filter === browseHelper.Response.Results[r].References[f].NodeClassMask ) {
                        args.FileOutputFunction( browseHelper.Response.Results[r].References[f], args.Level );
                    }
                }
                else {
                    args.FileOutputFunction( browseHelper.Response.Results[r].References[f], args.Level );
                }
                // recursively browse for child-nodes of the the currently selected reference
                var currRefAsNode = MonitoredItem.fromNodeIds( [ browseHelper.Response.Results[r].References[f].NodeId.NodeId ], 0 )[0];
                // is this a node that has been requested to be skipped?
                var reportItem=true;
                if( isDefined( args.Exclude ) ) {
                    for( var e=0; e<args.Exclude.length; e++ ) {
                        if( currRefAsNode.NodeId.NodeId === args.Exclude[e] ) {
                            addWarning( "Filtered item detected: " + args.Exclude[e].toString() + ". Skipping item." );
                            reportItem = false;
                            break;
                        }
                    }
                }
                // report the item having passed the filter?
                if( reportItem ) {
                    readNode( { 
                            NodesToBrowse: currRefAsNode,
                            Session: args.Session,
                            FileOutputFunction: args.FileOutputFunction,
                            BrowseDirection: args.BrowseDirection, 
                            NodeClass: args.NodeClass, 
                            ReferenceType: args.ReferenceType,
                            ResultMask: args.ResultMask,
                            Level: args.Level,
                            MaxDepth: args.MaxDepth,
                            Exclude: args.Exclude,
                            MaxNodeCount: args.MaxNodeCount,
                            SuppressMessaging: args.SuppressMessaging } );
                }
            }//for f
        }//for r
        args.Level -= 1;
    }//if results>0
    BrowseHelper = null;
}


/* This function will walk through the address space of a specified
   Server. Each node will be sent to a function that is specified
   so that it can be output to a file.
   The intention of this function is to allow any number of text
   files to be created.

   Revision History:
       22-Mar-2012 NP: Initial version.

   Parameters:
       FileOutputFunction: a function pointer
*/
function walkThroughAddressSpace( args ) {
    // check the arguments
    if( !isDefined( args ) )                    throw( "walkThroughAddressSpace.js: No arguments specified. Aborting." );
    if( !isDefined( args.Session ) )            throw( "walkThroughAddressSpace.js: Session not specified. Aborting." );
    if( !isDefined( args.FileOutputFunction ) ) throw( "walkThroughAddressSpace.js: args.FileOutputFunction not specified in walkThroughAddressSpace()." );
    if( !isDefined( args.NodeClass ) )          args.NodeClass = NodeClass.Variable;
    if( !isDefined( args.Filter ) )             args.Filter = NodeClass.Variable;
    if( !isDefined( args.SuppressMessaging ) )  args.SuppressMessage = false;

    try {
        // define the root node and then read it
        var rootNode = MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.RootFolder ) ] )[0];

        // define a browse object, and we'll use it to make recursive
        // browse calls. We're going to do this in a not-so-efficient
        // manner where we invoke one browse request for each tree-level.
        // this will allow for max-interoperability even with embedded
        // devices.
        readNode( {
                Session: args.Session,
                FileOutputFunction: args.FileOutputFunction,
                NodesToBrowse: rootNode,
                BrowseDirection: BrowseDirection.Forward, 
                NodeClass: NodeClass.Unspecified, 
                ReferenceType: new UaNodeId(),
                ResultMask: BrowseResultMask.All,
                Filter: args.Filter,
                MaxDepth: args.MaxDepth,
                Exclude: args.Exclude,
                MaxNodeCount: args.MaxNodeCount,
                SuppressMessaging: args.SuppressMessaging
            } );
    }
    catch( e ) {
        addError( "Unexpected error: '" + e.toString() + "'." );
    }
}

/* Test code 
try{ readNode(); }catch(e){ print( "readNode() Success: error with no args '" + e.toString() + "'." ); }
try{ readNode( { Item: new UaNodeId() } );}catch(e){ print( "readNode() Success: error with args.NodeId set only: '" + e.toString() + "'." ); }
try{ readNode( { Item: new UaNodeId(), BrowseDirection:BrowseDirection.Forward } );}catch(e){ print( "readNode() Success: error with args.NodeId, BrowseDirection set only: '" + e.toString() + "'." ); }
try{ readNode( { Item: new UaNodeId(), BrowseDirection:BrowseDirection.Forward, NodeClass:NodeClass.Unspecified } );}catch(e){ print( "readNode() Success: error with args.NodeId, BrowseDirection, NodeClass set only: '" + e.toString() + "'." ); }
try{ readNode( { Item: new UaNodeId(), BrowseDirection:BrowseDirection.Forward, NodeClass:NodeClass.Unspecified, ReferenceType:Identifier.HierarchicalReferences } );}catch(e){ print( "readNode() Success: error with args.NodeId, BrowseDirection, NodeClass, ReferenceType set only: '" + e.toString() + "'." ); }
try{ readNode( { Item: MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.RootFolder ) ] )[0], BrowseDirection:BrowseDirection.Forward, NodeClass:NodeClass.Unspecified, ReferenceType:Identifier.HierarchicalReferences, BrowseHelperesultMask:BrowseHelperesultMask.None } );}catch(e){ print( "readNode() FAILED: error with all args specified: '" + e.toString() + "'." ); }

try{ walkThroughAddressSpace(); }catch(e){ print( "Success: no args produced error '" + e.toString() + "'." ); }
try{ walkThroughAddressSpace( writeToCsv ); }catch(e){ print( "Success: incorrect use of arg produced error '" + e.toString() + "'." ); }
*/