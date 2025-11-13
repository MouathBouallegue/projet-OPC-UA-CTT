/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Check indexRange on array-based historical nodes */

function readraw011() {
    var result = true;

    // items at least one record are needed where the array size is at least 5
    var haItems = CUVariables.ItemsHistoryCountExceeds( 1, 5 );
    if( haItems.length === 0 ) { addSkipped( "No array item found to test with. None of the configured historical array items contain history data where every array is at least of size 5." ); return( false ); }

    var haparams = { 
          NodesToRead: haItems[0],
          HistoryReadDetails: UaReadRawModifiedDetails.New(
                                  { IsReadModified: false,
                                    StartTime: haItems[0].FirstValueInHistory.SourceTimestamp,
                                    EndTime: haItems[0].LastValueInHistory.SourceTimestamp,
                                    NumValuesPerNode: 0, 
                                    ReturnBounds: false } ),
          TimestampsToReturn: TimestampsToReturn.Source,
          ReleaseContinuationPoints: false,
          Debug: CUVariables.Debug };


    // TEST 1: indexRange = "1"
    if( CUVariables.Debug ) print( "\nTEST1 1: indexRange = \"1\"\n" );
    haItems[0].IndexRange = "1";
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #1 success expected." ) ) {
        if( !Assert.GreaterThan( 0, haItems[0].Value[0].Value.getArraySize(), "Node not an array!" ) ) result = false;
        else {
            if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
            var receivedIndexRangeValues = GetArrayTypeToNativeType( haItems[0].Value[0].Value );
            if( Assert.Equal( 1, receivedIndexRangeValues.length, "Length of the received value of the first record is wrong", "Correct length of the received value" ) ) {
                // check if the received value for indexRange = "1" matches the cached value on index 1
                var expectedCachedValues = GetArrayTypeToNativeType( haItems[0].RawValues[0].Value );
                Assert.Equal( expectedCachedValues[1], receivedIndexRangeValues[0], "Read value for index 1 of first record does not match the cached value", "Read value for index 1 of first record is matching the cached value" );
            }
            else result = false;
        }
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST 2: indexRange = "1:2"
    if( CUVariables.Debug ) print( "\nTEST1 2: indexRange = \"1:2\"\n" );
    haItems[0].IndexRange = "1:2";
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #2 success expected." ) ) {
        if( !Assert.GreaterThan( 0, haItems[0].Value[0].Value.getArraySize(), "Node not an array!" ) ) result = false;
        else {
            if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
            var receivedIndexRangeValues = GetArrayTypeToNativeType( haItems[0].Value[0].Value );
            if( Assert.Equal( 2, receivedIndexRangeValues.length, "Length of the received value of the first record is wrong", "Correct length of the received value" ) ) {
                // check if the received value for indexRange = "1:2" matches the cached value on index 1 and 2
                var expectedCachedValues = GetArrayTypeToNativeType( haItems[0].RawValues[0].Value );
                if( expectedCachedValues[1] != receivedIndexRangeValues[0] ||
                    expectedCachedValues[2] != receivedIndexRangeValues[1] ) {
                    addError( "Read value for index \"1:2\" of first record mismatches the cached value" );
                    result = false;
                }
                else addLog( "Read value for index \"1:2\" of first record is matching the cached value" );
            }
            else result = false;
        }
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST 3: indexRange = "2:4"
    if( CUVariables.Debug ) print( "\nTEST1 3: indexRange = \"2:4\"\n" );
    haItems[0].IndexRange = "2:4";
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #3 success expected." ) ) {
        if( !Assert.GreaterThan( 0, haItems[0].Value[0].Value.getArraySize(), "Node not an array!" ) ) result = false;
        else {
            if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
            var receivedIndexRangeValues = GetArrayTypeToNativeType( haItems[0].Value[0].Value );
            if( Assert.Equal( 3, receivedIndexRangeValues.length, "Length of the received value of the first record is wrong", "Correct length of the received value" ) ) {
                // check if the received value for indexRange = "2:4" matches the cached value on index 2-4
                var expectedCachedValues = GetArrayTypeToNativeType( haItems[0].RawValues[0].Value );
                if( expectedCachedValues[2] != receivedIndexRangeValues[0] ||
                    expectedCachedValues[3] != receivedIndexRangeValues[1] ||
                    expectedCachedValues[4] != receivedIndexRangeValues[2] ) {
                    addError( "Read value for index \"2:4\" of first record mismatches the cached value" );
                    result = false;
                }
                else addLog( "Read value for index \"2:4\" of first record is matching the cached value" );
            }
            else result = false;
        }
    }
    else result = false;
    CUVariables.ResetItems();


    // TEST 4: indexRange = "<last 3>"
    if( CUVariables.Debug ) print( "\nTEST 4: indexRange = \"last 3\"\n" );
    var length = haItems[0].RawValues[0].Value.getArraySize();
    haItems[0].IndexRange = ( length - 3 ) + ":" + ( length - 1 );
    if( Assert.True( HistoryReadHelper.Execute( haparams ), "HistoryRead() [test #4 success expected." ) ) {
        if( !Assert.GreaterThan( 0, haItems[0].Value[0].Value.getArraySize(), "Node not an array!" ) ) result = false;
        else {
            if( !Assert.Equal( haItems[0].RawValues[0].SourceTimestamp, haItems[0].Value[0].SourceTimestamp, "Wrong record received." ) ) result = false;
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), HistoryReadHelper.Response.Results[0].StatusCode, "Wrong operation status code.", "Correct operation status code" ) ) result = false;
            var receivedIndexRangeValues = GetArrayTypeToNativeType( haItems[0].Value[0].Value );
            if( Assert.Equal( 3, receivedIndexRangeValues.length, "Length of the received value of the first record is wrong", "Correct length of the received value" ) ) {
                // check if the received value for indexRange = "<last 3>" matches the cached value on index <last 3>
                var expectedCachedValues = GetArrayTypeToNativeType( haItems[0].RawValues[0].Value );
                if( expectedCachedValues[(length-3)] != receivedIndexRangeValues[0] || 
                    expectedCachedValues[(length-2)] != receivedIndexRangeValues[1] ||
                    expectedCachedValues[(length-1)] != receivedIndexRangeValues[2] ) {
                    addError( "Read value for index \"<last 3>\" of first record mismatches the cached value" );
                    result = false;
                }
                else addLog( "Read value for index \"<last 3>\" of first record is matching the cached value" );
            }
            else result = false;
        }
    }
    else result = false;


    haItems[0].IndexRange = "";
    return( result );
}// function readraw011

Test.Execute( { Procedure: readraw011 } );