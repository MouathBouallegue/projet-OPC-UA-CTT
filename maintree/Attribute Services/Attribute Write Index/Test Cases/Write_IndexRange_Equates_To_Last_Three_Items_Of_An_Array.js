/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to an Array Node while specify an indexRange that will write to the last 3 elements of the array ONLY. */

function write582008() {
    var result = true;
    var originalArrays = [];

    ReadHelper.Execute( { NodesToRead: items } );
    // specify the element number that we want to write to 
    for ( var i = 0; i < items.length; i++ ) {
        originalArrays.push( items[i].Value.Value );
        // we now need to build the string to specify the range
        var lastIndex = items[i].Value.Value.getArraySize() - 1;
        var indexRangeString = ( lastIndex - 2 ) + ":" + lastIndex;
        items[i].IndexRange = indexRangeString;
    }
    var expectedResults = [];
    ReadHelper.Execute( { NodesToRead: items } );
    for ( var i = 0; i < items.length; i++ ) {
        UaVariant.Increment( { Item: items[i] } );
        // acceptable results for the write request
        var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResult.addExpectedResult( StatusCode.BadWriteNotSupported );
        expectedResults.push( expectedResult );
    }//for
    //WRITE the nodes.
    WriteHelper.Execute( { NodesToWrite: items, OperationResults: expectedResults, CheckNotSupported: true, ReadVerification: false } );
    for ( i = 0; i < items.length; i++ ) items[i].IndexRange = "";
    ReadHelper.Execute( { NodesToRead: items } );
    if ( WriteHelper.Response.Results.length != ReadHelper.Response.Results.length ) return ( false );
    for ( i = 0; i < items.length; i++ ) {
        if ( WriteHelper.Response.Results[i].StatusCode == StatusCode.Good ) {
            if ( items[i].Value.Value.getArraySize() != originalArrays[i].getArraySize() ) {
                addError( "Expected the same size of the array after the write. Expected: " + originalArrays[i].getArraySize() + ", received: " + items[i].Value.Value.getArraySize() );
                addWarning( "Skipping validation of the returned values because the size of the array has changed." );
                result = false;
                continue;
            }
        }
    }
    result = checkArraysAfterElementsWritten( Test.Session, WriteHelper.Request, WriteHelper.Response, originalArrays );
    return ( result );
}

Test.Execute( { Procedure: write582008 } );