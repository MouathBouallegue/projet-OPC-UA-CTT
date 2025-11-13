/*  Test prepared by compliance@opcfoundation.org
    Description: Write() to an element that is outside of the bounds of the array, e.g. IndexRange="[length+2]".
*/

function write582006() {
    var expectedResults = [];
    var result = true;
    var originalArrays = [];
    var writtenValues = new UaVariants();
    ReadHelper.Execute( { NodesToRead: items } );
    // specify the element number that we want to write to 
    for ( var i = 0; i < items.length; i++ ) {
        originalArrays.push( items[i].Value.Value );
    }

    var writeIndexRanges = new UaUInt32s();
    // specify invalid index range and generate values for each core data type
    for ( var i = 0; i < items.length; i++ ) {
        expectedResults[i] = new ExpectedAndAcceptedResults( [StatusCode.BadIndexRangeNoData, StatusCode.Good] );
        writeIndexRanges[i] = items[i].Value.Value.getArraySize() + 2;
        items[i].IndexRange = writeIndexRanges[i].toString();
        writtenValues[i] = generateArrayWriteValue( 0, 0, UaNodeId.GuessType( items[i].NodeSetting ) );
        items[i].Value.Value = writtenValues[i];
    }

    //WRITE the nodes.
    if ( WriteHelper.Execute( { NodesToWrite: items, OperationResults: expectedResults, CheckNotSupported: true, ReadVerification: false } ) ) {
        for ( i = 0; i < WriteHelper.Response.Results.length; i++ ) {
            if ( WriteHelper.Response.Results[i].isGood() ) {
                items[i].IndexRange = "";
                ReadHelper.Execute( { NodesToRead: items[i] } );
                if ( items[i].Value.Value.getArraySize() != originalArrays[i].getArraySize() + 3 ) {
                    addError( "Expected the same size of the array after the write. Expected: " + originalArrays[i].getArraySize() + ", received: " + items[i].Value.Value.getArraySize() );
                    addWarning( "Skipping validation of the returned values because the size of the array has changed." );
                    result = false;
                    continue;
                }
                var expectedArray = GetArrayTypeToNativeType( originalArrays[i] );
                var readNativeValues = GetArrayTypeToNativeType( ReadHelper.Response.Results[0].Value );

                for ( var s = 0; s < expectedArray.length; s++ ) {
                    if ( !Assert.Equal( expectedArray[s], readNativeValues[s], "The element " + s + " of the array is not as expected." ) ) result = false;
                }
                if ( !Assert.Equal( writtenValues[i], readNativeValues[writeIndexRanges[i]], "The written element with the index " + writeIndexRanges[i] + " of the array is not as expected." ) ) result = false;
            }
            else {
                print( "The OperationResult is BadIndexRangeNoData as expected. Skipping validation of the current value." );
            }
        }
    }
    else result = false;
    return ( result );
}

Test.Execute( { Procedure: write582006 } );