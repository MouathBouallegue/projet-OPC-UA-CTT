/*    Test 5.7.1-5 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has references of different types
            And a referenceTypeId (that matches a reference) is specified in the call
            And includeSubtypes is false
          When Browse is called
          Then the server returns references of type referenceTypeId
          Validation is accomplished by first browsing all references on a node,
          storing the references of the specified type, and comparing those 
          references to the "ReferenceTypeId = [specified type]" references
          (expecting them to be equal).
          A hole in the test: if the Browse call returns only some references
          (i.e., requires BrowseNext), only the references returned by Browse
          are validated (because this is a Browse test, not BrowseNext). If 
          all the returned references match the specified type, the test passes,
          even though calling BrowseNext might return references of an
          unspecified type. */

function BrowseOneNodeWithReferenceTypeIdNoSubtypes( returnDiagnostics ) {
    var usableNodes = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.References.Settings );
    var executedDesiredTest = false;
    for( i=0; i<usableNodes.length; i++ ) {
        var nodeToBrowse = usableNodes[i].NodeId;
        if( !isDefined( nodeToBrowse ) ) {
            addSkipped( "[Configuration Issue?] Check setting '/Server Test/NodeIds/References'." );
            return( false );
        }
        var referenceTypes = [];
        var allReferences = GetReferencesAndCountTypes( nodeToBrowse, referenceTypes, Test.Session.Session );
        if( allReferences.length == 0 ) {
            addError( "Test cannot be completed: the node must have at least two references." );
            return( false );
        }
        var request = GetTest1BrowseRequest( Test.Session.Session, nodeToBrowse );
        var response = new UaBrowseResponse();

        request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
        request.NodesToBrowse[0].ReferenceTypeId = allReferences[0].ReferenceTypeId;
        request.NodesToBrowse[0].IncludeSubtypes = false;

        uaStatus = Test.Session.Session.browse( request, response );
        // check result
        if( uaStatus.isGood() ) {
            if( AssertBrowseValidParameter( request, response ) ) {
                var nodeRequest = request.NodesToBrowse[0];
                // collect expected references (those matching the specified ReferenceTypeId or its subtypes)
                var expectedTypes = [nodeRequest.ReferenceTypeId];

                var expectedReferences = GetReferencesOfTypes( allReferences, expectedTypes );
                if( expectedReferences.length == allReferences.length ) {
                    addSkipped( "Test cannot be completed: all the node's references are the same type or are subtypes of the requested type." );
                }
                // compare expected references to returned references
                var resultRefs = response.Results[0].References;
                if( AssertNodeReferencesInListNotOrdered( expectedReferences, resultRefs ) ) {
                    // all returned references should be of the expected type (handy for logging, otherwise redundant)
                    var result = response.Results[0];
                    AssertReferencesAreOfTypes( expectedTypes, result.References );
                }
                expectedReferences = GetReferencesOfTypes( allReferences, expectedTypes );
                if( !AssertNodeReferencesInListNotOrdered( expectedReferences, resultRefs ) ) {
                    print( "No reference of a subtype was found on Node (" + nodeToBrowse + "). Therefore we can't verify whether the InlcudeSubtypes is respected by the server or not.\nPlease check the CTT Settings to ensure the UaNode '/Server Test/NodeIds/References/Has References of a ReferenceType and SubType' has at least two references where one is the Subtype of the other.\nThis means that the node being browsed needs to have reference that are of a type like HasComponent and also include a reference that is subtype of it like HasAlarmSuppressionGroup." );
                }
                else {
                    print( "Executed the test on a Node (" + nodeToBrowse + ") which had the necessary references." );
                    executedDesiredTest = true;
                    break;
                }
            }
        }
        else addError( "browse() failed: " + uaStatus, uaStatus );
    }
    if( executedDesiredTest === false ) {
        addSkipped( "No reference of a subtype was found. Therefore we can't verify whether the InlcudeSubtypes is respected by the server or not.\nPlease check the CTT Settings to ensure the UaNode '/Server Test/NodeIds/References/Has References of a ReferenceType and SubType' has at least two references where one is the Subtype of the other.\nThis means that the node being browsed needs to have reference that are of a type like HasComponent and also include a reference that is subtype of it like HasAlarmSuppressionGroup." );
    }
    return executedDesiredTest;
}

Test.Execute( { Procedure: function test() { 
    var result = BrowseOneNodeWithReferenceTypeIdNoSubtypes( 0 );
    if( !BrowseOneNodeWithReferenceTypeIdNoSubtypes( 0x3ff ) ) result = false; 
    return( result ); } } );