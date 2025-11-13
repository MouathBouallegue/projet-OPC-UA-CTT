/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to the same node multiple times in the same call. This is done for each core data type: 
            Bool, Byte, SByte, ByteString, DateTime, Decimal, Double, Float, Guid, Int16, UInt16, Int32, UInt32,  Int64, UInt64, String */

Test.Execute( {
    Procedure: function test() {
        var result = true;
        if ( !isDefined( items ) || items.length == 0 ) { addSkipped( "No Scalar items defined. Check settings. Aborting test." ); return ( false ); }

    ReadHelper.Execute( { NodesToRead: items, TimestampsToReturn: TimestampsToReturn.Server } );

    // now to iterate thru each data-type and issue 5 instructions within the single call; this will 
    // involve cloning the item and then changing the value 
    for( var t=0; t<items.length; t++ ){
        addLog("Testing type: " + getDataTypeNameFromNodeId( "i=" + UaNodeId.GuessType( items[t].NodeSetting ) ) );

            // first, create our list of items to write, and values.
            var values = [];
            var itemsByType = [];
            for ( var i = 0; i < 5; i++ ) { // i=item
                itemsByType.push( MonitoredItem.Clone( items[t], { IncludeValue: true } ) );
                for ( var v = i; v < 5; v++ ) {
                    UaVariant.Increment( { Item: itemsByType[i] } );
                }
                values.push( itemsByType[i].Value.Value );
            }

            // second, write the values. Read them back...
        if( WriteHelper.Execute( { NodesToWrite: itemsByType, ReadVerification: false } ) ) {
            ReadHelper.Execute( { NodesToRead: itemsByType, TimestampsToReturn: TimestampsToReturn.Server, MaxAge: 0 } );

            // compare the value received is the same for all values
            var firstValue = itemsByType[0].Value.Value;
            Assert.ValueInValues( firstValue, values, "Expected a value that was previously written. According to the specification a write should return after the write operation has been completed otherwise the server needs to return a Good_CompletesAsynchronously." );

            addLog( "Checking that all returned values match: " + firstValue );
            for ( var i = 1; i < ReadHelper.Response.Results.length; i++ ) {
                if ( !firstValue.equals( ReadHelper.Response.Results[i].Value ) ) addError( "Read.Response.Results[" + i + "].Value mismatch." ); result = false;
            }//for i...
        }
        else {
            addError( "Previous Write failed, skipping validation of the written values. Tried to write values: " + values + " to node: " + itemsByType[0].NodeId );
            result = false;
        }
    }
        return ( result );
    }
} );
