include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ConnectionEndpoint PubSub";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        CU_Variables.AllFunctionalEntities = [];
        
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            var allFunctionalEntitiesOfAC = CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities;
            for( var fe=0; fe<allFunctionalEntitiesOfAC.length; fe++ ) {
                allFunctionalEntitiesOfAC[fe].ParentAutomationComponent = CU_Variables.Test.AutomationComponents[ac];
            }
            CU_Variables.AllFunctionalEntities = CU_Variables.AllFunctionalEntities.concat( allFunctionalEntitiesOfAC );
        }
        // Find and initialize all instances of type 'PubSubConnectionEndpointType'
        if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.NodeId ) &&
            isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.NodeId ) ) {
            CU_Variables.PubSubConnectionEndpointType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType } );
        }
        else addError( "Type definition of 'PubSubConnectionEndpointType' not found in server, therefore no instances of this type can be browsed." );
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );

function getAssociatedDataSetPublishedData( dataSetWriter ) {
    if( !isDefined( dataSetWriter ) ) throw( "getAssociatedDataSetPublishedData(): No DataSetWriterType instance defined" );
    if( !isDefined( dataSetWriter.NodeId ) ) throw( "getAssociatedDataSetPublishedData(): Provided DataSetWriterType instance appears to be no MonitoredItem" );
    var searchDefinition = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.DataSetToWriter ),
            IsForward: false
        }
    ];
    dataSetWriter.References = BaseVariables.ModelMap.Get( dataSetWriter.NodeId.toString() );
    BaseVariables.ModelMapHelper.FindReferences( dataSetWriter.References.ReferenceDescriptions, searchDefinition );
    if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
        var associatedPublishedDataItems = new MonitoredItem( dataSetWriter.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
        associatedPublishedDataItems.References = BaseVariables.ModelMap.Get( associatedPublishedDataItems.NodeId.toString() );
        
        var searchDefinition_associatedPublishedDataItems = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "PublishedData" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( associatedPublishedDataItems.References.ReferenceDescriptions, searchDefinition_associatedPublishedDataItems, BaseVariables.ModelMapHelper, true );
        if( isDefined( searchDefinition_associatedPublishedDataItems[0].ReferenceIndex ) ) {
            var publishedData = new MonitoredItem( associatedPublishedDataItems.References.ReferenceDescriptions[searchDefinition_associatedPublishedDataItems[0].ReferenceIndex].NodeId.NodeId );
            if( ReadHelper.Execute( { NodesToRead: publishedData } ) ) {
                var publishedDataValue = publishedData.Value.Value;
                if( isDefined( publishedDataValue ) && !publishedDataValue.isEmpty() ) {
                    return publishedDataValue.toExtensionObjectArray();
                }
            }
            else {
                addError( "Could not read value attribute of PusblishedData property of DataSet '" + associatedPublishedDataItems.NodeId + "'." );
                return null;
            }
        }
        else {
            addError( "DataSet '" + associatedPublishedDataItems.NodeId + "' is missing mandataory property 'PublishedData'." );
            return null;
        }
        
    }
    else {
        addError( "DataSetWriter instance '" + dataSetWriter.NodeId + "' has no inverse DataSetToWriter reference." );
        return null;
    }
}

function cleanupConnectionEndpoint( testConnectionEndpoint ) {
    // Cleanup created ConnectionEndpoint and PubSubConfig
    if( isDefined( testConnectionEndpoint ) && !testConnectionEndpoint.IsPreconfigured ) {
        if( !callCloseConnectionsMethod( {
            AutomationComponent: testConnectionEndpoint.FunctionalEntity.ParentAutomationComponent,
            ConnectionEndpoints: testConnectionEndpoint.ConnectionEndpointId,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
        UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
    }
}