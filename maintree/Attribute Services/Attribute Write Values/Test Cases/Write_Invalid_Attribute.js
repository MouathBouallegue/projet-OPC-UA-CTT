/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to an invalid attribute of a valid node. */

function write582Err008() {
    if( !isDefined( originalScalarValues ) || originalScalarValues.length == 0 ) { addSkipped( SETTING_UNDEFINED_SCALARSTATIC ); return( false ); }
    var item = originalScalarValues[0].clone();
    UaVariant.Increment( { Item: item } );
    item.AttributeId = 0;
    return( WriteHelper.Execute( { NodesToWrite: item, OperationResults: new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid ), ReadVerification: false } ) );
}

Test.Execute( { Procedure: write582Err008 } );