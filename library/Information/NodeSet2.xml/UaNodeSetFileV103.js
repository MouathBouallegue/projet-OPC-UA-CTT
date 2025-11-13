

//define NodeSet2 File
var uaStandardObjects = [ {
    "DisplayName": "BaseObjectType",
    "BrowseName": "BaseObjectType",
    "Description": "",
    "NodeId": "i=58",
    "References": [],
    "HasSupertype": false,
    "SubObjects": [
        {
            "DisplayName": "FolderType",
            "BrowseName": "FolderType",
            "Description": "",
            "NodeId": "i=61",
            "References": [],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "OperationLimitsType",
                    "BrowseName": "OperationLimitsType",
                    "Description": "",
                    "NodeId": "i=11564",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11565",
                            "BrowseName": "MaxNodesPerRead",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerRead",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12161",
                            "BrowseName": "MaxNodesPerHistoryReadData",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerHistoryReadData",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12162",
                            "BrowseName": "MaxNodesPerHistoryReadEvents",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerHistoryReadEvents",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11567",
                            "BrowseName": "MaxNodesPerWrite",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerWrite",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12163",
                            "BrowseName": "MaxNodesPerHistoryUpdateData",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerHistoryUpdateData",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12164",
                            "BrowseName": "MaxNodesPerHistoryUpdateEvents",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerHistoryUpdateEvents",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11569",
                            "BrowseName": "MaxNodesPerMethodCall",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerMethodCall",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11570",
                            "BrowseName": "MaxNodesPerBrowse",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerBrowse",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11571",
                            "BrowseName": "MaxNodesPerRegisterNodes",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerRegisterNodes",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11572",
                            "BrowseName": "MaxNodesPerTranslateBrowsePathsToNodeIds",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerTranslateBrowsePathsToNodeIds",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11573",
                            "BrowseName": "MaxNodesPerNodeManagement",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxNodesPerNodeManagement",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11574",
                            "BrowseName": "MaxMonitoredItemsPerCall",
                            "ParentNodeId": "i=11564",
                            "DataType": "BuiltInType.UInt32",
                            "DisplayName": "MaxMonitoredItemsPerCall",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11564",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        }
                    ],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "FileDirectoryType",
                    "BrowseName": "FileDirectoryType",
                    "Description": "",
                    "NodeId": "i=13353",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=13387",
                            "BrowseName": "CreateDirectory",
                            "ParentNodeId": "i=13353",
                            "DisplayName": "CreateDirectory",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13388",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13389",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=13353",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=13390",
                            "BrowseName": "CreateFile",
                            "ParentNodeId": "i=13353",
                            "DisplayName": "CreateFile",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13391",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13392",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=13353",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=13393",
                            "BrowseName": "Delete",
                            "ParentNodeId": "i=13353",
                            "DisplayName": "Delete",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13394",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=13353",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=13395",
                            "BrowseName": "MoveOrCopy",
                            "ParentNodeId": "i=13353",
                            "DisplayName": "MoveOrCopy",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13396",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=13397",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=13353",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "CertificateGroupFolderType",
                    "BrowseName": "CertificateGroupFolderType",
                    "Description": "",
                    "NodeId": "i=13813",
                    "References": [],
                    "HasSupertype": true
                }
            ]
        },
        {
            "DisplayName": "DataTypeSystemType",
            "BrowseName": "DataTypeSystemType",
            "Description": "",
            "NodeId": "i=75",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "DataTypeEncodingType",
            "BrowseName": "DataTypeEncodingType",
            "Description": "",
            "NodeId": "i=76",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "ModellingRuleType",
            "BrowseName": "ModellingRuleType",
            "Description": "",
            "NodeId": "i=77",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "ServerType",
            "BrowseName": "ServerType",
            "Description": "",
            "NodeId": "i=2004",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2005",
                    "BrowseName": "ServerArray",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "ServerArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2006",
                    "BrowseName": "NamespaceArray",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "NamespaceArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2007",
                    "BrowseName": "ServerStatus",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.i=862",
                    "DisplayName": "ServerStatus",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3074",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3075",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3076",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3077",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3084",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3085",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2138",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2008",
                    "BrowseName": "ServiceLevel",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.Byte",
                    "DisplayName": "ServiceLevel",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2742",
                    "BrowseName": "Auditing",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "Auditing",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12882",
                    "BrowseName": "EstimatedReturnTime",
                    "ParentNodeId": "i=2004",
                    "DataType": "BuiltInType.DateTime",
                    "DisplayName": "EstimatedReturnTime",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11489",
                    "BrowseName": "GetMonitoredItems",
                    "ParentNodeId": "i=2004",
                    "DisplayName": "GetMonitoredItems",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11490",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11491",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12871",
                    "BrowseName": "ResendData",
                    "ParentNodeId": "i=2004",
                    "DisplayName": "ResendData",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12872",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12746",
                    "BrowseName": "SetSubscriptionDurable",
                    "ParentNodeId": "i=2004",
                    "DisplayName": "SetSubscriptionDurable",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12747",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12748",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12883",
                    "BrowseName": "RequestServerStateChange",
                    "ParentNodeId": "i=2004",
                    "DisplayName": "RequestServerStateChange",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12884",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2004",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "ServerCapabilitiesType",
            "BrowseName": "ServerCapabilitiesType",
            "Description": "",
            "NodeId": "i=2013",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2014",
                    "BrowseName": "ServerProfileArray",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "ServerProfileArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2016",
                    "BrowseName": "LocaleIdArray",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.i=295",
                    "DisplayName": "LocaleIdArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2017",
                    "BrowseName": "MinSupportedSampleRate",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.i=290",
                    "DisplayName": "MinSupportedSampleRate",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2732",
                    "BrowseName": "MaxBrowseContinuationPoints",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt16",
                    "DisplayName": "MaxBrowseContinuationPoints",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2733",
                    "BrowseName": "MaxQueryContinuationPoints",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt16",
                    "DisplayName": "MaxQueryContinuationPoints",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2734",
                    "BrowseName": "MaxHistoryContinuationPoints",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt16",
                    "DisplayName": "MaxHistoryContinuationPoints",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=3049",
                    "BrowseName": "SoftwareCertificates",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.i=344",
                    "DisplayName": "SoftwareCertificates",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11549",
                    "BrowseName": "MaxArrayLength",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxArrayLength",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11550",
                    "BrowseName": "MaxStringLength",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxStringLength",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12910",
                    "BrowseName": "MaxByteStringLength",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxByteStringLength",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11562",
                    "BrowseName": "<VendorCapability>",
                    "ParentNodeId": "i=2013",
                    "DataType": "BuiltInType.i=24",
                    "DisplayName": "<VendorCapability>",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2137",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=11508",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2013",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "ServerDiagnosticsType",
            "BrowseName": "ServerDiagnosticsType",
            "Description": "",
            "NodeId": "i=2020",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2021",
                    "BrowseName": "ServerDiagnosticsSummary",
                    "ParentNodeId": "i=2020",
                    "DataType": "BuiltInType.i=859",
                    "DisplayName": "ServerDiagnosticsSummary",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3116",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3117",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3118",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3119",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3120",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3121",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3122",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3124",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3125",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3126",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3127",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3128",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2150",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2020",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2022",
                    "BrowseName": "SamplingIntervalDiagnosticsArray",
                    "ParentNodeId": "i=2020",
                    "DataType": "BuiltInType.i=856",
                    "DisplayName": "SamplingIntervalDiagnosticsArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2164",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2020",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2023",
                    "BrowseName": "SubscriptionDiagnosticsArray",
                    "ParentNodeId": "i=2020",
                    "DataType": "BuiltInType.i=874",
                    "DisplayName": "SubscriptionDiagnosticsArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2171",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2020",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2025",
                    "BrowseName": "EnabledFlag",
                    "ParentNodeId": "i=2020",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "EnabledFlag",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2020",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "SessionsDiagnosticsSummaryType",
            "BrowseName": "SessionsDiagnosticsSummaryType",
            "Description": "",
            "NodeId": "i=2026",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2027",
                    "BrowseName": "SessionDiagnosticsArray",
                    "ParentNodeId": "i=2026",
                    "DataType": "BuiltInType.i=865",
                    "DisplayName": "SessionDiagnosticsArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2196",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2026",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2028",
                    "BrowseName": "SessionSecurityDiagnosticsArray",
                    "ParentNodeId": "i=2026",
                    "DataType": "BuiltInType.i=868",
                    "DisplayName": "SessionSecurityDiagnosticsArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2243",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2026",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "SessionDiagnosticsObjectType",
            "BrowseName": "SessionDiagnosticsObjectType",
            "Description": "",
            "NodeId": "i=2029",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2030",
                    "BrowseName": "SessionDiagnostics",
                    "ParentNodeId": "i=2029",
                    "DataType": "BuiltInType.i=865",
                    "DisplayName": "SessionDiagnostics",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3131",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3132",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3133",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3134",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3135",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3136",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3137",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3138",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3139",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3140",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3141",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3142",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3143",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=8898",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=11891",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3151",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3152",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3153",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3154",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3155",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3156",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3157",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3158",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3159",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3160",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3161",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3162",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3163",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3164",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3165",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3166",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3167",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3168",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3169",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3170",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3171",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3172",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3173",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3174",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3175",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3176",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3177",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3178",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2197",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2029",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2031",
                    "BrowseName": "SessionSecurityDiagnostics",
                    "ParentNodeId": "i=2029",
                    "DataType": "BuiltInType.i=868",
                    "DisplayName": "SessionSecurityDiagnostics",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3179",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3180",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3181",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3182",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3183",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3184",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3185",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3186",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "true",
                            "NodeId": "i=3187",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2244",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2029",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2032",
                    "BrowseName": "SubscriptionDiagnosticsArray",
                    "ParentNodeId": "i=2029",
                    "DataType": "BuiltInType.i=874",
                    "DisplayName": "SubscriptionDiagnosticsArray",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2171",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2029",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "VendorServerInfoType",
            "BrowseName": "VendorServerInfoType",
            "Description": "",
            "NodeId": "i=2033",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "ServerRedundancyType",
            "BrowseName": "ServerRedundancyType",
            "Description": "",
            "NodeId": "i=2034",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2035",
                    "BrowseName": "RedundancySupport",
                    "ParentNodeId": "i=2034",
                    "DataType": "BuiltInType.i=851",
                    "DisplayName": "RedundancySupport",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2034",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "TransparentRedundancyType",
                    "BrowseName": "TransparentRedundancyType",
                    "Description": "",
                    "NodeId": "i=2036",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2037",
                            "BrowseName": "CurrentServerId",
                            "ParentNodeId": "i=2036",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "CurrentServerId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2036",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2038",
                            "BrowseName": "RedundantServerArray",
                            "ParentNodeId": "i=2036",
                            "DataType": "BuiltInType.i=853",
                            "DisplayName": "RedundantServerArray",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2036",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        }
                    ],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "NonTransparentRedundancyType",
                    "BrowseName": "NonTransparentRedundancyType",
                    "Description": "",
                    "NodeId": "i=2039",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2040",
                            "BrowseName": "ServerUriArray",
                            "ParentNodeId": "i=2039",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ServerUriArray",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2039",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        }
                    ],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "NonTransparentNetworkRedundancyType",
                            "BrowseName": "NonTransparentNetworkRedundancyType",
                            "Description": "",
                            "NodeId": "i=11945",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=11948",
                                    "BrowseName": "ServerNetworkGroups",
                                    "ParentNodeId": "i=11945",
                                    "DataType": "BuiltInType.i=11944",
                                    "DisplayName": "ServerNetworkGroups",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=11945",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true
                        }
                    ]
                }
            ]
        },
        {
            "DisplayName": "FileType",
            "BrowseName": "FileType",
            "Description": "",
            "NodeId": "i=11575",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11576",
                    "BrowseName": "Size",
                    "ParentNodeId": "i=11575",
                    "DataType": "BuiltInType.UInt64",
                    "DisplayName": "Size",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12686",
                    "BrowseName": "Writable",
                    "ParentNodeId": "i=11575",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "Writable",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12687",
                    "BrowseName": "UserWritable",
                    "ParentNodeId": "i=11575",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "UserWritable",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11579",
                    "BrowseName": "OpenCount",
                    "ParentNodeId": "i=11575",
                    "DataType": "BuiltInType.UInt16",
                    "DisplayName": "OpenCount",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=13341",
                    "BrowseName": "MimeType",
                    "ParentNodeId": "i=11575",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "MimeType",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11580",
                    "BrowseName": "Open",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "Open",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11581",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11582",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11583",
                    "BrowseName": "Close",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "Close",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11584",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11585",
                    "BrowseName": "Read",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "Read",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11586",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11587",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11588",
                    "BrowseName": "Write",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "Write",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11589",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11590",
                    "BrowseName": "GetPosition",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "GetPosition",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11591",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11592",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=11593",
                    "BrowseName": "SetPosition",
                    "ParentNodeId": "i=11575",
                    "DisplayName": "SetPosition",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=11594",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=11575",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "AddressSpaceFileType",
                    "BrowseName": "AddressSpaceFileType",
                    "Description": "",
                    "NodeId": "i=11595",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=11615",
                            "BrowseName": "ExportNamespace",
                            "ParentNodeId": "i=11595",
                            "DisplayName": "ExportNamespace",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=11595",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "TrustListType",
                    "BrowseName": "TrustListType",
                    "Description": "",
                    "NodeId": "i=12522",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12542",
                            "BrowseName": "LastUpdateTime",
                            "ParentNodeId": "i=12522",
                            "DataType": "BuiltInType.i=294",
                            "DisplayName": "LastUpdateTime",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=12522",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=12543",
                            "BrowseName": "OpenWithMasks",
                            "ParentNodeId": "i=12522",
                            "DisplayName": "OpenWithMasks",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12544",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12545",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=12522",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=12546",
                            "BrowseName": "CloseAndUpdate",
                            "ParentNodeId": "i=12522",
                            "DisplayName": "CloseAndUpdate",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12705",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12547",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=12522",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=12548",
                            "BrowseName": "AddCertificate",
                            "ParentNodeId": "i=12522",
                            "DisplayName": "AddCertificate",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12549",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=12522",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=12550",
                            "BrowseName": "RemoveCertificate",
                            "ParentNodeId": "i=12522",
                            "DisplayName": "RemoveCertificate",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12551",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=12522",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true
                }
            ]
        },
        {
            "DisplayName": "NamespaceMetadataType",
            "BrowseName": "NamespaceMetadataType",
            "Description": "",
            "NodeId": "i=11616",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11617",
                    "BrowseName": "NamespaceUri",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "NamespaceUri",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11618",
                    "BrowseName": "NamespaceVersion",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "NamespaceVersion",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11619",
                    "BrowseName": "NamespacePublicationDate",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.DateTime",
                    "DisplayName": "NamespacePublicationDate",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11620",
                    "BrowseName": "IsNamespaceSubset",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "IsNamespaceSubset",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11621",
                    "BrowseName": "StaticNodeIdTypes",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.i=256",
                    "DisplayName": "StaticNodeIdTypes",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11622",
                    "BrowseName": "StaticNumericNodeIdRange",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.i=291",
                    "DisplayName": "StaticNumericNodeIdRange",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11623",
                    "BrowseName": "StaticStringNodeIdPattern",
                    "ParentNodeId": "i=11616",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "StaticStringNodeIdPattern",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11616",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "NamespacesType",
            "BrowseName": "NamespacesType",
            "Description": "",
            "NodeId": "i=11645",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "BaseEventType",
            "BrowseName": "BaseEventType",
            "Description": "",
            "NodeId": "i=2041",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2042",
                    "BrowseName": "EventId",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.ByteString",
                    "DisplayName": "EventId",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2043",
                    "BrowseName": "EventType",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.NodeId",
                    "DisplayName": "EventType",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2044",
                    "BrowseName": "SourceNode",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.NodeId",
                    "DisplayName": "SourceNode",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2045",
                    "BrowseName": "SourceName",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "SourceName",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2046",
                    "BrowseName": "Time",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.i=294",
                    "DisplayName": "Time",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2047",
                    "BrowseName": "ReceiveTime",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.i=294",
                    "DisplayName": "ReceiveTime",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=3190",
                    "BrowseName": "LocalTime",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.i=8912",
                    "DisplayName": "LocalTime",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2050",
                    "BrowseName": "Message",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.LocalizedText",
                    "DisplayName": "Message",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2051",
                    "BrowseName": "Severity",
                    "ParentNodeId": "i=2041",
                    "DataType": "BuiltInType.UInt16",
                    "DisplayName": "Severity",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2041",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "AuditEventType",
                    "BrowseName": "AuditEventType",
                    "Description": "",
                    "NodeId": "i=2052",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2053",
                            "BrowseName": "ActionTimeStamp",
                            "ParentNodeId": "i=2052",
                            "DataType": "BuiltInType.i=294",
                            "DisplayName": "ActionTimeStamp",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2052",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2054",
                            "BrowseName": "Status",
                            "ParentNodeId": "i=2052",
                            "DataType": "BuiltInType.Boolean",
                            "DisplayName": "Status",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2052",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2055",
                            "BrowseName": "ServerId",
                            "ParentNodeId": "i=2052",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ServerId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2052",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2056",
                            "BrowseName": "ClientAuditEntryId",
                            "ParentNodeId": "i=2052",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ClientAuditEntryId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2052",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2057",
                            "BrowseName": "ClientUserId",
                            "ParentNodeId": "i=2052",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ClientUserId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2052",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        }
                    ],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "AuditSecurityEventType",
                            "BrowseName": "AuditSecurityEventType",
                            "Description": "",
                            "NodeId": "i=2058",
                            "References": [],
                            "HasSupertype": true,
                            "SubObjects": [
                                {
                                    "DisplayName": "AuditChannelEventType",
                                    "BrowseName": "AuditChannelEventType",
                                    "Description": "",
                                    "NodeId": "i=2059",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2745",
                                            "BrowseName": "SecureChannelId",
                                            "ParentNodeId": "i=2059",
                                            "DataType": "BuiltInType.String",
                                            "DisplayName": "SecureChannelId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2059",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditOpenSecureChannelEventType",
                                            "BrowseName": "AuditOpenSecureChannelEventType",
                                            "Description": "",
                                            "NodeId": "i=2060",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2061",
                                                    "BrowseName": "ClientCertificate",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.ByteString",
                                                    "DisplayName": "ClientCertificate",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2746",
                                                    "BrowseName": "ClientCertificateThumbprint",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "ClientCertificateThumbprint",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2062",
                                                    "BrowseName": "RequestType",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.i=315",
                                                    "DisplayName": "RequestType",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2063",
                                                    "BrowseName": "SecurityPolicyUri",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "SecurityPolicyUri",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2065",
                                                    "BrowseName": "SecurityMode",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.i=302",
                                                    "DisplayName": "SecurityMode",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2066",
                                                    "BrowseName": "RequestedLifetime",
                                                    "ParentNodeId": "i=2060",
                                                    "DataType": "BuiltInType.i=290",
                                                    "DisplayName": "RequestedLifetime",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2060",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        }
                                    ]
                                },
                                {
                                    "DisplayName": "AuditSessionEventType",
                                    "BrowseName": "AuditSessionEventType",
                                    "Description": "",
                                    "NodeId": "i=2069",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2070",
                                            "BrowseName": "SessionId",
                                            "ParentNodeId": "i=2069",
                                            "DataType": "BuiltInType.NodeId",
                                            "DisplayName": "SessionId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2069",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditCreateSessionEventType",
                                            "BrowseName": "AuditCreateSessionEventType",
                                            "Description": "",
                                            "NodeId": "i=2071",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2072",
                                                    "BrowseName": "SecureChannelId",
                                                    "ParentNodeId": "i=2071",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "SecureChannelId",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2071",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2073",
                                                    "BrowseName": "ClientCertificate",
                                                    "ParentNodeId": "i=2071",
                                                    "DataType": "BuiltInType.ByteString",
                                                    "DisplayName": "ClientCertificate",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2071",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2747",
                                                    "BrowseName": "ClientCertificateThumbprint",
                                                    "ParentNodeId": "i=2071",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "ClientCertificateThumbprint",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2071",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2074",
                                                    "BrowseName": "RevisedSessionTimeout",
                                                    "ParentNodeId": "i=2071",
                                                    "DataType": "BuiltInType.i=290",
                                                    "DisplayName": "RevisedSessionTimeout",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2071",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true,
                                            "SubObjects": [
                                                {
                                                    "DisplayName": "AuditUrlMismatchEventType",
                                                    "BrowseName": "AuditUrlMismatchEventType",
                                                    "Description": "",
                                                    "NodeId": "i=2748",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=2749",
                                                            "BrowseName": "EndpointUrl",
                                                            "ParentNodeId": "i=2748",
                                                            "DataType": "BuiltInType.String",
                                                            "DisplayName": "EndpointUrl",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=2748",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        }
                                                    ],
                                                    "HasSupertype": true
                                                }
                                            ]
                                        },
                                        {
                                            "DisplayName": "AuditActivateSessionEventType",
                                            "BrowseName": "AuditActivateSessionEventType",
                                            "Description": "",
                                            "NodeId": "i=2075",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2076",
                                                    "BrowseName": "ClientSoftwareCertificates",
                                                    "ParentNodeId": "i=2075",
                                                    "DataType": "BuiltInType.i=344",
                                                    "DisplayName": "ClientSoftwareCertificates",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2075",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2077",
                                                    "BrowseName": "UserIdentityToken",
                                                    "ParentNodeId": "i=2075",
                                                    "DataType": "BuiltInType.i=316",
                                                    "DisplayName": "UserIdentityToken",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2075",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11485",
                                                    "BrowseName": "SecureChannelId",
                                                    "ParentNodeId": "i=2075",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "SecureChannelId",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2075",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCancelEventType",
                                            "BrowseName": "AuditCancelEventType",
                                            "Description": "",
                                            "NodeId": "i=2078",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2079",
                                                    "BrowseName": "RequestHandle",
                                                    "ParentNodeId": "i=2078",
                                                    "DataType": "BuiltInType.UInt32",
                                                    "DisplayName": "RequestHandle",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2078",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        }
                                    ]
                                },
                                {
                                    "DisplayName": "AuditCertificateEventType",
                                    "BrowseName": "AuditCertificateEventType",
                                    "Description": "",
                                    "NodeId": "i=2080",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2081",
                                            "BrowseName": "Certificate",
                                            "ParentNodeId": "i=2080",
                                            "DataType": "BuiltInType.ByteString",
                                            "DisplayName": "Certificate",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2080",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditCertificateDataMismatchEventType",
                                            "BrowseName": "AuditCertificateDataMismatchEventType",
                                            "Description": "",
                                            "NodeId": "i=2082",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2083",
                                                    "BrowseName": "InvalidHostname",
                                                    "ParentNodeId": "i=2082",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "InvalidHostname",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2082",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=2084",
                                                    "BrowseName": "InvalidUri",
                                                    "ParentNodeId": "i=2082",
                                                    "DataType": "BuiltInType.String",
                                                    "DisplayName": "InvalidUri",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2082",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCertificateExpiredEventType",
                                            "BrowseName": "AuditCertificateExpiredEventType",
                                            "Description": "",
                                            "NodeId": "i=2085",
                                            "References": [],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCertificateInvalidEventType",
                                            "BrowseName": "AuditCertificateInvalidEventType",
                                            "Description": "",
                                            "NodeId": "i=2086",
                                            "References": [],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCertificateUntrustedEventType",
                                            "BrowseName": "AuditCertificateUntrustedEventType",
                                            "Description": "",
                                            "NodeId": "i=2087",
                                            "References": [],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCertificateRevokedEventType",
                                            "BrowseName": "AuditCertificateRevokedEventType",
                                            "Description": "",
                                            "NodeId": "i=2088",
                                            "References": [],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditCertificateMismatchEventType",
                                            "BrowseName": "AuditCertificateMismatchEventType",
                                            "Description": "",
                                            "NodeId": "i=2089",
                                            "References": [],
                                            "HasSupertype": true
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "DisplayName": "AuditNodeManagementEventType",
                            "BrowseName": "AuditNodeManagementEventType",
                            "Description": "",
                            "NodeId": "i=2090",
                            "References": [],
                            "HasSupertype": true,
                            "SubObjects": [
                                {
                                    "DisplayName": "AuditAddNodesEventType",
                                    "BrowseName": "AuditAddNodesEventType",
                                    "Description": "",
                                    "NodeId": "i=2091",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2092",
                                            "BrowseName": "NodesToAdd",
                                            "ParentNodeId": "i=2091",
                                            "DataType": "BuiltInType.i=376",
                                            "DisplayName": "NodesToAdd",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2091",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                },
                                {
                                    "DisplayName": "AuditDeleteNodesEventType",
                                    "BrowseName": "AuditDeleteNodesEventType",
                                    "Description": "",
                                    "NodeId": "i=2093",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2094",
                                            "BrowseName": "NodesToDelete",
                                            "ParentNodeId": "i=2093",
                                            "DataType": "BuiltInType.i=382",
                                            "DisplayName": "NodesToDelete",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2093",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                },
                                {
                                    "DisplayName": "AuditAddReferencesEventType",
                                    "BrowseName": "AuditAddReferencesEventType",
                                    "Description": "",
                                    "NodeId": "i=2095",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2096",
                                            "BrowseName": "ReferencesToAdd",
                                            "ParentNodeId": "i=2095",
                                            "DataType": "BuiltInType.i=379",
                                            "DisplayName": "ReferencesToAdd",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2095",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                },
                                {
                                    "DisplayName": "AuditDeleteReferencesEventType",
                                    "BrowseName": "AuditDeleteReferencesEventType",
                                    "Description": "",
                                    "NodeId": "i=2097",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2098",
                                            "BrowseName": "ReferencesToDelete",
                                            "ParentNodeId": "i=2097",
                                            "DataType": "BuiltInType.i=385",
                                            "DisplayName": "ReferencesToDelete",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2097",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                }
                            ]
                        },
                        {
                            "DisplayName": "AuditUpdateEventType",
                            "BrowseName": "AuditUpdateEventType",
                            "Description": "",
                            "NodeId": "i=2099",
                            "References": [],
                            "HasSupertype": true,
                            "SubObjects": [
                                {
                                    "DisplayName": "AuditWriteUpdateEventType",
                                    "BrowseName": "AuditWriteUpdateEventType",
                                    "Description": "",
                                    "NodeId": "i=2100",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2750",
                                            "BrowseName": "AttributeId",
                                            "ParentNodeId": "i=2100",
                                            "DataType": "BuiltInType.UInt32",
                                            "DisplayName": "AttributeId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2100",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2101",
                                            "BrowseName": "IndexRange",
                                            "ParentNodeId": "i=2100",
                                            "DataType": "BuiltInType.i=291",
                                            "DisplayName": "IndexRange",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2100",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2102",
                                            "BrowseName": "OldValue",
                                            "ParentNodeId": "i=2100",
                                            "DataType": "BuiltInType.i=24",
                                            "DisplayName": "OldValue",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2100",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2103",
                                            "BrowseName": "NewValue",
                                            "ParentNodeId": "i=2100",
                                            "DataType": "BuiltInType.i=24",
                                            "DisplayName": "NewValue",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2100",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                },
                                {
                                    "DisplayName": "AuditHistoryUpdateEventType",
                                    "BrowseName": "AuditHistoryUpdateEventType",
                                    "Description": "",
                                    "NodeId": "i=2104",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2751",
                                            "BrowseName": "ParameterDataTypeId",
                                            "ParentNodeId": "i=2104",
                                            "DataType": "BuiltInType.NodeId",
                                            "DisplayName": "ParameterDataTypeId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2104",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditHistoryEventUpdateEventType",
                                            "BrowseName": "AuditHistoryEventUpdateEventType",
                                            "Description": "",
                                            "NodeId": "i=2999",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3025",
                                                    "BrowseName": "UpdatedNode",
                                                    "ParentNodeId": "i=2999",
                                                    "DataType": "BuiltInType.NodeId",
                                                    "DisplayName": "UpdatedNode",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2999",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3028",
                                                    "BrowseName": "PerformInsertReplace",
                                                    "ParentNodeId": "i=2999",
                                                    "DataType": "BuiltInType.i=11293",
                                                    "DisplayName": "PerformInsertReplace",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2999",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3003",
                                                    "BrowseName": "Filter",
                                                    "ParentNodeId": "i=2999",
                                                    "DataType": "BuiltInType.i=725",
                                                    "DisplayName": "Filter",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2999",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3029",
                                                    "BrowseName": "NewValues",
                                                    "ParentNodeId": "i=2999",
                                                    "DataType": "BuiltInType.i=920",
                                                    "DisplayName": "NewValues",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2999",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3030",
                                                    "BrowseName": "OldValues",
                                                    "ParentNodeId": "i=2999",
                                                    "DataType": "BuiltInType.i=920",
                                                    "DisplayName": "OldValues",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2999",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditHistoryValueUpdateEventType",
                                            "BrowseName": "AuditHistoryValueUpdateEventType",
                                            "Description": "",
                                            "NodeId": "i=3006",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3026",
                                                    "BrowseName": "UpdatedNode",
                                                    "ParentNodeId": "i=3006",
                                                    "DataType": "BuiltInType.NodeId",
                                                    "DisplayName": "UpdatedNode",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3006",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3031",
                                                    "BrowseName": "PerformInsertReplace",
                                                    "ParentNodeId": "i=3006",
                                                    "DataType": "BuiltInType.i=11293",
                                                    "DisplayName": "PerformInsertReplace",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3006",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3032",
                                                    "BrowseName": "NewValues",
                                                    "ParentNodeId": "i=3006",
                                                    "DataType": "BuiltInType.i=23",
                                                    "DisplayName": "NewValues",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3006",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3033",
                                                    "BrowseName": "OldValues",
                                                    "ParentNodeId": "i=3006",
                                                    "DataType": "BuiltInType.i=23",
                                                    "DisplayName": "OldValues",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3006",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditHistoryDeleteEventType",
                                            "BrowseName": "AuditHistoryDeleteEventType",
                                            "Description": "",
                                            "NodeId": "i=3012",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3027",
                                                    "BrowseName": "UpdatedNode",
                                                    "ParentNodeId": "i=3012",
                                                    "DataType": "BuiltInType.NodeId",
                                                    "DisplayName": "UpdatedNode",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3012",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true,
                                            "SubObjects": [
                                                {
                                                    "DisplayName": "AuditHistoryRawModifyDeleteEventType",
                                                    "BrowseName": "AuditHistoryRawModifyDeleteEventType",
                                                    "Description": "",
                                                    "NodeId": "i=3014",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3015",
                                                            "BrowseName": "IsDeleteModified",
                                                            "ParentNodeId": "i=3014",
                                                            "DataType": "BuiltInType.Boolean",
                                                            "DisplayName": "IsDeleteModified",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3014",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3016",
                                                            "BrowseName": "StartTime",
                                                            "ParentNodeId": "i=3014",
                                                            "DataType": "BuiltInType.i=294",
                                                            "DisplayName": "StartTime",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3014",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3017",
                                                            "BrowseName": "EndTime",
                                                            "ParentNodeId": "i=3014",
                                                            "DataType": "BuiltInType.i=294",
                                                            "DisplayName": "EndTime",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3014",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3034",
                                                            "BrowseName": "OldValues",
                                                            "ParentNodeId": "i=3014",
                                                            "DataType": "BuiltInType.i=23",
                                                            "DisplayName": "OldValues",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3014",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        }
                                                    ],
                                                    "HasSupertype": true
                                                },
                                                {
                                                    "DisplayName": "AuditHistoryAtTimeDeleteEventType",
                                                    "BrowseName": "AuditHistoryAtTimeDeleteEventType",
                                                    "Description": "",
                                                    "NodeId": "i=3019",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3020",
                                                            "BrowseName": "ReqTimes",
                                                            "ParentNodeId": "i=3019",
                                                            "DataType": "BuiltInType.i=294",
                                                            "DisplayName": "ReqTimes",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3019",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3021",
                                                            "BrowseName": "OldValues",
                                                            "ParentNodeId": "i=3019",
                                                            "DataType": "BuiltInType.i=23",
                                                            "DisplayName": "OldValues",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3019",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        }
                                                    ],
                                                    "HasSupertype": true
                                                },
                                                {
                                                    "DisplayName": "AuditHistoryEventDeleteEventType",
                                                    "BrowseName": "AuditHistoryEventDeleteEventType",
                                                    "Description": "",
                                                    "NodeId": "i=3022",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3023",
                                                            "BrowseName": "EventIds",
                                                            "ParentNodeId": "i=3022",
                                                            "DataType": "BuiltInType.ByteString",
                                                            "DisplayName": "EventIds",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3022",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=3024",
                                                            "BrowseName": "OldValues",
                                                            "ParentNodeId": "i=3022",
                                                            "DataType": "BuiltInType.i=920",
                                                            "DisplayName": "OldValues",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=3022",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        }
                                                    ],
                                                    "HasSupertype": true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "DisplayName": "AuditUpdateMethodEventType",
                            "BrowseName": "AuditUpdateMethodEventType",
                            "Description": "",
                            "NodeId": "i=2127",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2128",
                                    "BrowseName": "MethodId",
                                    "ParentNodeId": "i=2127",
                                    "DataType": "BuiltInType.NodeId",
                                    "DisplayName": "MethodId",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2127",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2129",
                                    "BrowseName": "InputArguments",
                                    "ParentNodeId": "i=2127",
                                    "DataType": "BuiltInType.i=24",
                                    "DisplayName": "InputArguments",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2127",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true,
                            "SubObjects": [
                                {
                                    "DisplayName": "AuditUpdateStateEventType",
                                    "BrowseName": "AuditUpdateStateEventType",
                                    "Description": "",
                                    "NodeId": "i=2315",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2777",
                                            "BrowseName": "OldStateId",
                                            "ParentNodeId": "i=2315",
                                            "DataType": "BuiltInType.i=24",
                                            "DisplayName": "OldStateId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2315",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=2778",
                                            "BrowseName": "NewStateId",
                                            "ParentNodeId": "i=2315",
                                            "DataType": "BuiltInType.i=24",
                                            "DisplayName": "NewStateId",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2315",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditProgramTransitionEventType",
                                            "BrowseName": "AuditProgramTransitionEventType",
                                            "Description": "",
                                            "NodeId": "i=11856",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11875",
                                                    "BrowseName": "TransitionNumber",
                                                    "ParentNodeId": "i=11856",
                                                    "DataType": "BuiltInType.UInt32",
                                                    "DisplayName": "TransitionNumber",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=11856",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "ProgramTransitionAuditEventType",
                                            "BrowseName": "ProgramTransitionAuditEventType",
                                            "Description": "",
                                            "NodeId": "i=3806",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=3825",
                                                    "BrowseName": "Transition",
                                                    "ParentNodeId": "i=3806",
                                                    "DataType": "BuiltInType.LocalizedText",
                                                    "DisplayName": "Transition",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "true",
                                                            "NodeId": "i=3826",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=2767",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasComponent",
                                                            "IsForward": "false",
                                                            "NodeId": "i=3806",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasComponent"
                                                }
                                            ],
                                            "HasSupertype": true
                                        }
                                    ]
                                },
                                {
                                    "DisplayName": "AuditConditionEventType",
                                    "BrowseName": "AuditConditionEventType",
                                    "Description": "",
                                    "NodeId": "i=2790",
                                    "References": [],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "AuditConditionEnableEventType",
                                            "BrowseName": "AuditConditionEnableEventType",
                                            "Description": "",
                                            "NodeId": "i=2803",
                                            "References": [],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditConditionCommentEventType",
                                            "BrowseName": "AuditConditionCommentEventType",
                                            "Description": "",
                                            "NodeId": "i=2829",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=15001",
                                                    "BrowseName": "ConditionEventId",
                                                    "ParentNodeId": "i=2829",
                                                    "DataType": "BuiltInType.ByteString",
                                                    "DisplayName": "ConditionEventId",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2829",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11851",
                                                    "BrowseName": "Comment",
                                                    "ParentNodeId": "i=2829",
                                                    "DataType": "BuiltInType.LocalizedText",
                                                    "DisplayName": "Comment",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2829",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditConditionRespondEventType",
                                            "BrowseName": "AuditConditionRespondEventType",
                                            "Description": "",
                                            "NodeId": "i=8927",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11852",
                                                    "BrowseName": "SelectedResponse",
                                                    "ParentNodeId": "i=8927",
                                                    "DataType": "BuiltInType.Int32",
                                                    "DisplayName": "SelectedResponse",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=8927",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditConditionAcknowledgeEventType",
                                            "BrowseName": "AuditConditionAcknowledgeEventType",
                                            "Description": "",
                                            "NodeId": "i=8944",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=15002",
                                                    "BrowseName": "ConditionEventId",
                                                    "ParentNodeId": "i=8944",
                                                    "DataType": "BuiltInType.ByteString",
                                                    "DisplayName": "ConditionEventId",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=8944",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11853",
                                                    "BrowseName": "Comment",
                                                    "ParentNodeId": "i=8944",
                                                    "DataType": "BuiltInType.LocalizedText",
                                                    "DisplayName": "Comment",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=8944",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditConditionConfirmEventType",
                                            "BrowseName": "AuditConditionConfirmEventType",
                                            "Description": "",
                                            "NodeId": "i=8961",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=15003",
                                                    "BrowseName": "ConditionEventId",
                                                    "ParentNodeId": "i=8961",
                                                    "DataType": "BuiltInType.ByteString",
                                                    "DisplayName": "ConditionEventId",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=8961",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11854",
                                                    "BrowseName": "Comment",
                                                    "ParentNodeId": "i=8961",
                                                    "DataType": "BuiltInType.LocalizedText",
                                                    "DisplayName": "Comment",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=8961",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        },
                                        {
                                            "DisplayName": "AuditConditionShelvingEventType",
                                            "BrowseName": "AuditConditionShelvingEventType",
                                            "Description": "",
                                            "NodeId": "i=11093",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11855",
                                                    "BrowseName": "ShelvingTime",
                                                    "ParentNodeId": "i=11093",
                                                    "DataType": "BuiltInType.i=290",
                                                    "DisplayName": "ShelvingTime",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=78",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=11093",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true
                                        }
                                    ]
                                },
                                {
                                    "DisplayName": "TrustListUpdatedAuditEventType",
                                    "BrowseName": "TrustListUpdatedAuditEventType",
                                    "Description": "",
                                    "NodeId": "i=12561",
                                    "References": [],
                                    "HasSupertype": true
                                },
                                {
                                    "DisplayName": "CertificateUpdatedAuditEventType",
                                    "BrowseName": "CertificateUpdatedAuditEventType",
                                    "Description": "",
                                    "NodeId": "i=12620",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=13735",
                                            "BrowseName": "CertificateGroup",
                                            "ParentNodeId": "i=12620",
                                            "DataType": "BuiltInType.NodeId",
                                            "DisplayName": "CertificateGroup",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=12620",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=13736",
                                            "BrowseName": "CertificateType",
                                            "ParentNodeId": "i=12620",
                                            "DataType": "BuiltInType.NodeId",
                                            "DisplayName": "CertificateType",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=12620",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true
                                }
                            ]
                        }
                    ]
                },
                {
                    "DisplayName": "SystemEventType",
                    "BrowseName": "SystemEventType",
                    "Description": "",
                    "NodeId": "i=2130",
                    "References": [],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "DeviceFailureEventType",
                            "BrowseName": "DeviceFailureEventType",
                            "Description": "",
                            "NodeId": "i=2131",
                            "References": [],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "SystemStatusChangeEventType",
                            "BrowseName": "SystemStatusChangeEventType",
                            "Description": "",
                            "NodeId": "i=11446",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=11696",
                                    "BrowseName": "SystemState",
                                    "ParentNodeId": "i=11446",
                                    "DataType": "BuiltInType.i=852",
                                    "DisplayName": "SystemState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=11446",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "RefreshStartEventType",
                            "BrowseName": "RefreshStartEventType",
                            "Description": "",
                            "NodeId": "i=2787",
                            "References": [],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "RefreshEndEventType",
                            "BrowseName": "RefreshEndEventType",
                            "Description": "",
                            "NodeId": "i=2788",
                            "References": [],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "RefreshRequiredEventType",
                            "BrowseName": "RefreshRequiredEventType",
                            "Description": "",
                            "NodeId": "i=2789",
                            "References": [],
                            "HasSupertype": true
                        }
                    ]
                },
                {
                    "DisplayName": "BaseModelChangeEventType",
                    "BrowseName": "BaseModelChangeEventType",
                    "Description": "",
                    "NodeId": "i=2132",
                    "References": [],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "GeneralModelChangeEventType",
                            "BrowseName": "GeneralModelChangeEventType",
                            "Description": "",
                            "NodeId": "i=2133",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2134",
                                    "BrowseName": "Changes",
                                    "ParentNodeId": "i=2133",
                                    "DataType": "BuiltInType.i=877",
                                    "DisplayName": "Changes",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2133",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "SemanticChangeEventType",
                            "BrowseName": "SemanticChangeEventType",
                            "Description": "",
                            "NodeId": "i=2738",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2739",
                                    "BrowseName": "Changes",
                                    "ParentNodeId": "i=2738",
                                    "DataType": "BuiltInType.i=897",
                                    "DisplayName": "Changes",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2738",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true
                        }
                    ]
                },
                {
                    "DisplayName": "EventQueueOverflowEventType",
                    "BrowseName": "EventQueueOverflowEventType",
                    "Description": "",
                    "NodeId": "i=3035",
                    "References": [],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "ProgressEventType",
                    "BrowseName": "ProgressEventType",
                    "Description": "",
                    "NodeId": "i=11436",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12502",
                            "BrowseName": "Context",
                            "ParentNodeId": "i=11436",
                            "DataType": "BuiltInType.i=24",
                            "DisplayName": "Context",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11436",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=12503",
                            "BrowseName": "Progress",
                            "ParentNodeId": "i=11436",
                            "DataType": "BuiltInType.UInt16",
                            "DisplayName": "Progress",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=11436",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        }
                    ],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "TransitionEventType",
                    "BrowseName": "TransitionEventType",
                    "Description": "",
                    "NodeId": "i=2311",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2774",
                            "BrowseName": "Transition",
                            "ParentNodeId": "i=2311",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "Transition",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3754",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=2762",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2311",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2775",
                            "BrowseName": "FromState",
                            "ParentNodeId": "i=2311",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "FromState",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3746",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=2755",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2311",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2776",
                            "BrowseName": "ToState",
                            "ParentNodeId": "i=2311",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "ToState",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3750",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=2755",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2311",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "ProgramTransitionEventType",
                            "BrowseName": "ProgramTransitionEventType",
                            "Description": "",
                            "NodeId": "i=2378",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2379",
                                    "BrowseName": "IntermediateResult",
                                    "ParentNodeId": "i=2378",
                                    "DataType": "BuiltInType.i=24",
                                    "DisplayName": "IntermediateResult",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2378",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                }
                            ],
                            "HasSupertype": true
                        }
                    ]
                },
                {
                    "DisplayName": "ConditionType",
                    "BrowseName": "ConditionType",
                    "Description": "",
                    "NodeId": "i=2782",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11112",
                            "BrowseName": "ConditionClassId",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.NodeId",
                            "DisplayName": "ConditionClassId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=11113",
                            "BrowseName": "ConditionClassName",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "ConditionClassName",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9009",
                            "BrowseName": "ConditionName",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ConditionName",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9010",
                            "BrowseName": "BranchId",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.NodeId",
                            "DisplayName": "BranchId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=3874",
                            "BrowseName": "Retain",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.Boolean",
                            "DisplayName": "Retain",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9011",
                            "BrowseName": "EnabledState",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "EnabledState",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9012",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9015",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9016",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9017",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=8995",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9020",
                            "BrowseName": "Quality",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.StatusCode",
                            "DisplayName": "Quality",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9021",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=9002",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9022",
                            "BrowseName": "LastSeverity",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.UInt16",
                            "DisplayName": "LastSeverity",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9023",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=9002",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9024",
                            "BrowseName": "Comment",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "Comment",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9025",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=9002",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=9026",
                            "BrowseName": "ClientUserId",
                            "ParentNodeId": "i=2782",
                            "DataType": "BuiltInType.String",
                            "DisplayName": "ClientUserId",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=68",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasProperty"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=9028",
                            "BrowseName": "Disable",
                            "ParentNodeId": "i=2782",
                            "DisplayName": "Disable",
                            "References": [
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2803",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=9027",
                            "BrowseName": "Enable",
                            "ParentNodeId": "i=2782",
                            "DisplayName": "Enable",
                            "References": [
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2803",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=9029",
                            "BrowseName": "AddComment",
                            "ParentNodeId": "i=2782",
                            "DisplayName": "AddComment",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=9030",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2829",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=3875",
                            "BrowseName": "ConditionRefresh",
                            "ParentNodeId": "i=2782",
                            "DisplayName": "ConditionRefresh",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3876",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2787",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2788",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Method",
                            "NodeId": "i=12912",
                            "BrowseName": "ConditionRefresh2",
                            "ParentNodeId": "i=2782",
                            "DisplayName": "ConditionRefresh2",
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=12913",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2787",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "i=3065",
                                    "IsForward": "true",
                                    "NodeId": "i=2788",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2782",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "DialogConditionType",
                            "BrowseName": "DialogConditionType",
                            "Description": "",
                            "NodeId": "i=2830",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9035",
                                    "BrowseName": "EnabledState",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "EnabledState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9036",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "true",
                                            "NodeId": "i=9055",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=8995",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9055",
                                    "BrowseName": "DialogState",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "DialogState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9056",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9060",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "false",
                                            "NodeId": "i=9035",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=8995",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2831",
                                    "BrowseName": "Prompt",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "Prompt",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9064",
                                    "BrowseName": "ResponseOptionSet",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "ResponseOptionSet",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9065",
                                    "BrowseName": "DefaultResponse",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.Int32",
                                    "DisplayName": "DefaultResponse",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9066",
                                    "BrowseName": "OkResponse",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.Int32",
                                    "DisplayName": "OkResponse",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9067",
                                    "BrowseName": "CancelResponse",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.Int32",
                                    "DisplayName": "CancelResponse",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9068",
                                    "BrowseName": "LastResponse",
                                    "ParentNodeId": "i=2830",
                                    "DataType": "BuiltInType.Int32",
                                    "DisplayName": "LastResponse",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=9069",
                                    "BrowseName": "Respond",
                                    "ParentNodeId": "i=2830",
                                    "DisplayName": "Respond",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9070",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=8927",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2830",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                }
                            ],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "AcknowledgeableConditionType",
                            "BrowseName": "AcknowledgeableConditionType",
                            "Description": "",
                            "NodeId": "i=2881",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9073",
                                    "BrowseName": "EnabledState",
                                    "ParentNodeId": "i=2881",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "EnabledState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9074",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "true",
                                            "NodeId": "i=9093",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "true",
                                            "NodeId": "i=9102",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=8995",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2881",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9093",
                                    "BrowseName": "AckedState",
                                    "ParentNodeId": "i=2881",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "AckedState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9094",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9098",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "false",
                                            "NodeId": "i=9073",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=8995",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2881",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9102",
                                    "BrowseName": "ConfirmedState",
                                    "ParentNodeId": "i=2881",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "ConfirmedState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9103",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9107",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTrueSubState",
                                            "IsForward": "false",
                                            "NodeId": "i=9073",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=8995",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=80",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2881",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=9111",
                                    "BrowseName": "Acknowledge",
                                    "ParentNodeId": "i=2881",
                                    "DisplayName": "Acknowledge",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9112",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=8944",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2881",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=9113",
                                    "BrowseName": "Confirm",
                                    "ParentNodeId": "i=2881",
                                    "DisplayName": "Confirm",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=9114",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=8961",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=80",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2881",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                }
                            ],
                            "HasSupertype": true,
                            "SubObjects": [
                                {
                                    "DisplayName": "AlarmConditionType",
                                    "BrowseName": "AlarmConditionType",
                                    "Description": "",
                                    "NodeId": "i=2915",
                                    "References": [
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=9118",
                                            "BrowseName": "EnabledState",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.LocalizedText",
                                            "DisplayName": "EnabledState",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9119",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9160",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9169",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9178",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=8995",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasComponent"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=9160",
                                            "BrowseName": "ActiveState",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.LocalizedText",
                                            "DisplayName": "ActiveState",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9161",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9164",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9165",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9166",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                    "IsForward": "false",
                                                    "NodeId": "i=9118",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=8995",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasComponent"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=11120",
                                            "BrowseName": "InputNode",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.NodeId",
                                            "DisplayName": "InputNode",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=9169",
                                            "BrowseName": "SuppressedState",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.LocalizedText",
                                            "DisplayName": "SuppressedState",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9170",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "true",
                                                    "NodeId": "i=9174",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                    "IsForward": "false",
                                                    "NodeId": "i=9118",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=8995",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=80",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasComponent"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=9215",
                                            "BrowseName": "SuppressedOrShelved",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.Boolean",
                                            "DisplayName": "SuppressedOrShelved",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=78",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        },
                                        {
                                            "NodeClass": "NodeClass.Variable",
                                            "NodeId": "i=9216",
                                            "BrowseName": "MaxTimeShelved",
                                            "ParentNodeId": "i=2915",
                                            "DataType": "BuiltInType.i=290",
                                            "DisplayName": "MaxTimeShelved",
                                            "Description": "",
                                            "Required": true,
                                            "References": [
                                                {
                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                    "IsForward": "true",
                                                    "NodeId": "i=68",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                    "IsForward": "true",
                                                    "NodeId": "i=80",
                                                    "Required": true
                                                },
                                                {
                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                    "IsForward": "false",
                                                    "NodeId": "i=2915",
                                                    "Required": true
                                                }
                                            ],
                                            "ReferenceTypeId": "Identifier.HasProperty"
                                        }
                                    ],
                                    "HasSupertype": true,
                                    "SubObjects": [
                                        {
                                            "DisplayName": "LimitAlarmType",
                                            "BrowseName": "LimitAlarmType",
                                            "Description": "",
                                            "NodeId": "i=2955",
                                            "References": [
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11124",
                                                    "BrowseName": "HighHighLimit",
                                                    "ParentNodeId": "i=2955",
                                                    "DataType": "BuiltInType.Double",
                                                    "DisplayName": "HighHighLimit",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=80",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2955",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11125",
                                                    "BrowseName": "HighLimit",
                                                    "ParentNodeId": "i=2955",
                                                    "DataType": "BuiltInType.Double",
                                                    "DisplayName": "HighLimit",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=80",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2955",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11126",
                                                    "BrowseName": "LowLimit",
                                                    "ParentNodeId": "i=2955",
                                                    "DataType": "BuiltInType.Double",
                                                    "DisplayName": "LowLimit",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=80",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2955",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                },
                                                {
                                                    "NodeClass": "NodeClass.Variable",
                                                    "NodeId": "i=11127",
                                                    "BrowseName": "LowLowLimit",
                                                    "ParentNodeId": "i=2955",
                                                    "DataType": "BuiltInType.Double",
                                                    "DisplayName": "LowLowLimit",
                                                    "Description": "",
                                                    "Required": true,
                                                    "References": [
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                            "IsForward": "true",
                                                            "NodeId": "i=68",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                            "IsForward": "true",
                                                            "NodeId": "i=80",
                                                            "Required": true
                                                        },
                                                        {
                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                            "IsForward": "false",
                                                            "NodeId": "i=2955",
                                                            "Required": true
                                                        }
                                                    ],
                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                }
                                            ],
                                            "HasSupertype": true,
                                            "SubObjects": [
                                                {
                                                    "DisplayName": "ExclusiveLimitAlarmType",
                                                    "BrowseName": "ExclusiveLimitAlarmType",
                                                    "Description": "",
                                                    "NodeId": "i=9341",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=9398",
                                                            "BrowseName": "ActiveState",
                                                            "ParentNodeId": "i=9341",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "ActiveState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=9399",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "HasTrueSubState",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=9455",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9341",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        }
                                                    ],
                                                    "HasSupertype": true,
                                                    "SubObjects": [
                                                        {
                                                            "DisplayName": "ExclusiveLevelAlarmType",
                                                            "BrowseName": "ExclusiveLevelAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=9482",
                                                            "References": [],
                                                            "HasSupertype": true
                                                        },
                                                        {
                                                            "DisplayName": "ExclusiveDeviationAlarmType",
                                                            "BrowseName": "ExclusiveDeviationAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=9764",
                                                            "References": [
                                                                {
                                                                    "NodeClass": "NodeClass.Variable",
                                                                    "NodeId": "i=9905",
                                                                    "BrowseName": "SetpointNode",
                                                                    "ParentNodeId": "i=9764",
                                                                    "DataType": "BuiltInType.NodeId",
                                                                    "DisplayName": "SetpointNode",
                                                                    "Description": "",
                                                                    "Required": true,
                                                                    "References": [
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                            "IsForward": "true",
                                                                            "NodeId": "i=68",
                                                                            "Required": true
                                                                        },
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                            "IsForward": "true",
                                                                            "NodeId": "i=78",
                                                                            "Required": true
                                                                        },
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                                            "IsForward": "false",
                                                                            "NodeId": "i=9764",
                                                                            "Required": true
                                                                        }
                                                                    ],
                                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                                }
                                                            ],
                                                            "HasSupertype": true
                                                        },
                                                        {
                                                            "DisplayName": "ExclusiveRateOfChangeAlarmType",
                                                            "BrowseName": "ExclusiveRateOfChangeAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=9623",
                                                            "References": [],
                                                            "HasSupertype": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "DisplayName": "NonExclusiveLimitAlarmType",
                                                    "BrowseName": "NonExclusiveLimitAlarmType",
                                                    "Description": "",
                                                    "NodeId": "i=9906",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=9963",
                                                            "BrowseName": "ActiveState",
                                                            "ParentNodeId": "i=9906",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "ActiveState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=9964",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10020",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10029",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10038",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10047",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9906",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=10020",
                                                            "BrowseName": "HighHighState",
                                                            "ParentNodeId": "i=9906",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "HighHighState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10021",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10025",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9963",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=80",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9906",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=10029",
                                                            "BrowseName": "HighState",
                                                            "ParentNodeId": "i=9906",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "HighState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10030",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10034",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9963",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=80",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9906",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=10038",
                                                            "BrowseName": "LowState",
                                                            "ParentNodeId": "i=9906",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "LowState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10039",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10043",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9963",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=80",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9906",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        },
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=10047",
                                                            "BrowseName": "LowLowState",
                                                            "ParentNodeId": "i=9906",
                                                            "DataType": "BuiltInType.LocalizedText",
                                                            "DisplayName": "LowLowState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10048",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=10052",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTrueSubState",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9963",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=8995",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=80",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasComponent",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=9906",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasComponent"
                                                        }
                                                    ],
                                                    "HasSupertype": true,
                                                    "SubObjects": [
                                                        {
                                                            "DisplayName": "NonExclusiveLevelAlarmType",
                                                            "BrowseName": "NonExclusiveLevelAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=10060",
                                                            "References": [],
                                                            "HasSupertype": true
                                                        },
                                                        {
                                                            "DisplayName": "NonExclusiveDeviationAlarmType",
                                                            "BrowseName": "NonExclusiveDeviationAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=10368",
                                                            "References": [
                                                                {
                                                                    "NodeClass": "NodeClass.Variable",
                                                                    "NodeId": "i=10522",
                                                                    "BrowseName": "SetpointNode",
                                                                    "ParentNodeId": "i=10368",
                                                                    "DataType": "BuiltInType.NodeId",
                                                                    "DisplayName": "SetpointNode",
                                                                    "Description": "",
                                                                    "Required": true,
                                                                    "References": [
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                            "IsForward": "true",
                                                                            "NodeId": "i=68",
                                                                            "Required": true
                                                                        },
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                            "IsForward": "true",
                                                                            "NodeId": "i=78",
                                                                            "Required": true
                                                                        },
                                                                        {
                                                                            "ReferenceTypeId": "Identifier.HasProperty",
                                                                            "IsForward": "false",
                                                                            "NodeId": "i=10368",
                                                                            "Required": true
                                                                        }
                                                                    ],
                                                                    "ReferenceTypeId": "Identifier.HasProperty"
                                                                }
                                                            ],
                                                            "HasSupertype": true
                                                        },
                                                        {
                                                            "DisplayName": "NonExclusiveRateOfChangeAlarmType",
                                                            "BrowseName": "NonExclusiveRateOfChangeAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=10214",
                                                            "References": [],
                                                            "HasSupertype": true
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            "DisplayName": "DiscreteAlarmType",
                                            "BrowseName": "DiscreteAlarmType",
                                            "Description": "",
                                            "NodeId": "i=10523",
                                            "References": [],
                                            "HasSupertype": true,
                                            "SubObjects": [
                                                {
                                                    "DisplayName": "OffNormalAlarmType",
                                                    "BrowseName": "OffNormalAlarmType",
                                                    "Description": "",
                                                    "NodeId": "i=10637",
                                                    "References": [
                                                        {
                                                            "NodeClass": "NodeClass.Variable",
                                                            "NodeId": "i=11158",
                                                            "BrowseName": "NormalState",
                                                            "ParentNodeId": "i=10637",
                                                            "DataType": "BuiltInType.NodeId",
                                                            "DisplayName": "NormalState",
                                                            "Description": "",
                                                            "Required": true,
                                                            "References": [
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=68",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                    "IsForward": "true",
                                                                    "NodeId": "i=78",
                                                                    "Required": true
                                                                },
                                                                {
                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                    "IsForward": "false",
                                                                    "NodeId": "i=10637",
                                                                    "Required": true
                                                                }
                                                            ],
                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                        }
                                                    ],
                                                    "HasSupertype": true,
                                                    "SubObjects": [
                                                        {
                                                            "DisplayName": "SystemOffNormalAlarmType",
                                                            "BrowseName": "SystemOffNormalAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=11753",
                                                            "References": [],
                                                            "HasSupertype": true,
                                                            "SubObjects": [
                                                                {
                                                                    "DisplayName": "CertificateExpirationAlarmType",
                                                                    "BrowseName": "CertificateExpirationAlarmType",
                                                                    "Description": "",
                                                                    "NodeId": "i=13225",
                                                                    "References": [
                                                                        {
                                                                            "NodeClass": "NodeClass.Variable",
                                                                            "NodeId": "i=13325",
                                                                            "BrowseName": "ExpirationDate",
                                                                            "ParentNodeId": "i=13225",
                                                                            "DataType": "BuiltInType.DateTime",
                                                                            "DisplayName": "ExpirationDate",
                                                                            "Description": "",
                                                                            "Required": true,
                                                                            "References": [
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=68",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=78",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                                    "IsForward": "false",
                                                                                    "NodeId": "i=13225",
                                                                                    "Required": true
                                                                                }
                                                                            ],
                                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                                        },
                                                                        {
                                                                            "NodeClass": "NodeClass.Variable",
                                                                            "NodeId": "i=14900",
                                                                            "BrowseName": "ExpirationLimit",
                                                                            "ParentNodeId": "i=13225",
                                                                            "DataType": "BuiltInType.i=290",
                                                                            "DisplayName": "ExpirationLimit",
                                                                            "Description": "",
                                                                            "Required": true,
                                                                            "References": [
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=68",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=80",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                                    "IsForward": "false",
                                                                                    "NodeId": "i=13225",
                                                                                    "Required": true
                                                                                }
                                                                            ],
                                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                                        },
                                                                        {
                                                                            "NodeClass": "NodeClass.Variable",
                                                                            "NodeId": "i=13326",
                                                                            "BrowseName": "CertificateType",
                                                                            "ParentNodeId": "i=13225",
                                                                            "DataType": "BuiltInType.NodeId",
                                                                            "DisplayName": "CertificateType",
                                                                            "Description": "",
                                                                            "Required": true,
                                                                            "References": [
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=68",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=78",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                                    "IsForward": "false",
                                                                                    "NodeId": "i=13225",
                                                                                    "Required": true
                                                                                }
                                                                            ],
                                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                                        },
                                                                        {
                                                                            "NodeClass": "NodeClass.Variable",
                                                                            "NodeId": "i=13327",
                                                                            "BrowseName": "Certificate",
                                                                            "ParentNodeId": "i=13225",
                                                                            "DataType": "BuiltInType.ByteString",
                                                                            "DisplayName": "Certificate",
                                                                            "Description": "",
                                                                            "Required": true,
                                                                            "References": [
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=68",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                                                                    "IsForward": "true",
                                                                                    "NodeId": "i=78",
                                                                                    "Required": true
                                                                                },
                                                                                {
                                                                                    "ReferenceTypeId": "Identifier.HasProperty",
                                                                                    "IsForward": "false",
                                                                                    "NodeId": "i=13225",
                                                                                    "Required": true
                                                                                }
                                                                            ],
                                                                            "ReferenceTypeId": "Identifier.HasProperty"
                                                                        }
                                                                    ],
                                                                    "HasSupertype": true
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            "DisplayName": "TripAlarmType",
                                                            "BrowseName": "TripAlarmType",
                                                            "Description": "",
                                                            "NodeId": "i=10751",
                                                            "References": [],
                                                            "HasSupertype": true
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "DisplayName": "AggregateFunctionType",
            "BrowseName": "AggregateFunctionType",
            "Description": "",
            "NodeId": "i=2340",
            "References": [],
            "HasSupertype": true
        },
        {
            "DisplayName": "StateMachineType",
            "BrowseName": "StateMachineType",
            "Description": "",
            "NodeId": "i=2299",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2769",
                    "BrowseName": "CurrentState",
                    "ParentNodeId": "i=2299",
                    "DataType": "BuiltInType.LocalizedText",
                    "DisplayName": "CurrentState",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=3720",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2755",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2299",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2770",
                    "BrowseName": "LastTransition",
                    "ParentNodeId": "i=2299",
                    "DataType": "BuiltInType.LocalizedText",
                    "DisplayName": "LastTransition",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=3724",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=2762",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=2299",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "FiniteStateMachineType",
                    "BrowseName": "FiniteStateMachineType",
                    "Description": "",
                    "NodeId": "i=2771",
                    "References": [
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2772",
                            "BrowseName": "CurrentState",
                            "ParentNodeId": "i=2771",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "CurrentState",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3728",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=2760",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=78",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2771",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        },
                        {
                            "NodeClass": "NodeClass.Variable",
                            "NodeId": "i=2773",
                            "BrowseName": "LastTransition",
                            "ParentNodeId": "i=2771",
                            "DataType": "BuiltInType.LocalizedText",
                            "DisplayName": "LastTransition",
                            "Description": "",
                            "Required": true,
                            "References": [
                                {
                                    "ReferenceTypeId": "Identifier.HasProperty",
                                    "IsForward": "true",
                                    "NodeId": "i=3732",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                    "IsForward": "true",
                                    "NodeId": "i=2767",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasModellingRule",
                                    "IsForward": "true",
                                    "NodeId": "i=80",
                                    "Required": true
                                },
                                {
                                    "ReferenceTypeId": "Identifier.HasComponent",
                                    "IsForward": "false",
                                    "NodeId": "i=2771",
                                    "Required": true
                                }
                            ],
                            "ReferenceTypeId": "Identifier.HasComponent"
                        }
                    ],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "ShelvedStateMachineType",
                            "BrowseName": "ShelvedStateMachineType",
                            "Description": "",
                            "NodeId": "i=2929",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=9115",
                                    "BrowseName": "UnshelveTime",
                                    "ParentNodeId": "i=2929",
                                    "DataType": "BuiltInType.i=290",
                                    "DisplayName": "UnshelveTime",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2929",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2947",
                                    "BrowseName": "Unshelve",
                                    "ParentNodeId": "i=2929",
                                    "DisplayName": "Unshelve",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2940",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2943",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=11093",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2929",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2948",
                                    "BrowseName": "OneShotShelve",
                                    "ParentNodeId": "i=2929",
                                    "DisplayName": "OneShotShelve",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2936",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2942",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=11093",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2929",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2949",
                                    "BrowseName": "TimedShelve",
                                    "ParentNodeId": "i=2929",
                                    "DisplayName": "TimedShelve",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=2991",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2935",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2945",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "i=3065",
                                            "IsForward": "true",
                                            "NodeId": "i=11093",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2929",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                }
                            ],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "ExclusiveLimitStateMachineType",
                            "BrowseName": "ExclusiveLimitStateMachineType",
                            "Description": "",
                            "NodeId": "i=9318",
                            "References": [],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "ProgramStateMachineType",
                            "BrowseName": "ProgramStateMachineType",
                            "Description": "",
                            "NodeId": "i=2391",
                            "References": [
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=3830",
                                    "BrowseName": "CurrentState",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "CurrentState",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3831",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3833",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=2760",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=3835",
                                    "BrowseName": "LastTransition",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.LocalizedText",
                                    "DisplayName": "LastTransition",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3836",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3838",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3839",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=2767",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2392",
                                    "BrowseName": "Creatable",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.Boolean",
                                    "DisplayName": "Creatable",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2393",
                                    "BrowseName": "Deletable",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.Boolean",
                                    "DisplayName": "Deletable",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2394",
                                    "BrowseName": "AutoDelete",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.Boolean",
                                    "DisplayName": "AutoDelete",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2395",
                                    "BrowseName": "RecycleCount",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.Int32",
                                    "DisplayName": "RecycleCount",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2396",
                                    "BrowseName": "InstanceCount",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.UInt32",
                                    "DisplayName": "InstanceCount",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2397",
                                    "BrowseName": "MaxInstanceCount",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.UInt32",
                                    "DisplayName": "MaxInstanceCount",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2398",
                                    "BrowseName": "MaxRecycleCount",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.UInt32",
                                    "DisplayName": "MaxRecycleCount",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=68",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasProperty"
                                },
                                {
                                    "NodeClass": "NodeClass.Variable",
                                    "NodeId": "i=2399",
                                    "BrowseName": "ProgramDiagnostics",
                                    "ParentNodeId": "i=2391",
                                    "DataType": "BuiltInType.i=894",
                                    "DisplayName": "ProgramDiagnostics",
                                    "Description": "",
                                    "Required": true,
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3840",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3841",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3842",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3843",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3844",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3845",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3846",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3847",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3848",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasProperty",
                                            "IsForward": "true",
                                            "NodeId": "i=3849",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                                            "IsForward": "true",
                                            "NodeId": "i=2380",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=80",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2426",
                                    "BrowseName": "Start",
                                    "ParentNodeId": "i=2391",
                                    "DisplayName": "Start",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2410",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2427",
                                    "BrowseName": "Suspend",
                                    "ParentNodeId": "i=2391",
                                    "DisplayName": "Suspend",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2416",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2428",
                                    "BrowseName": "Resume",
                                    "ParentNodeId": "i=2391",
                                    "DisplayName": "Resume",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2418",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2429",
                                    "BrowseName": "Halt",
                                    "ParentNodeId": "i=2391",
                                    "DisplayName": "Halt",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2412",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2420",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2424",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                },
                                {
                                    "NodeClass": "NodeClass.Method",
                                    "NodeId": "i=2430",
                                    "BrowseName": "Reset",
                                    "ParentNodeId": "i=2391",
                                    "DisplayName": "Reset",
                                    "References": [
                                        {
                                            "ReferenceTypeId": "Identifier.HasCause",
                                            "IsForward": "false",
                                            "NodeId": "i=2408",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasModellingRule",
                                            "IsForward": "true",
                                            "NodeId": "i=78",
                                            "Required": true
                                        },
                                        {
                                            "ReferenceTypeId": "Identifier.HasComponent",
                                            "IsForward": "false",
                                            "NodeId": "i=2391",
                                            "Required": true
                                        }
                                    ],
                                    "ReferenceTypeId": "Identifier.HasComponent"
                                }
                            ],
                            "HasSupertype": true
                        }
                    ]
                }
            ]
        },
        {
            "DisplayName": "StateType",
            "BrowseName": "StateType",
            "Description": "",
            "NodeId": "i=2307",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2308",
                    "BrowseName": "StateNumber",
                    "ParentNodeId": "i=2307",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "StateNumber",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2307",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "InitialStateType",
                    "BrowseName": "InitialStateType",
                    "Description": "",
                    "NodeId": "i=2309",
                    "References": [],
                    "HasSupertype": true
                }
            ]
        },
        {
            "DisplayName": "TransitionType",
            "BrowseName": "TransitionType",
            "Description": "",
            "NodeId": "i=2310",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2312",
                    "BrowseName": "TransitionNumber",
                    "ParentNodeId": "i=2310",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "TransitionNumber",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2310",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "BaseConditionClassType",
            "BrowseName": "BaseConditionClassType",
            "Description": "",
            "NodeId": "i=11163",
            "References": [],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "ProcessConditionClassType",
                    "BrowseName": "ProcessConditionClassType",
                    "Description": "",
                    "NodeId": "i=11164",
                    "References": [],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "MaintenanceConditionClassType",
                    "BrowseName": "MaintenanceConditionClassType",
                    "Description": "",
                    "NodeId": "i=11165",
                    "References": [],
                    "HasSupertype": true
                },
                {
                    "DisplayName": "SystemConditionClassType",
                    "BrowseName": "SystemConditionClassType",
                    "Description": "",
                    "NodeId": "i=11166",
                    "References": [],
                    "HasSupertype": true
                }
            ]
        },
        {
            "DisplayName": "HistoricalDataConfigurationType",
            "BrowseName": "HistoricalDataConfigurationType",
            "Description": "",
            "NodeId": "i=2318",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2323",
                    "BrowseName": "Stepped",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "Stepped",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2324",
                    "BrowseName": "Definition",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "Definition",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2325",
                    "BrowseName": "MaxTimeInterval",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.i=290",
                    "DisplayName": "MaxTimeInterval",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2326",
                    "BrowseName": "MinTimeInterval",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.i=290",
                    "DisplayName": "MinTimeInterval",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2327",
                    "BrowseName": "ExceptionDeviation",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.Double",
                    "DisplayName": "ExceptionDeviation",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2328",
                    "BrowseName": "ExceptionDeviationFormat",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.i=890",
                    "DisplayName": "ExceptionDeviationFormat",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11499",
                    "BrowseName": "StartOfArchive",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.i=294",
                    "DisplayName": "StartOfArchive",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11500",
                    "BrowseName": "StartOfOnlineArchive",
                    "ParentNodeId": "i=2318",
                    "DataType": "BuiltInType.i=294",
                    "DisplayName": "StartOfOnlineArchive",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=80",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2318",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "HistoryServerCapabilitiesType",
            "BrowseName": "HistoryServerCapabilitiesType",
            "Description": "",
            "NodeId": "i=2330",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2331",
                    "BrowseName": "AccessHistoryDataCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "AccessHistoryDataCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2332",
                    "BrowseName": "AccessHistoryEventsCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "AccessHistoryEventsCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11268",
                    "BrowseName": "MaxReturnDataValues",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxReturnDataValues",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11269",
                    "BrowseName": "MaxReturnEventValues",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxReturnEventValues",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2334",
                    "BrowseName": "InsertDataCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "InsertDataCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2335",
                    "BrowseName": "ReplaceDataCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "ReplaceDataCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2336",
                    "BrowseName": "UpdateDataCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "UpdateDataCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2337",
                    "BrowseName": "DeleteRawCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "DeleteRawCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=2338",
                    "BrowseName": "DeleteAtTimeCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "DeleteAtTimeCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11278",
                    "BrowseName": "InsertEventCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "InsertEventCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11279",
                    "BrowseName": "ReplaceEventCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "ReplaceEventCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11280",
                    "BrowseName": "UpdateEventCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "UpdateEventCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11501",
                    "BrowseName": "DeleteEventCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "DeleteEventCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11270",
                    "BrowseName": "InsertAnnotationCapability",
                    "ParentNodeId": "i=2330",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "InsertAnnotationCapability",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=2330",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "CertificateGroupType",
            "BrowseName": "CertificateGroupType",
            "Description": "",
            "NodeId": "i=12555",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=13631",
                    "BrowseName": "CertificateTypes",
                    "ParentNodeId": "i=12555",
                    "DataType": "BuiltInType.NodeId",
                    "DisplayName": "CertificateTypes",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=12555",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "CertificateType",
            "BrowseName": "CertificateType",
            "Description": "",
            "NodeId": "i=12556",
            "References": [],
            "HasSupertype": true,
            "SubObjects": [
                {
                    "DisplayName": "ApplicationCertificateType",
                    "BrowseName": "ApplicationCertificateType",
                    "Description": "",
                    "NodeId": "i=12557",
                    "References": [],
                    "HasSupertype": true,
                    "SubObjects": [
                        {
                            "DisplayName": "RsaMinApplicationCertificateType",
                            "BrowseName": "RsaMinApplicationCertificateType",
                            "Description": "",
                            "NodeId": "i=12559",
                            "References": [],
                            "HasSupertype": true
                        },
                        {
                            "DisplayName": "RsaSha256ApplicationCertificateType",
                            "BrowseName": "RsaSha256ApplicationCertificateType",
                            "Description": "",
                            "NodeId": "i=12560",
                            "References": [],
                            "HasSupertype": true
                        }
                    ]
                },
                {
                    "DisplayName": "HttpsCertificateType",
                    "BrowseName": "HttpsCertificateType",
                    "Description": "",
                    "NodeId": "i=12558",
                    "References": [],
                    "HasSupertype": true
                }
            ]
        },
        {
            "DisplayName": "ServerConfigurationType",
            "BrowseName": "ServerConfigurationType",
            "Description": "",
            "NodeId": "i=12581",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12708",
                    "BrowseName": "ServerCapabilities",
                    "ParentNodeId": "i=12581",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "ServerCapabilities",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12583",
                    "BrowseName": "SupportedPrivateKeyFormats",
                    "ParentNodeId": "i=12581",
                    "DataType": "BuiltInType.String",
                    "DisplayName": "SupportedPrivateKeyFormats",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12584",
                    "BrowseName": "MaxTrustListSize",
                    "ParentNodeId": "i=12581",
                    "DataType": "BuiltInType.UInt32",
                    "DisplayName": "MaxTrustListSize",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=12585",
                    "BrowseName": "MulticastDnsEnabled",
                    "ParentNodeId": "i=12581",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "MulticastDnsEnabled",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12616",
                    "BrowseName": "UpdateCertificate",
                    "ParentNodeId": "i=12581",
                    "DisplayName": "UpdateCertificate",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12617",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12618",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12734",
                    "BrowseName": "ApplyChanges",
                    "ParentNodeId": "i=12581",
                    "DisplayName": "ApplyChanges",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12731",
                    "BrowseName": "CreateSigningRequest",
                    "ParentNodeId": "i=12581",
                    "DisplayName": "CreateSigningRequest",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12732",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12733",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                },
                {
                    "NodeClass": "NodeClass.Method",
                    "NodeId": "i=12775",
                    "BrowseName": "GetRejectedList",
                    "ParentNodeId": "i=12581",
                    "DisplayName": "GetRejectedList",
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "true",
                            "NodeId": "i=12776",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasComponent",
                            "IsForward": "false",
                            "NodeId": "i=12581",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasComponent"
                }
            ],
            "HasSupertype": true
        },
        {
            "DisplayName": "AggregateConfigurationType",
            "BrowseName": "AggregateConfigurationType",
            "Description": "",
            "NodeId": "i=11187",
            "References": [
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11188",
                    "BrowseName": "TreatUncertainAsBad",
                    "ParentNodeId": "i=11187",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "TreatUncertainAsBad",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11187",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11189",
                    "BrowseName": "PercentDataBad",
                    "ParentNodeId": "i=11187",
                    "DataType": "BuiltInType.Byte",
                    "DisplayName": "PercentDataBad",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11187",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11190",
                    "BrowseName": "PercentDataGood",
                    "ParentNodeId": "i=11187",
                    "DataType": "BuiltInType.Byte",
                    "DisplayName": "PercentDataGood",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11187",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                },
                {
                    "NodeClass": "NodeClass.Variable",
                    "NodeId": "i=11191",
                    "BrowseName": "UseSlopedExtrapolation",
                    "ParentNodeId": "i=11187",
                    "DataType": "BuiltInType.Boolean",
                    "DisplayName": "UseSlopedExtrapolation",
                    "Description": "",
                    "Required": true,
                    "References": [
                        {
                            "ReferenceTypeId": "Identifier.HasTypeDefinition",
                            "IsForward": "true",
                            "NodeId": "i=68",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasModellingRule",
                            "IsForward": "true",
                            "NodeId": "i=78",
                            "Required": true
                        },
                        {
                            "ReferenceTypeId": "Identifier.HasProperty",
                            "IsForward": "false",
                            "NodeId": "i=11187",
                            "Required": true
                        }
                    ],
                    "ReferenceTypeId": "Identifier.HasProperty"
                }
            ],
            "HasSupertype": true
        }
    ]
} ];