/*  Test prepared by <your name>: <email>; 
    Description: */
include("./library/Base/Objects/expectedResults.js");
include("./library/Base/Objects/monitoredItem.js");
include("./library/Base/safeInvoke.js");
include("./library/Base/SettingsUtilities/NodeIds.js");
include("./library/Base/assertions.js");
include("./library/ServiceBased/Helpers.js");

var CUNAME = "Address Space AccessLevel";

// Liste des nœuds configurés dans CTT à tester
var accessLevelNodes = [
    "AccessLevel_CurrentRead",
    "AccessLevel_CurrentWrite",
    "AccessLevel_CurrentRead_NotUser",
    "AccessLevel_CurrentWrite_NotUser",
    "AccessLevel_CurrentRead_NotCurrentWrite",
    "AccessLevel_CurrentWrite_NotCurrentRead"
];

if (!Test.Connect()) {
    addError("Unable to connect to the Server. Check settings.");
    stopCurrentUnit();
}

print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING BEGINS ******");

// Parcourir tous les nœuds configurés
for (var i = 0; i < accessLevelNodes.length; i++) {
    var nodeSetting = "/Server Test/NodeIds/SecurityAccess/" + accessLevelNodes[i];
    var item = MonitoredItem.fromSetting(nodeSetting, 0, Attribute.AccessLevel);

    if (item === null) {
        addSkipped("No node configured for " + accessLevelNodes[i]);
        continue; // passer au nœud suivant
    }

    // Lire l'AccessLevel
    var result = ReadHelper.Execute({
        NodesToRead: [item],
        OperationResults: [new ExpectedAndAcceptedResults(StatusCode.Good)]
    });

    if (!result) {
        addError("ReadHelper.Execute failed for node " + accessLevelNodes[i]);
        continue;
    }

    // Afficher le bitmask
    var accessLevel = item.Value.Value.toByte();
    print("Node: " + accessLevelNodes[i]);
    print("AccessLevel Bitmask: 0x" + accessLevel.toString(16).toUpperCase());

    // Interpréter les permissions
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

Test.Disconnect();
print("****** CONFORMANCE UNIT '" + CUNAME + "' TESTING COMPLETE ******");
