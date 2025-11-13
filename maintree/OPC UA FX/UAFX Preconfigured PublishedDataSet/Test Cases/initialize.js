include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX Preconfigured PublishedDataSet";

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
        
        // Find and initialize all instances of type 'PublisherCapabilitiesType'
        if( isDefined( CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType.NodeId ) ) {
            CU_Variables.PublisherCapabilitiesType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.PublisherCapabilitiesType } );
        }
        else addError( "Type definition of 'PublisherCapabilitiesType' not found in server, therefore no instances of this type can be browsed." );
        
        CU_Variables.FunctionalEntityWithPreconfiguredPDS = null;
        
        // Accumulate all PreconfiguredPublishedDataSets arrays
        CU_Variables.AllPreconfiguredPublishedDataSets = [];
        for( var p=0; p<CU_Variables.PublisherCapabilitiesType_Instances.length; p++ ) {
            var tempPreconfiguredPublishedDataSets = GetTargetNode( {
                SourceNode: CU_Variables.PublisherCapabilitiesType_Instances[p].NodeId,
                TargetNodeName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PreconfiguredPublishedDataSets" } ),
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
            } );
            if( tempPreconfiguredPublishedDataSets ) {
                var tempPreconfiguredPublishedDataSets_Value = GetValueOfNodeByNodeId( tempPreconfiguredPublishedDataSets.NodeId ).toStringArray();
                for( var s=0; s<tempPreconfiguredPublishedDataSets_Value.length; s++ ) {
                    // Add the PDS Name to AllPreconfiguredPublishedDataSets it not already exists
                    if( !ArrayContains( CU_Variables.AllPreconfiguredPublishedDataSets, tempPreconfiguredPublishedDataSets_Value[s] ) ) {
                        CU_Variables.AllPreconfiguredPublishedDataSets.push( tempPreconfiguredPublishedDataSets_Value[s] );
                    }
                    
                    // Check if the found PublisherCapabilitiesType has a FunctionalEntity as parent to cache it for tests
                    if( !isDefined( CU_Variables.FunctionalEntityWithPreconfiguredPDS ) ) {
                        var publisherCapabilitiesType_parent = GetParentNode( CU_Variables.PublisherCapabilitiesType_Instances[p] );
                        if( !publisherCapabilitiesType_parent.NodeId.equals( new UaNodeId() ) ) {
                            if( GetTypeDefinitionOfNode( publisherCapabilitiesType_parent ).equals( CU_Variables.Test.BaseObjectType.FunctionalEntityType.NodeId ) ) {
                                
                                // Initialize found FE
                                SetAllChildren_recursive( publisherCapabilitiesType_parent );
                                publisherCapabilitiesType_parent.ParentAutomationComponent = GetParentAutomationComponent( publisherCapabilitiesType_parent );
                                SetAllChildren_recursive( publisherCapabilitiesType_parent.ParentAutomationComponent );
                                
                                // Cache for test
                                CU_Variables.FunctionalEntityWithPreconfiguredPDS = publisherCapabilitiesType_parent;
                                CU_Variables.FunctionalEntityPreconfiguredPDS_Name = tempPreconfiguredPublishedDataSets_Value[s];
                                
                            }
                        }
                    }
                }
            }
        }
        
        // At least one PreconfiguredPublishedDataSet exists, if not skip entire CU.
        if( CU_Variables.AllPreconfiguredPublishedDataSets.length == 0 ) {
            addSkipped( "No PreconfiguredPublishedDataSet exists in the server. Skipping CU." );
            stopCurrentUnit();
        }
        
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );