/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the main first-level Root folder exists, then check sub-folders. */

Test.Execute( { Debug: true, Procedure: function test() { 
    _rootNode.BrowseDirection = BrowseDirection.Forward;
    if( BrowseHelper.Execute( { NodesToBrowse: _rootNode } ) ) {
        var typesNode = UaBrowseResults.Find( { Results: BrowseHelper.Response.Results, BrowseName: "Types" } );
        if( Assert.True( isDefined( typesNode ), "Types node not found under root" ) ) {
            Assert.Equal( 1, typesNode.length, "More than one 'Types' node was matched under the Root folder." );
            Assert.NodeIdsEqual( new UaNodeId( Identifier.TypesFolder ), typesNode[0].NodeId.NodeId, "'Types' NodeId found under the 'Root' folder does not match the standard NodeId definition." );


            // now to find the sub-folders beneath Types.
            if( TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [
                    UaBrowsePath.New( { StartingNode: typesNode[0].NodeId.NodeId, RelativePathStrings: [ "DataTypes" ] } ),
                    UaBrowsePath.New( { StartingNode: typesNode[0].NodeId.NodeId, RelativePathStrings: [ "ReferenceTypes" ] } ),
                    UaBrowsePath.New( { StartingNode: typesNode[0].NodeId.NodeId, RelativePathStrings: [ "ObjectTypes" ] } ),
                    UaBrowsePath.New( { StartingNode: typesNode[0].NodeId.NodeId, RelativePathStrings: [ "EventTypes" ] } ),
                    UaBrowsePath.New( { StartingNode: typesNode[0].NodeId.NodeId, RelativePathStrings: [ "VariableTypes" ] } )
                    ] } ) ) {
                // now check the NodeIds match the official definitions
                var officialNodeIds = [ new UaNodeId( Identifier.DataTypesFolder ),
                                        new UaNodeId( Identifier.ReferenceTypesFolder ),
                                        new UaNodeId( Identifier.ObjectTypesFolder ),
                                        new UaNodeId( Identifier.EventTypesFolder ),
                                        new UaNodeId( Identifier.VariableTypesFolder ) ];
                for( var i=0; i<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; i++ ) {
                    Assert.NodeIdsEqual( officialNodeIds[i], TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].Targets[0].TargetId.NodeId );
                }//for i..
            }

        }
    }
    return( true );
} } );