/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to the Value attribute of a Variable, where the AccessLevel == CurrentWriteService.*/

function write582020() {
    const SETTING = "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite";
    if( !AssertSettingGood( SETTING, undefined, true ) ) return( false );

    // step 1: identify a node from the settings that we can use in this test
    var item = MonitoredItem.fromSetting( SETTING, 0, Attribute.AccessLevel );

    // we actually need to read the access level, and the value attribute so we can identify that data-type (needed for write)
    var itemV = MonitoredItem.Clone( item );
    itemV.AttributeId = Attribute.Value;

    // we actually need to read the access level, and the value attribute so we can identify that data-type (needed for write)
    var itemD = MonitoredItem.Clone( item );
    itemD.AttributeId = Attribute.DataType;

    // step 2: read the node to make sure that it is writable
    //         (it should be since it's supposed to be Read/Write 
    ReadHelper.Execute( { NodesToRead: [ item, itemD ] } );

    // step 3: can we use this node? is it writable?
    var valueAsByte = item.Value.Value.toByte();
    Assert.True( ( valueAsByte & AccessLevel.CurrentWrite ), "Expected 'AccessLevel' bit 2 (CurrentWrite) to be TRUE.", "'AccessLevel' bit 2 is TRUE!" );

    // step 4: generate a value to write and then write it.
    UaVariant.SetValueMin( { Item: itemV, Type: BuiltInType.FromNodeId( UaNodeId.fromString( itemD.Value.Value.toString() ) ) } );
    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    UaVariant.Increment( { Item: itemV } );
    itemV.AttributeId = Attribute.Value;
    return( WriteHelper.Execute( { NodesToWrite: itemV, OperationResults: expectedResults, ReadVerification: false, CheckNotSupported: true } ) );
}

Test.Execute( { Procedure: write582020 } );