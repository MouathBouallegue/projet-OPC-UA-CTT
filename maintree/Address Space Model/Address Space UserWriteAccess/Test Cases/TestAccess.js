include("./library/Base/Objects/expectedResults.js");
include("./library/Base/Objects/monitoredItem.js");
include("./library/Base/safeInvoke.js");
include("./library/Base/SettingsUtilities/NodeIds.js");
include("./library/Base/assertions.js");
include("./library/ServiceBased/Helpers.js");

var CUNAME = "Address Space AccessLevel";

if (!Test.Connect()) {
    addError("Unable to connect to the Server. Check settings.");
    stopCurrentUnit();
}

print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING BEGINS ******");

// -------- Test AccessLevel_CurrentRead --------
var item = MonitoredItem.fromSetting("/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead", 0, Attribute.AccessLevel);
if (item === null) {
    addSkipped("No node configured for AccessLevel_CurrentRead");
} else {
    var result = ReadHelper.Execute({ NodesToRead: [item], OperationResults: [new ExpectedAndAcceptedResults(StatusCode.Good)] });
    if (!result) addError("ReadHelper.Execute failed for AccessLevel_CurrentRead");
    else {
        var accessLevel = item.Value.Value.toByte();
        print("Node: AccessLevel_CurrentRead");
        print("AccessLevel Bitmask: 0x" + accessLevel.toString(16).toUpperCase());
        print("AccessLevel Permissions:");
        if ((accessLevel & 0x01) !== 0) print("- CurrentRead");
        if ((accessLevel & 0x02) !== 0) print("- CurrentWrite");
        if ((accessLevel & 0x04) !== 0) print("- HistoryRead");
        if ((accessLevel & 0x08) !== 0) print("- HistoryWrite");
        if ((accessLevel & 0x10) !== 0) print("- SemanticChange");
        if ((accessLevel & 0x20) !== 0) print("- StatusWrite");
        if ((accessLevel & 0x40) !== 0) print("- TimestampWrite");
        print("---------------------------------------------------");
    }
}

// -------- Test AccessLevel_CurrentWrite --------
var item = MonitoredItem.fromSetting("/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite", 0, Attribute.AccessLevel);
if (item === null) {
    addSkipped("No node configured for AccessLevel_CurrentWrite");
} else {
    var result = ReadHelper.Execute({ NodesToRead: [item], OperationResults: [new ExpectedAndAcceptedResults(StatusCode.Good)] });
    if (!result) addError("ReadHelper.Execute failed for AccessLevel_CurrentWrite");
    else {
        var accessLevel = item.Value.Value.toByte();
        print("Node: AccessLevel_CurrentWrite");
        print("AccessLevel Bitmask: 0x" + accessLevel.toString(16).toUpperCase());
        print("AccessLevel Permissions:");
        if ((accessLevel & 0x01) !== 0) print("- CurrentRead");
        if ((accessLevel & 0x02) !== 0) print("- CurrentWrite");
        if ((accessLevel & 0x04) !== 0) print("- HistoryRead");
        if ((accessLevel & 0x08) !== 0) print("- HistoryWrite");
        if ((accessLevel & 0x10) !== 0) print("- SemanticChange");
        if ((accessLevel & 0x20) !== 0) print("- StatusWrite");
        if ((accessLevel & 0x40) !== 0) print("- TimestampWrite");
        print("---------------------------------------------------");
    }
}

// -------- Ajouter ici les autres nœuds AccessLevel si nécessaire --------

Test.Disconnect();
print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING COMPLETE ******");
