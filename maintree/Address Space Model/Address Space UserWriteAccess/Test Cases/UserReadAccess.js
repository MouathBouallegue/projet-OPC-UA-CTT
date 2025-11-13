include("./library/Base/Objects/expectedResults.js");
include("./library/Base/Objects/monitoredItem.js");
include("./library/Base/safeInvoke.js");
include("./library/Base/SettingsUtilities/NodeIds.js");
include("./library/Base/assertions.js");
include("./library/ServiceBased/Helpers.js");

const CUNAME = "Address Space UserReadAccess";

if (!Test.Connect()) {
    addError("Unable to connect to the Server. Check settings.");
    stopCurrentUnit();
}

print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING BEGINS ******");

// Get node from settings
var item = MonitoredItem.fromSetting("/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead", 0, Attribute.UserAccessLevel);
if (item === null) {
    addSkipped("No node configured for User Read Access.");
    stopCurrentUnit();
}

item.AttributeId = Attribute.Value;

// Execute read
var result = ReadHelper.Execute({
    NodesToRead: [item],
    OperationResults: [new ExpectedAndAcceptedResults(StatusCode.Good)]
});

// Check if read succeeded
if (!result) {
    addError("ReadHelper.Execute failed.");
    stopCurrentUnit();
}

// DEBUG prints to understand StatusCode type and value
print("Type of item.Value.StatusCode: " + typeof(item.Value.StatusCode));
print("item.Value.StatusCode: " + item.Value.StatusCode.toString());



print("Read succeeded. Value: " + item.Value.Value.toString());

Test.Disconnect();
print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING COMPLETE ******");
