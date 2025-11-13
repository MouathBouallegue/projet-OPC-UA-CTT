include( "./library/Base/safeInvoke.js" );
include( "./library/Information/_Base/NodeContainsSubStructure.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );
include( "./library/ServiceBased/Helpers.js" );

const CU_NAME = "\n\n\n***** CONFORMANCE UNIT 'Base Info Diagnostics' TESTING ";

var _diagsNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics ) )[0];
var _currSessionCountNode  = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CurrentSessionCount ) )[0];
var _currSubsCountNode     = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CurrentSubscriptionCount ) )[0];
var _cumulSessionCountNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CumulatedSessionCount ) )[0];
var _cumulSubsCountNode    = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CumulatedSubscriptionCount ) )[0];
var _sessionsSummaryNode   = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SessionsDiagnosticsSummary ) )[0];
var _samplingIntArrayNode  = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SamplingIntervalDiagnosticsArray ) )[0];
var _subDiagsArrayNode     = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SubscriptionDiagnosticsArray ) )[0];
var _enabledFlagNode       = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ) )[0];
var _enabledDiagnosticsSet = false;

if( !Test.Connect() ) {
    addError( "Unable to connect to Server. Check settings." );
    stopCurrentUnit();
}    
else {
    // make sure each test is correctly reset
    Test.PostTestFunctions[0] = endOfTestCleanup;
    // try reading the EnabledFlag and if NOT set, try to SET it; if fails, then skip tests
    if( ReadHelper.Execute( { NodesToRead: _enabledFlagNode } ) ) {
        // if value is FALSE then try to write TRUE
        if( false === _enabledFlagNode.Value.Value.toBoolean() ) {
            print( "Enabling Diagnostics in the Server." );
            _enabledFlagNode.Value.Value.setBoolean( true );
            var writeResult = WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false, OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNotWritable, StatusCode.UserAccessDenied] ) } );
            if( !writeResult || WriteHelper.Response.Results[0].isNotGood() ) {
                addSkipped( "Diagnostics.EnabledFlag cannot be written to.\nDiagnostics cannot be activated and are possibly unsupported.\nPlease activate manually and re-run these tests.\nAborting conformance unit." );
                stopCurrentUnit();
            }
            else _enabledDiagnosticsSet = true;
        }
        else {
            addLog( "Diagnostics.EnabledFlag is already set to: " + _enabledFlagNode.Value.Value.toBoolean() );
        }
    }
    else stopCurrentUnit();
}

function endOfTestCleanup() {
    PublishHelper.Clear();
}


// define the object models for diagnostics
var serverDiagnostics = {
    "Name": "ServerDiagnostics",
    "UaPart5": "6.3.3 ServerDiagnosticsType",
    "References": [
        { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "EnabledFlag",    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ),     "DataType": BuiltInType.Boolean, "IsArray": false, "Required": true },
        { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ServerDiagnosticsSummary",   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary ), "Required": true, "TypeInstance":
               { "Name": "ServerDiagnosticsSummaryType", "UaPart5": "7.10 ServerDiagnosticsSummaryType", "References": [
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ServerViewCount",              "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentSessionCount",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CumulatedSessionCount",         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SecurityRejectedSessionCount",  "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RejectedSessionCount",          "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionTimeoutCount",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionAbortCount",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "PublishingIntervalCount",       "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentSubscriptionCount",      "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CumulatedSubscriptionCount",    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SecurityRejectedRequestsCount", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true },
                    { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RejectedRequestsCount",         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32, "Required": true } ] },},
        { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SamplingIntervalDiagnosticsArray",   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.Server_ServerDiagnostics_SamplingIntervalDiagnosticsArray ), "Required": false },
        { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SubscriptionDiagnosticsArray", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.Server_ServerCapabilities_SubscriptionDiagnosticsArray ), "Required": true },
        { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionsDiagnosticsSummary",   "NodeClass": NodeClass.Object, "TypeDefinition": new UaExpandedNIDHelper( Identifier.Server_ServerDiagnostics_SessionsDiagnosticsSummary ), "Required": true } ] };

var subscriptionDiagnostics = {
    "Name": "SubscriptionDiagnosticsType",
    "UaPart5": "7.14 SubscriptionDiagnosticstype",
    "References": [
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionId",                    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.NodeId,   "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SubscriptionId",               "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "Priority",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.Byte,    "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "PublishingInterval",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.Duration, "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MaxKeepAliveCount",            "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MaxLifetimeCount",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MaxNotificationsPerPublish",   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "PublishingEnabled",            "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.Boolean, "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ModifyCount",                  "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "EnableCount",                  "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "DisableCount",                 "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RepublishRequestCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RepublishMessageRequestCount", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RepublishMessageCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "TransferRequestCount",         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "TransferredToAltClientCount",  "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "TransferredToSameClientCount", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "PublishRequestCount",          "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "DataChangeNotificationsCount", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "EventNotificationsCount",      "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "NotificationsCount",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "LatePublishRequestCount",      "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentKeepAliveCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentLifetimeCount",         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "UnacknowledgedMessageCount",   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "DiscardedMessageCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MonitoredItemCount",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "DisabledMonitoredItemCount",   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MonitoringQueueOverflowCount", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "NextSequenceNumber",           "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "EventQueueOverflowCount",      "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true } ] };

var sessionDiagnostics = {
    "Name": "SessionDiagnosticsVariableType",
    "UaPart5": "7.16 SessionDiagnosticsVariableType",
    "References": [
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionId",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.NodeId,   "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SessionName",                   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.String,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ClientDescription",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ApplicationDescription,    "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ServerUri",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.String,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "EndpointUrl",                   "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.String,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "LocaleIds",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.LocaleId, "Array": true,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "MaxResponseMessageSize",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ActualSessionTimeout",          "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.Duration, "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ClientConnectionTime",          "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.UtcTime,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ClientLastContactTime",         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.UtcTime,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentSubscriptionsCount",     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentMonitoredItemsCount",    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CurrentPublishRequestsInQueue", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "TotalRequestCount",            "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "UnauthorizedRequestCount",     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": BuiltInType.UInt32,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ReadCount",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "HistoryReadCount",              "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "WriteCount",                    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "HistoryUpdateCount",            "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CallCount",                     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CreateMonitoredItemsCount",     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ModifyMonitoredItemsCount",     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SetMonitoringModeCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "DeleteMonitoredItemsCount",     "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "CreateSubscriptionCount",       "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ModifySubscriptionCount",       "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "SetPublishingModeCount",        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "PublishCount",                  "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "RepublishCount",                "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true },
                { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "TransferSubscriptionsCount",    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), "DataType": Identifier.ServiceCounterDataType,  "Required": true } ] };

print( CU_NAME + " BEGINS ******\n" );
