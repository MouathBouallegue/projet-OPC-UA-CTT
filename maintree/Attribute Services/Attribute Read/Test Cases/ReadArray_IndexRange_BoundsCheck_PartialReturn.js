/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    IndexRange's lower bound is within the array's range but exceeding the array`s upper bound for each support array data type.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
                    Server returns a partial result starting from the specified lower index until the last element of the array.
    Note:           This test case only applies, when the server supports arrays.
 */

function readArray581036( item, nodeType ) {
    var numberOfValidItems = 1;
    print( "\nTESTING TYPE: " + BuiltInType.toString( nodeType ) + "\nNode: " + item.NodeId.toString() );
    print( "-------------------------------------------------------------------" );

    var actualArray = [], expectedArray = [];
    if( item == null ) return( false );

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 1) INITIAL READING OF WHOLE ARRAY.
    */
    var readArray;
    print( "Get the initial value of the array." );
    if( ReadHelper.Execute( { NodesToRead: item } ) ) {
        // store the array value, because we'll compare against it later...
        var valueAsArray = GetArrayTypeToNativeType( ReadHelper.Response.Results[0].Value );

        // check the data type
        var moveOntoSecondRead = true;
        if( nodeType == BuiltInType.Byte ) {
            moveOntoSecondRead = Assert.GreaterThan( numberOfValidItems, valueAsArray.length, "Array too short. Needs to be at least " + numberOfValidItems + " characters long. Node '" + item.NodeId + "' on setting '" + item.NodeSetting + "'" );
        }
        else {
            Assert.Equal( 1, ReadHelper.Response.Results[0].Value.ArrayType, "Expected an Array type." );
            moveOntoSecondRead = Assert.GreaterThan( numberOfValidItems, ReadHelper.Response.Results[ 0 ].Value.getArraySize(), "Array too short. Needs to be at least " + numberOfValidItems + " elements long. Node '" + item.NodeId + "' on setting '" + item.NodeSetting + "'" );
        }
        if( moveOntoSecondRead ) {
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 2) READING ARRAY SPECIFYING AN INDEX RANGE TO RETREIVE THE
                2ND ELEMENT OF THE ARRAY ONLY. */
            // we now need to build the string to specify the range
            // treat byte[] and bytestring differently from other data-types
            var arrayLength;
            if( nodeType === BuiltInType.Byte || nodeType === BuiltInType.ByteString ) {
                // treat bytestring different to bytestring[]
                if( ReadHelper.Response.Results[0].Value.ArrayType === 1 ) {
                    // bytestring[]
                    arrayLength = valueAsArray.length ;
                }
                else {
                    // bytestring
                    arrayLength = ( valueAsArray.toHexString().length - 2 ) / 2;
                }
            }
            else {
                arrayLength = valueAsArray.length;
            }
            var indexRangeString = ( arrayLength - numberOfValidItems ) + ":" + ( arrayLength + 10 );
            item.IndexRange = indexRangeString;

            print( "Get the last " + numberOfValidItems + " elements of the array: '" + item.IndexRange + "'." );
            if ( ReadHelper.Execute( { NodesToRead: item } ) ) {
                if ( item.Value.StatusCode.isGood() ) {
                    // depending upon the data-type, we will either do an element-by-element
                    // check, or a string compare
                    if ( nodeType == BuiltInType.Byte || nodeType == BuiltInType.ByteString ) {
                        // we need to treat ByteString differently to ByteString[]
                        if ( ReadHelper.Response.Results[ 0 ].Value.ArrayType === 1 ) {
                            // bytestring[]
                            // check that array elements 2-4 are equal
                            var newValueAsArray = GetArrayTypeToNativeType( ReadHelper.Response.Results[ 0 ].Value );
                            Assert.Equal( newValueAsArray.length, numberOfValidItems, "Expected to receive exactly " + numberOfValidItems + " elements." );
                            for ( var v = ( arrayLength - numberOfValidItems ); v <= newValueAsArray.length; v++ ) {
                                var offset = v - ( arrayLength - numberOfValidItems );
                                Assert.Equal( valueAsArray[ v ], newValueAsArray[ offset ], "Expected to receive the same array element." );
                            }//for v...
                        }
                        else {
                            // bytestring
                            var range = valueAsArray.getRange( ( arrayLength - numberOfValidItems ), ( arrayLength - 1 ) );
                            Assert.Equal( ReadHelper.Response.Results[ 0 ].Value.toByteString(), range, "Expected: " + range.toHexString() + " but received: " + ReadHelper.Response.Results[ 0 ].Value.toByteString().toHexString() );
                        }
                    }
                    else {
                        // should have only received the expected number of values
                        readArray = GetArrayTypeToNativeType( ReadHelper.Response.Results[ 0 ].Value );
                        Assert.Equal( numberOfValidItems, readArray.length, "Number of requested array elements was not equal to the number of returned elements" );

                        // get the values into variables
                        for ( var i = 0; i < readArray.length; i++ ) {
                            actualArray.push( UaVariantToSimpleType( readArray[ i ] ) );
                        }
                        for ( var j = ( valueAsArray.length - numberOfValidItems ); j < valueAsArray.length; j++ ) {
                            expectedArray.push( UaVariantToSimpleType( valueAsArray[ j ] ) );
                        }
                        print( "\tSame? " + Assert.Equal( expectedArray, actualArray, "The requested array element was not returned" ) + "; Original='" + expectedArray + "' vs Now='" + actualArray + "'" );
                    }//if nodeType...
                }
            }//if Read
        }//if moveOntoSecondRead
    }//if Read
}

function read581036() {
    var items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings );
    if ( items == null || items.length == 0 ) {
        items = MonitoredItem.fromNodeIds( [ new UaNodeId.fromString( Identifier.Server_ServerCapabilities_ServerProfileArray.toString() ) ] );
        readArray581028( items[ 0 ], BuiltInType.String );
    }
    else {
        for ( var i = 0; i < items.length; i++ ) {
            readArray581036( items[ i ], UaNodeId.GuessType( items[ i ].NodeSetting ) );
        }
    }
    return( true );
}

Test.Execute( { Procedure: read581036 } );