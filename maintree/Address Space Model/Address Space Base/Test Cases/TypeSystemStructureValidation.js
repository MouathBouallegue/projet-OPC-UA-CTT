/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org 
    Description: Verify the root folder contains the correct objects below it */

function test() {
    const ERR_MSG = " missing from the system. This is legal for Nano and Micro UA Servers because the type-system is optional. All other Servers must include them.";
    var result = true;

    var expectedFolders = [
        new UaNodeId( Identifier.RootFolder ),
        new UaNodeId( Identifier.ObjectsFolder ),
        new UaNodeId( Identifier.TypesFolder ),
        new UaNodeId( Identifier.ViewsFolder ),
        new UaNodeId( Identifier.ObjectTypesFolder ),
        new UaNodeId( Identifier.VariableTypesFolder ),
        new UaNodeId( Identifier.ReferenceTypesFolder ),
        new UaNodeId( Identifier.DataTypesFolder ),
        new UaNodeId( Identifier.EventTypesFolder )
    ];

    var expectedResults = [
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotFound, StatusCode.BadNodeIdUnknown] ),
        new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotFound, StatusCode.BadNodeIdUnknown] ),
        new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotFound, StatusCode.BadNodeIdUnknown] ),
        new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotFound, StatusCode.BadNodeIdUnknown] ),
        new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotFound, StatusCode.BadNodeIdUnknown] )];

    if( BrowseHelper.Execute( { NodesToBrowse: expectedFolders, OperationResults: expectedResults } ) ) {
        var results = [];
        for( var i = 0; i < BrowseHelper.Response.Results.length; i++ ) results.push( BrowseHelper.Response.Results[i].StatusCode.isGood() );
        if( !results[4] ) addWarning( "ObjectType" + ERR_MSG );
        if( !results[5] ) addWarning( "VariableType" + ERR_MSG );
        if( !results[6] ) addWarning( "ReferenceType" + ERR_MSG );
        if( !results[7] ) addWarning( "DataType" + ERR_MSG );
        if( !results[8] ) addWarning( "EventType" + ERR_MSG );
    }
    else result = false;

    var objectsToTest = [new UaNodeId( Identifier.BaseObjectType ), new UaNodeId( Identifier.References ), new UaNodeId( Identifier.BaseVariableType ), new UaNodeId( Identifier.BaseEventType ), new UaNodeId( Identifier.BaseDataType )];
    var nodeClasses = [NodeClass.ObjectType, NodeClass.ReferenceType, NodeClass.VariableType, NodeClass.ObjectType, NodeClass.DataType];


    for( var s = 0; s < objectsToTest.length; s++ ) {
        if( verifyReferences( objectsToTest[s], nodeClasses[s] ) ) {
            print( "Validation of object " + objectsToTest[s] + " succeeded" );
        }
        else {
            print( "Validation of object " + objectsToTest[s] + " failed" );
            result = false;
        }
    }

    return ( result );
}


Test.Execute( { Debug: true, Procedure: this.test } );

function verifyReferences( nodeId, nodeClass ) {
    var innerResult = true;
    var references = GetDefaultReferencesFromNodeId( Test.Session.Session, nodeId, new ExpectedAndAcceptedResults( StatusCode.Good, [StatusCode.BadNodeIdUnknown, StatusCode.BadNotFound] ), BrowseDirection.Forward, false );
    for( var i = 0; i < references.length; i++ ) {
        if( references[i].ReferenceTypeId.equals( new UaNodeId( Identifier.HasSubtype ) ) ) {
            if( references[i].NodeClass != nodeClass ) {
                addError( "The NodeClass of the NodeId: " + references[i].NodeId.NodeId + ", does not match the expectations. Expected: " + LookupNodeClassName( nodeClass ) + ", Received: " + LookupNodeClassName( references[i].NodeClass ) );
                innerResult = false;
            }
            else {
                print( "Validation of the NodeClass of the node with the NodeId: " + references[i].NodeId.NodeId + ", succeeded." );
            }
            verifyReferences( new UaNodeId( references[i].NodeId.NodeId ), nodeClass );
        }
    }
    return ( innerResult );
}