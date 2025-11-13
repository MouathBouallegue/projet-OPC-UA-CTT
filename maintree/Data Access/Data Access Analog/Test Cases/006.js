/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Write the following 3 values to an analog node of each supported type: EURange.Low, EURange.High, and a number in the middle of the EURange. */

function write613006() {
    // Check if writable analog items are available
    if ( WritableAnalogItems == null || WritableAnalogItems.length == 0 ) {
        addSkipped( "No writable analog items defined" );
        return( false );
    }
    ReadHelper.Execute( { NodesToRead: WritableAnalogItems } );
    // Test each of the analog item one by one
    for( var i=0; i<WritableAnalogItems.length; i++ ) {
        // Get the EURange for this analog node
        var analogNodeEURange = GetNodeIdEURange( WritableAnalogItems[i].NodeSetting );        
        // Does the item have an EURange defined?
        if( analogNodeEURange == null ) {
            print( "EURange not defined for analog node '" + WritableAnalogItems[i] + "'. Skipping node.");
            continue;
        }
        
        // EURange defined, continue with the test
        print ( "EURange property of analog node '" + WritableAnalogItems[i] + "' is: " + analogNodeEURange );
        
        // Get the datatype of the current node we are processing
        var currentNodeDataType = WritableAnalogItems[i].Value.Value.DataType; //UaNodeId.GuessType( WritableAnalogItems[i].Setting ) ;
        
        // In this loop we write the three values for this test (in the order listed below)
        // 1) EURange.Low
        // 2) EURange.High
        // 3) No. in the middle of the EURange
        for( var n=0; n<3; n++ ) {
            // Get the value we are writing
            switch( n ) {
                // Low
                case 0:
                    WritableAnalogItems[i].SafelySetValueTypeKnown( analogNodeEURange.Low, currentNodeDataType );
                    print ( "Writing EURange.Low value: " + UaVariantToSimpleType( WritableAnalogItems[i].Value.Value ) );
                    break;                    
                // High
                case 1:
                    WritableAnalogItems[i].SafelySetValueTypeKnown( analogNodeEURange.High, currentNodeDataType );
                    print ( "Writing EURange.High value: " + UaVariantToSimpleType( WritableAnalogItems[i].Value.Value ) );
                    break;                    
                // Middle
                case 2:
                    var middleValue = ( analogNodeEURange.Low + GetEURangeAsSize( analogNodeEURange ) / 2 );
                    WritableAnalogItems[i].SafelySetValueTypeKnown( middleValue, currentNodeDataType );
                    print ( "Writing value in the middle of the EURange: " + UaVariantToSimpleType( WritableAnalogItems[i].Value.Value ) );
                    break;                    
            }

            // Write the value
            if( !WriteHelper.Execute( { NodesToWrite: WritableAnalogItems[i], ReadVerification: true } ) ) {                
                addError( "Write failed." );
                continue;
            }

        }
    }
    return( true );
}// function write613006() 

Test.Execute( { Debug: true, Procedure: write613006 } );