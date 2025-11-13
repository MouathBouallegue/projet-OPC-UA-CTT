/*    Test 5.7.2-12 prepared by Dale Pope dale.pope@matrikon.com
      Test case updated on 25th of October 2019:
      New Description: As a preparation:
            a) Browse a valid node with default parameters to get the full browse result. At least three references must be returned.
            Remember the # of references returned by the server in the BrowseResponse.
            b) Browse as before but with requestedMaxReferencesPerNode set to different values:
            number of the references in the BrowseResponse - 1, number of the references in the BrowseResponse - 2,  half of the references, half of the references - 1, half of the references + 1.
            c) For each number, call BrowseNext() with the ContinuationPoint from the Browse result, and releaseContinuationPoints = False until all refrences have been received.
      Expected Result:
        Service result = Good.
        The number of references in the BrowseResponse match the requestedMaxReferencePerNode and the ContinuationPoint is not null.
        In the BrowseNextResponse there is at least one reference but not more than the requestedMaxReferencesPerNode.
        If all references are returned the ContinuationPoint in the last Browse or BrowseNext is null.
       */

// Return the response from a call to Browse requesting a number of references of a node.
function GetBrowseResponseForMaxReferences( nodeToBrowse, maxReferences ) {
    var request = GetDefaultBrowseRequest( Test.Session.Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    request.RequestedMaxReferencesPerNode = maxReferences;
    var uaStatus = Test.Session.Session.browse( request, response );
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) ) {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }
    return response;
}

function TestBrowseNextWithMaxReferences( nodeToBrowse, maxReferences, expectedReferences ) {
    if( maxReferences === 0 ) {
        addWarning( "Skipping test because 'maxReferences' will expect 0 references (according to the parameter) which is not valid. This is likely a problem with the number of references that exist being small such that the formula used by this script (X / 2)-1 results in zero. Ignore this message." );
        return( false );
    }
    addLog( "Testing Browse/BrowseNext with RequestedMaxReferencesPerNode = " + maxReferences + " (out of " + expectedReferences.length + " total)" );
    // Browse for first reference
    var firstResponse = GetBrowseResponseForMaxReferences( nodeToBrowse, maxReferences );
    if( firstResponse == -1 ) {
        return( false );
    }
    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    AssertBrowseNextReturnsReferences( Test.Session.Session, [ expectedReferences ], maxReferences, firstResponse );
}

function Test572012() {
    const SETTING = "/Server Test/NodeIds/References/Has 3 Forward References 1";
    var nodeToBrowse = UaNodeId.fromString( readSetting( SETTING ).toString() );
    if( nodeToBrowse == null ) {
        addSkipped( "Setting not defined: '" + SETTING + "'." );
        return( false );
    }
    // get expected references and ensure they're Inverse
    var allReferences = GetDefaultReferencesFromNodeId(Test.Session.Session, nodeToBrowse, undefined, undefined, true);
    var expectedReferences = allReferences[0];
    if( expectedReferences.length < 3 ) {
        addSkipped( "Setting node defined: '" + SETTING + "'." );
        return( false );
    }
    print( "~~~ EXPECTED REFERENCES LENGTH: " + expectedReferences.length );
    TestBrowseNextWithMaxReferences(nodeToBrowse, allReferences[1] - 1, expectedReferences );
    TestBrowseNextWithMaxReferences(nodeToBrowse, allReferences[1] - 2, expectedReferences );
    TestBrowseNextWithMaxReferences(nodeToBrowse, Math.floor(allReferences[1] / 2 ), expectedReferences );
    TestBrowseNextWithMaxReferences(nodeToBrowse, Math.floor(allReferences[1] / 2 ) - 1, expectedReferences );
    TestBrowseNextWithMaxReferences(nodeToBrowse, Math.floor(allReferences[1] / 2 ) + 1, expectedReferences );
    return( true );
}

Test.Execute( { Procedure: Test572012 } );