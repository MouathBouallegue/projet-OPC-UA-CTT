/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write a value exceeding the InstrumentRange (high and low values) */

function readBackAndVerifyResult( item, instrumentRange, writeResult ) {
    
    var valueWritten = UaVariantToSimpleType( item.Value.Value );
    ReadHelper.Execute( { NodesToRead: [ item ] } );
    var valueRead = UaVariantToSimpleType( item.Value.Value );

    switch( writeResult.StatusCode ) {
        case StatusCode.GoodClamped:
            if( !( ( valueRead == instrumentRange.High && valueWritten > valueRead ) || 
                   ( valueRead == instrumentRange.Low && valueWritten < valueRead ) ) ) {
                addError( "The value should have been clamped to the exceeded InstrumentRange.Low: " + instrumentRange.Low + " or InstrumentRange.High: " + instrumentRange.High + " as the server returned StatusCode Good_Clamped.\nValue read: " + valueRead + "\nValue written that exceeded the bounds of the InstrumentRange: " + valueWritten );
                return( false );
            }
        break;
        case StatusCode.Good:
            if( valueRead !== valueWritten ) {
                addError( "The value should have been accepted as the server returned StatusCode Good.\nValue read: " + valueRead + "\nValue written: " + valueWritten );
                return( false );
            }
        break;
        case StatusCode.BadOutOfRange:
            if( valueRead === valueWritten ) {
                addError( "The written value should not have been accepted as the server returned StatusCode Bad_OutOfRange.\nValue read: " + valueRead + "\nValue written: " + valueWritten );
                return( false );
            }
        break;
    }
    
    return( true );
}

function analog613020() {
    var item1;
    var analogItem;
    // find a node that has an InstrumentRange 
    var expectedResults = [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) ];
    for( var i=0; i<AnalogItems.length; i++ ) {
         if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { Node: AnalogItems[i], BrowsePaths: [ "InstrumentRange" ], OperationResults: expectedResults, } ) ) return( false );
         if( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].StatusCode.isGood() ) {
             item1 = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
             analogItem = AnalogItems[i];
             break;
         }
    }//for i
    if( !isDefined( item1 ) ) {
        addSkipped( "Unable to find a node of type AnalogItemType featuring an `InstrumentRange` property, which is an OPTIONAL property." );
        return( false );
    }
    // read the InstrumentRange, and then remember the value; also get the analogitem value 
    ReadHelper.Execute( { NodesToRead: [ item1, analogItem ] } );
    item1.OriginalValue = item1.Value.Value.clone();
    var instrumentRangeValue = item1.Value.Value.toExtensionObject().toRange();
    addLog( "InstrumentRange received in Read() =" + instrumentRangeValue.toString() );
    // UA Meeting 2019-01-29: Wording of the EURange counts for the InstrumentRange as well
    // This means we need to accept 3 cases:
    // 1. Write Response is good --> Read back the value and see if it really has been accepted
    // 2. Write Response is clamped --> Value is clamped to another value
    // 3. Write REsponse is Bad_OutOfRange --> Read back the value and see if it really haven't been accepted
    // write a value less than InstrumentRange.Low
    analogItem.SafelySetValueTypeKnown( parseInt( instrumentRangeValue.Low - 1 ), analogItem.Value.Value.DataType );
    addLog( "Write() value '" + analogItem.Value.Value + "' to exceed InstrumentRange.Low (value = " + instrumentRangeValue.Low + ") to node: " + analogItem.NodeSetting + "." );
    WriteHelper.Execute( { NodesToWrite: analogItem, OperationResults: new ExpectedResults( { Expected: [ StatusCode.BadOutOfRange, StatusCode.Good, StatusCode.GoodClamped ] } ), ReadVerification: false } );
    readBackAndVerifyResult( analogItem, instrumentRangeValue, WriteHelper.Response.Results[0] );
    // write a value greater than InstrumentRange.High, which should also be fine
    analogItem.SafelySetValueTypeKnown( parseInt( instrumentRangeValue.High + 1 ), analogItem.Value.Value.DataType );
    addLog( "Write() value '" + analogItem.Value.Value + "' to exceed InstrumentRange.High (value = " + instrumentRangeValue.High + ") to node: " + analogItem.NodeSetting + "." );
    WriteHelper.Execute( { NodesToWrite: analogItem, OperationResults: new ExpectedResults( { Expected: [ StatusCode.BadOutOfRange, StatusCode.Good, StatusCode.GoodClamped ] } ), ReadVerification: false } );
    readBackAndVerifyResult( analogItem, instrumentRangeValue, WriteHelper.Response.Results[0] );
    // clean-up
    analogItem = null;
    item1 = null;
    return( true );
}// function analog613020()

Test.Execute( { Procedure: analog613020 } );