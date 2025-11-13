/*  Test 1 prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Tests the SERVERCAPABILITIES object in the Servers address space. */

function test() {
    var objectDefinition = {
        "Name": "ServerCapabilitiesType",
        "UaPart5": "6.3.2 ServerCapabilitiesType",
        "References": [
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "ServerProfileArray",     "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId( Identifier.PropertyType ) } ),      "DataType": BuiltInType.String,  "IsArray": true, "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "LocaleIdArray",          "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ),      "DataType": Identifier.LocaleId, "IsArray": true,  "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MinSupportedSampleRate", "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ),      "DataType": Identifier.Duration, "IsArray": false, "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MaxBrowseContinuationPoints",  "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.UInt16,  "IsArray": false, "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MaxQueryContinuationPoints",   "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.UInt16,  "IsArray": false, "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MaxHistoryContinuationPoints", "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.UInt16,  "IsArray": false, "Required": true },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "SoftwareCertificates",         "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.SignedSoftwareCertificate, "IsArray": true, "Required": false },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MaxArrayLength",               "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.UInt32,  "IsArray": false, "Required": false },
            { "ReferenceTypeId": Identifier.HasProperty,  "BrowseName": "MaxStringLength",              "NodeClass": NodeClass.Variable, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.PropertyType ) } ), "DataType": Identifier.UInt32,  "IsArray": false, "Required": false },
            { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "OperationLimits",              "NodeClass": NodeClass.Object, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.HasComponent ) } ), "Required": false, "TypeInstance": 
                   { "Name": "OperationLimitsType", "UaPart5": "6.3.11 OperationLimitsType", "References": [
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerRead",                          "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerHistoryReadData",               "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerHistoryReadEvents",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerWrite",                         "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerHistoryUpdateData",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerHistoryUpdateData",             "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerMethodCall",                    "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerBrowse",                        "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerRegisterNodes",                 "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerTranslateBrowsePathsToNodeIds", "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxNodesPerNodeManagement",                "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false },
                        { "ReferenceTypeId": Identifier.HasProperty, "BrowseName": "MaxMonitoredItemsPerCall",                 "NodeClass": NodeClass.Variable, "TypeDefinition": new UaExpandedNIDHelper( Identifier.PropertyType ), "DataType": BuiltInType.UInt32, "Required": false }
                ] }
            },
            { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "ModellingRules",               "NodeClass": NodeClass.Object, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.HasComponent ) } ), "DataType": Identifier.FolderType, "IsArray": false, "Required": true },
            { "ReferenceTypeId": Identifier.HasComponent, "BrowseName": "AggregateFunctions",           "NodeClass": NodeClass.Object, "TypeDefinition": UaExpandedNodeId.New( { NodeId: new UaNodeId(Identifier.HasComponent ) } ), "DataType": Identifier.FolderType, "IsArray": false, "Required": true }
        ] };

    // variables and objects needed for the test
    var result = ( TBPTNI.CheckChildStructure( {
            StartingNode:  MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities ) )[0], 
            ObjectDefinition: objectDefinition, 
            TranslateBrowsePathsToNodeIdsHelper: TranslateBrowsePathsToNodeIdsHelper 
            } ) );

    var items = MonitoredItem.fromNodeIds( [
        new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray ),
        new UaNodeId( Identifier.Server_ServerCapabilities_ServerProfileArray ),
        new UaNodeId( Identifier.Server_ServerCapabilities_SoftwareCertificates ) ] );
    
    // step 2: read the capablities
    if( result ) {
        if( !ReadHelper.Execute( { NodesToRead: items } ) ) result = false;
        else {
            addLog( "Number of elements in the LocaleIdArray: " + items[0].Value.Value.getArraySize() );
            if( !Assert.GreaterThan ( 0, items[1].Value.Value.getArraySize(), "Expected ServerProfileArray to contain 1 or more elements." ) ) result = false;
            if( !Assert.LessThan    ( 1, items[2].Value.Value.getArraySize(), "Expected SoftwareCertificates to be empty." ) ) result = false;
        }
    }

    return( result );
}

Test.Execute( { Procedure: test } );