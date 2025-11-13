include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX Preconfigured SubscribedDataset";

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
        
        // Find and initialize all instances of type 'SubscriberCapabilitiesType'
        if( isDefined( CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType.NodeId ) ) {
            CU_Variables.SubscriberCapabilitiesType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.SubscriberCapabilitiesType } );
        }
        else addError( "Type definition of 'SubscriberCapabilitiesType' not found in server, therefore no instances of this type can be browsed." );
        
        CU_Variables.FunctionalEntityWithPreconfiguredSDS = null;
        
        // Accumulate all PreconfiguredSubscribedDataSets arrays
        CU_Variables.AllPreconfiguredSubscribedDataSets = [];
        for( var p=0; p<CU_Variables.SubscriberCapabilitiesType_Instances.length; p++ ) {
            var tempPreconfiguredSubscribedDataSets = GetTargetNode( {
                SourceNode: CU_Variables.SubscriberCapabilitiesType_Instances[p].NodeId,
                TargetNodeName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PreconfiguredSubscribedDataSets" } ),
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
            } );
            if( tempPreconfiguredSubscribedDataSets ) {
                var tempPreconfiguredSubscribedDataSets_Value = GetValueOfNodeByNodeId( tempPreconfiguredSubscribedDataSets.NodeId ).toStringArray();
                for( var s=0; s<tempPreconfiguredSubscribedDataSets_Value.length; s++ ) {
                    // Add the SDS Name to AllPreconfiguredPublishedDataSets it not already exists
                    if( !ArrayContains( CU_Variables.AllPreconfiguredSubscribedDataSets, tempPreconfiguredSubscribedDataSets_Value[s] ) ) {
                        CU_Variables.AllPreconfiguredSubscribedDataSets.push( tempPreconfiguredSubscribedDataSets_Value[s] );
                    }
                    
                    // Check if the found SubscriberCapabilitiesType has a FunctionalEntity as parent to cache it for tests
                    if( !isDefined( CU_Variables.FunctionalEntityWithPreconfiguredSDS ) ) {
                        var subscriberCapabilitiesType_parent = GetParentNode( CU_Variables.SubscriberCapabilitiesType_Instances[p] );
                        if( !subscriberCapabilitiesType_parent.NodeId.equals( new UaNodeId() ) ) {
                            if( GetTypeDefinitionOfNode( subscriberCapabilitiesType_parent ).equals( CU_Variables.Test.BaseObjectType.FunctionalEntityType.NodeId ) ) {
                                
                                // Initialize found FE
                                SetAllChildren_recursive( subscriberCapabilitiesType_parent );
                                subscriberCapabilitiesType_parent.ParentAutomationComponent = GetParentAutomationComponent( subscriberCapabilitiesType_parent );
                                SetAllChildren_recursive( subscriberCapabilitiesType_parent.ParentAutomationComponent );
                                
                                // Cache for test
                                CU_Variables.FunctionalEntityWithPreconfiguredSDS = subscriberCapabilitiesType_parent;
                                CU_Variables.FunctionalEntityPreconfiguredSDS_Name = tempPreconfiguredSubscribedDataSets_Value[s];
                                
                            }
                        }
                    }
                }
            }
        }
        
        // At least one PreconfiguredSubscribedDataSet exists, if not skip entire CU.
        if( CU_Variables.AllPreconfiguredSubscribedDataSets.length == 0 ) {
            addSkipped( "No PreconfiguredSubscribedDataSet exists in the server. Skipping CU." );
            stopCurrentUnit();
        }
        
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );