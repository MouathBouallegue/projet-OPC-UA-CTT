/*globals addError, addLog, AssertBrowseValidParameter, AssertReferenceArraysEqual, 
  GetTest1BrowseRequest, GetTest1ReferencesFromNodeId, Session, UaBrowseResponse
*/

// Go through an array and return references matching the specified nodeClassMask.
function FindReferencesOfNodeClass( allReferences, nodeClassMask )
{
    // spec says a nodeClassMask of 0 should match all node classes
    if( nodeClassMask === 0 )
    {
        nodeClassMask = 0xFF;
    }

    // check references for node class matching nodeClassMask
    var expectedReferences = [];
    for( var i = 0; i < allReferences.length; i++ )
    {
        if( allReferences[i].NodeClass & nodeClassMask )
        {
            expectedReferences.push( allReferences[i] );
        }
    }
    
    return expectedReferences;
}


// Test browsing with specified node class mask.
// Returns the number of references that shouldn't match the nodeClassMask, or -1 on complete failure.
function TestBrowseOneNodeWithClassMask( Session, nodeToBrowse, nodeClassMask, returnDiagnostics, matchSomething  )
{
    var allReferences = GetTest1ReferencesFromNodeId( Session, nodeToBrowse );
    if( allReferences.length === 0 )
    {
        addError( "Test cannot be completed: the node <" + nodeToBrowse + "> must have at least one reference." );
        return -1;
    }

    var expectedReferences = FindReferencesOfNodeClass( allReferences, nodeClassMask );
    if( matchSomething && ( expectedReferences.length === 0 ) )
    {
        addError( "Test cannot be completed: the node <" + nodeToBrowse + "> must have at least one reference matching on nodeClassMask <" + NodeClass.toString(nodeClassMask) + ">." );
        return -1;
    }

    // browse
    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].NodeClassMask = nodeClassMask;

    addLog("Testing Browse with NodeClassMask <" + NodeClass.toString(request.NodesToBrowse[0].NodeClassMask) + ">");
    var foundreferences = GetReferencesFromRequest(Session, request)[0];

    // check result
    if (foundreferences.length > 0) {
        // verify all the references are expected
        AssertReferenceArraysEqual( expectedReferences, foundreferences );
    }
    else if ( matchSomething == false ) {
        addLog( "The server did not return any reference when browsing a node which does not have a reference to a node with the NodeClassMask <" + NodeClass.toString( request.NodesToBrowse[0].NodeClassMask ) + "> " );
    }
    else {
        addError("Browse failed for nodeClassMask <" + NodeClass.toString(nodeClassMask) );
    }
    
    return allReferences.length - expectedReferences.length;
}


// Browse a node with NodeClassMask specified. Ensure that the mask both includes
// and excludes references.
function BrowseOneNodeWithClassMaskMatchAndNoMatch( Session, nodeToBrowse, nodeClassMask, otherNodes, returnDiagnostics )
{
    var differentReferences = TestBrowseOneNodeWithClassMask( Session, nodeToBrowse, nodeClassMask, returnDiagnostics, true );
    for( var i = 0; ( differentReferences === 0 ) && ( i < otherNodes.length ); i++ )
    {
        // need to test a request that returns no references
        addLog( "Performing inverse test for nodeClassMask <" + NodeClass.toString(nodeClassMask) + ">" );
        nodeToBrowse = otherNodes[i].NodeId;
        differentReferences = TestBrowseOneNodeWithClassMask( Session, nodeToBrowse, nodeClassMask, returnDiagnostics, false );
    }
    if( differentReferences === 0 )
    {
        addError( "Test failed or cannot be completed: no nodes returned a reference not matching nodeClassMask <" + NodeClass.toString(nodeClassMask) + ">" );
    }
}
