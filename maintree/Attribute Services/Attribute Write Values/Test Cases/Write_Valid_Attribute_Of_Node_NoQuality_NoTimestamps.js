/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to the Value attribute (without statusCode, sourceTimestamp, or serverTimestamp) of a valid nodeId. */

function write582001() {
    if( !isDefined( originalScalarValues ) || originalScalarValues.length == 0 ) { addSkipped( SETTING_UNDEFINED_SCALARSTATIC ); return( false ); }
    var item = originalScalarValues[0].clone();
    UaVariant.Increment( { Item: item } );
    return( WriteHelper.Execute( { NodesToWrite: item, 
                                   OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadWriteNotSupported ] ) ], 
                                   ReadVerification: false,
                                   CheckNotSupported: true } ) );
}

Test.Execute( { Procedure: write582001 } );