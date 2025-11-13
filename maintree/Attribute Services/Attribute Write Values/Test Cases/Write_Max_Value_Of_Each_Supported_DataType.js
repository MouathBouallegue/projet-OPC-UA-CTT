/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write the MAXIMUM value for each supported data-type. */

function write582016() {
    if( !isDefined( items ) || items.length == 0 ) {
        addSkipped( SETTING_UNDEFINED_SCALARSTATIC );
        return( false );
    }
    // do a reading of the items first, to get the values and DATA TYPES!!!!
    if( ReadHelper.Execute( { NodesToRead: items } ) ) {
        var itemsToWrite = []; // these are the items that we will use for Writing 
        var expectedResults = [];
        for( var i=0; i<items.length; i++ ) {
            var addItemToWriteList = true;
            // clone the current value, and store in a new property called 'originalValue'
            items[i].originalValue = items[i].Value.Value.clone();
            // generate a value based on the type
            UaVariant.SetValueMax( { Item: items[i] } );
            if( addItemToWriteList ) {
                // add the item to our list of items to write to
                itemsToWrite.push( items[i] );
                // now specify the expected results for this individual write transaction
                var newErr = new ExpectedAndAcceptedResults( StatusCode.Good );
                newErr.addExpectedResult( StatusCode.BadWriteNotSupported );
                expectedResults.push( newErr );
            }
        }// for i...
        // now Write
        if( itemsToWrite == null || itemsToWrite.length < 3 ) {
            addWarning( "Not enough nodes to test with. Aborting test." );
            return( false );
        }
        WriteHelper.Execute( { NodesToWrite: itemsToWrite, OperationResults: expectedResults, CheckNotSupported: true } );

        // lastly, revert back to the previous values (recorded in the clonedItems)
        for( var i=0; i<itemsToWrite.length; i++ ) itemsToWrite[i].Value.Value = itemsToWrite[i].originalValue;
        WriteHelper.Execute( { NodesToWrite: itemsToWrite, OperationResults: expectedResults, CheckNotSupported: true } );
    }
    else return( false );
    return( true );
}

Test.Execute( { Procedure: write582016 } );