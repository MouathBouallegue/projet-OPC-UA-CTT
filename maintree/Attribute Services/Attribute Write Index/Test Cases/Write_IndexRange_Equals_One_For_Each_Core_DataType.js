/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a element 1 within an array, for each supported data-type. */

function write582005() {
    var result = true;
    var originalArrays = [];
    ReadHelper.Execute( { NodesToRead: items } );
    // specify the element number that we want to write to 
    for ( var i = 0; i < items.length; i++ ) {
        originalArrays[i] = ( items[i].Value.Value.clone() );
        items[i].IndexRange = "1";
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

Test.Execute( { Procedure: write582005 } );