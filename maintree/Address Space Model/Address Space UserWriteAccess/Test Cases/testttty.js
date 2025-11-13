/* Test write access based on UserAccessLevel and AccessLevel */

function writeAccessLevelTest() {
    // Get node from CTT setting for write-only node
    var item = MonitoredItem.fromSetting("/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_WriteOnly", 0, Attribute.UserAccessLevel);
    if (item === null) {
        addSkipped("No node configured for '/AccessRights/AccessLevel_WriteOnly'.");
        return false;
    }

    var accessLevelItem = MonitoredItem.Clone(item);
    accessLevelItem.AttributeId = Attribute.AccessLevel;

    var dataTypeItem = MonitoredItem.Clone(item);
    dataTypeItem.AttributeId = Attribute.DataType;

    // Read UserAccessLevel, AccessLevel, and DataType
    ReadHelper.Execute({ NodesToRead: [item, accessLevelItem, dataTypeItem] });

    var userAccessByte = item.Value.Value.toByte();
    var accessByte = accessLevelItem.Value.Value.toByte();

    // Check CurrentWrite bit in UserAccessLevel
    Assert.True((userAccessByte & AccessLevel.CurrentWrite) === AccessLevel.CurrentWrite,
        "Expected 'UserAccessLevel' bit 2 (CurrentWrite) to be TRUE.",
        "'UserAccessLevel' bit 2 is FALSE!");

    // Check CurrentWrite bit in AccessLevel
    Assert.True((accessByte & AccessLevel.CurrentWrite) === AccessLevel.CurrentWrite,
        "Expected 'AccessLevel' bit 2 (CurrentWrite) to be TRUE.",
        "'AccessLevel' bit 2 is FALSE!");

    // Prepare a new value to write
    item.AttributeId = Attribute.Value;
    item.SafelySetValueTypeKnown(0, getDataTypeFromNodeId(dataTypeItem.Value.Value));
    UaVariant.Increment({ Item: item });

    // Write the Value attribute
    WriteHelper.Execute({
        NodesToWrite: item,
        OperationResults: [new ExpectedAndAcceptedResults(StatusCode.Good)],
        CheckNotSupported: true,
        ReadVerification: false
    });

    item = null;
    return true;
}

// Execute the test
Test.Execute({ Procedure: writeAccessLevelTest });
