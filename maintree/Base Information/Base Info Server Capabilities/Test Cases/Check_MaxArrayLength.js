/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: MaxArrayLength matches reality */

function test() {
    // read the value of the setting
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_MaxArrayLength ) )[0];
    
    if (!ReadHelper.Execute({ NodesToRead: item, OperationResults: [new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadNodeIdUnknown])] })) return (false);
    if (ReadHelper.Response.Results[0].StatusCode.isBad()) {
        addNotSupported("MaxArrayLength is not available within the ServerCapabilities object.");
        return (false);
    }
    var realValue = item.Value.Value.toUInt32();
    var testValue = item.Value.Value.toUInt32();

    // only continue if the value is not 0
    if( realValue == 0 ) {
        addWarning( "MaxArrayLength = 0, which means 'no limit'. Please verify if this is accurate. OperationLimit will be limited to this value." );
        testValue = MAX_ALLOWED_SIZE;
    }
    else if( realValue > MAX_ALLOWED_SIZE ) { 
        addWarning("MaxArrayLength is set to a value above " + MAX_ALLOWED_SIZE + ". OperationLimit will be limited to this value." );
        testValue = MAX_ALLOWED_SIZE;
    }

    // checkout the arrays that are configured and Read their values. We'll compare their lengths and see if any of them
    // exceed the value.
    var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings, Writable: true, SkipCreateSession: true } );
    if( items == null || items.length < 1 ) {
        addSkipped( "No writable Arrays configured in Settings. See settings > ServerTest > NodeIds > Static > All Profiles > Arrays" );
        return( false );
    }
    if( !ReadHelper.Execute( { NodesToRead: items } ) ) return( false );
    for( var i=0; i<items.length; i++ ) {
        if( testValue < items[i].Value.Value.getArraySize() ) addError( "Item " + items[i].NodeSetting + " has a value where the array size is greater than what is advertized as the max size (MaxArrayLength=" + testValue + ")" );
        items[i].InitialValue = items[i].Value.Value.clone(); // cache the value so we can write it back later
    }

    // now to see if we can re-write the array and increase the size
    for( var i=0; i<items.length; i++ ) items[i].AttributeId = Attribute.ArrayDimensions;
    if (!ReadHelper.Execute({ NodesToRead: items })) {
        return( false );
    }
    var writableNodes = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].Value.Value.isEmpty()) {
            addWarning("ArrayDimension of Node " + items[i].NodeId + "is null or undefined. Even though this attribute is marked as optional it shall be defined in some cases. Please verfiy correct behavior in Part 5, Common Variable Attributes.");
            continue;
        }
        if( items[i].Value.Value.toUInt32Array()[0] > realValue ) addError(items[i].NodeId + " has an allowed size (" + items[i].Value.Value.toUInt32Array()[0] + ") bigger than the server wide MaxArrayLength: ");
        if( items[i].Value.Value.toUInt32Array()[0] >= testValue || items[i].Value.Value.toUInt32Array()[0] == 0 ) writableNodes.push( items[i] );
    }
    if (writableNodes.length === 0) {
        addSkipped("All configured arrays have a fixed length which is shorter than the specified MaxArrayLength and therefore cannot be used for this test.");
        return( false );
    }

    // read the values again...
    for( var i=0; i<writableNodes.length; i++ ) writableNodes[i].AttributeId = Attribute.Value;                                // set the attribute back to Value 
    ReadHelper.Execute( { NodesToRead: writableNodes } );
    
    // overwrite the values by filling the array
    for( var i=0; i<writableNodes.length; i++ ) {
        UaVariant.Fill( { Variant: writableNodes[i].Value.Value, Length: testValue } );  // set the new value
        if( WriteHelper.Execute( { NodesToWrite: writableNodes[i], ReadVerification: false } ) ) {
            // now to revert all values back to their initial value....
            writableNodes[i].Value.Value = writableNodes[i].InitialValue.clone();
            WriteHelper.Execute( { NodesToWrite: writableNodes[i], ReadVerification: false } );
        }
    }
    return( true );
}

Test.Execute( { Procedure: test } );
