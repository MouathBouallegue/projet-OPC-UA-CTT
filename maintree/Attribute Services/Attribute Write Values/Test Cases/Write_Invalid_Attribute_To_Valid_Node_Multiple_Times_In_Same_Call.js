/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to an invalid attribute of a valid node, multiple times in the same call. */

function write582Err008() {
const INVALIDATTRIBUTEID = 0x999;
    if( items == null || items.length == 0 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }
    var testItems = [];
    var expectedResults = [];
    for( var i=0; i<5; i++ ) {
        testItems.push( items[0].clone() );
        testItems[i].Value.Value.setDouble( 13.523 );
        testItems[i].AttributeId = 0x999;
        expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid ) );
    }//for i...
    return ( WriteHelper.Execute( { NodesToWrite: testItems, OperationResults: expectedResults, ReadVerification: false } ) );
}

Test.Execute( { Procedure: write582Err008 } );