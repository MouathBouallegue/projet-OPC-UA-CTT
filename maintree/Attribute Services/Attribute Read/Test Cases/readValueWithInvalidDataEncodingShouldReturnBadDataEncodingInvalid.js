/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: For a given node, read the Value attribute, and request invalid DataEncoding, e.g. Xml.

    See UA Part 4 1.03 Table 173 - Common Operation Level Result Codes
        BadDataEncodingInvalid    : if the node used in NOT based on a structure */

function read581err020() {
    // get an item to work with
    var item = originalScalarItems[0];

    var deQN = new UaQualifiedName();
    deQN.Name = "Xml";
    item.DataEncoding = deQN;

    return( ReadHelper.Execute( { NodesToRead: item, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadDataEncodingInvalid ) ] } ) );
}// function write581err020()

Test.Execute( { Procedure: read581err020 } );