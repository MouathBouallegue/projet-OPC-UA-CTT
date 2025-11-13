/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Recursively walk through the type system verifying all nodes abide by UA Part 3 and Part 5 rules. */

include( "./library/Information/InfoFactory.js" );

Test.Execute( { Procedure: function test() {
    var result = true;
    var rootNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.ObjectTypesFolder ) )[0];
    HierarchicalReferences.FindAll( { Node: MonitoredItem.fromNodeIds( new UaNodeId( Identifier.HierarchicalReferences ) )[0] } );
    if( !walkThrough( { Node: rootNode, ValidateObjects: false, ModelMap: CU_Variables.LocalModelMap } ) ) result = false;
    _currentWalkthroughCount = 0;
    return( result );
} } );