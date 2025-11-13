include( "./library/Base/safeInvoke.js" );

include( "./library/Base/assertions.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/writeMask_writeValues.js" );
include( "./library/Base/NodeTypeAttributesMatrix.js" );

const CUNAME = "Address Space WriteMask";
var allAttributes = new NodeTypeAttributesMatrix().All;

if( Test.Connect() ) {
    // read the original values of all scalar types, because we will revert to their original values at 
    // the end of the test 
    var originalScalarValues = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings );
    if( originalScalarValues !== null && originalScalarValues.length !== 0 )
    {
        // Get all original attributes of all scalar settings to revert after the tests
        var originalScalarNodeAttributes = [];
        var expectedOperationResults_readAttributes = [];
        for( var n=0; n<originalScalarValues.length; n++ ) {
            var allAttributesOfNode = MonitoredItem.GetAttributesAsNodes( originalScalarValues[n], allAttributes );
            for( var a=0; a<allAttributesOfNode.length; a++ ) {
                originalScalarNodeAttributes.push( allAttributesOfNode[a] );
                expectedOperationResults_readAttributes.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadAttributeIdInvalid] ) );
            }
        }
        if( ReadHelper.Execute( { NodesToRead: originalScalarNodeAttributes, OperationResults: expectedOperationResults_readAttributes } ) ) {
            for( var i=0; i<originalScalarNodeAttributes.length; i++ ) originalScalarNodeAttributes[i].OriginalValue = originalScalarNodeAttributes[i].Value.Value.clone();
            Test.PostTestFunctions.push( revertToOriginalNodeAttributes );
        }
    }
}
else {
    addError( "Unable to connect to Server. Please check settings." );
    stopCurrentUnit();
}

function revertToOriginalNodeAttributes() {
    print( "\n\n\n\nReverting scalar static node attributes back to their original values." );
    var expectedOperationResults_revert = [];
    for( var i=0; i<originalScalarNodeAttributes.length; i++ ) {
        originalScalarNodeAttributes[i].Value.Value = originalScalarNodeAttributes[i].OriginalValue.clone();
        expectedOperationResults_revert.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotWritable, StatusCode.BadAttributeIdInvalid] ) );
    }
    WriteHelper.Execute( { NodesToWrite: originalScalarNodeAttributes, ReadVerification: false, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadWriteNotSupported] ), OperationResults: expectedOperationResults_revert } );
}

print( "****** CONFORMANCE UNIT '" + CUNAME + "' TESTING BEGINS ******" );
