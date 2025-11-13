/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the CommInitial bit of the CommHealth variable is set if at
                  least one PubSubConnectionEndpoint of this FunctionalEntity has its Status
                  set to Initial. 
    Requirements: PubSub communication is supported.
          Step 1: Call the EstablishConnection Method and create one PubSubConnectionEndpoint.
          Step 2: Browse the PubSubConnectionEndpoint and verify that no ToDataSetReader or
                  ToDataSetWriter Reference exists.
          Step 3: Read the value of the CommHealth Variable.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
       
        for( var fe=0; fe<CU_Variables.AllFunctionalEntities.length; fe++ ) {
            
            if( 
                !isDefined( CU_Variables.AllFunctionalEntities[fe].ConnectionEndpoints ) ||
                !isDefined( CU_Variables.AllFunctionalEntities[fe].ConnectionEndpoints.CommHealth )
            ) {
                addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' has no ConnectionEndpoints folder with CommHealth variable. Skipping instance." );
                continue;
            }
            
            addLog( "=== Start of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
            TC_Variables.nothingTested = false;
            
            // Step 1: Call the EstablishConnection Method and create one PubSubConnectionEndpoint.
            var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                FunctionalEntityNodeId: CU_Variables.AllFunctionalEntities[fe].NodeId,
                Name: "ConnectionEndpointsFolder_CommHealth_003"
            } );
            
            if( callResult !== false && callResult.success ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].FunctionalEntityNodeResult, "Received unexpected StatusCode for FunctionalEntityNodeResult" ) ) TC_Variables.Result = false;
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                if( TC_Variables.Result ) {
                    
                    refreshBaseVariablesModelMapByNodeId( CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent.NodeId, CU_Variables.SessionThread );
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    
                    var temporaryConnectionEndpoint_mI = new MonitoredItem( connectionEndpointId );
                    
                    // Step 2: Browse the PubSubConnectionEndpoint and verify that no ToDataSetReader or
                    //         ToDataSetWriter Reference exists.
                    var ToDataSetReader_targets = GetChildNodesByReferenceTypeId( temporaryConnectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetReader.NodeId );
                    var ToDataSetWriter_targets = GetChildNodesByReferenceTypeId( temporaryConnectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetWriter.NodeId );

                    if( !Assert.Equal( 0, ToDataSetReader_targets.length, "Step 2: Found unexpected ToDataSetReader references in created ConnectionEndpoint" ) ) TC_Variables.Result = false;
                    if( !Assert.Equal( 0, ToDataSetWriter_targets.length, "Step 2: Found unexpected ToDataSetWriter references in created ConnectionEndpoint" ) ) TC_Variables.Result = false;
                    
                    // Step 3: Read the value of the CommHealth Variable.
                    var HasConnectionEndpoint_targets = GetChildNodesByReferenceTypeId( CU_Variables.AllFunctionalEntities[fe].ConnectionEndpoints, CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId );
                    
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllFunctionalEntities[fe].ConnectionEndpoints.CommHealth } ) ) {
                        var commHealthValue = CU_Variables.AllFunctionalEntities[fe].ConnectionEndpoints.CommHealth.Value.Value.toUInt16();
                        if( !Assert.Equal( 1, ( commHealthValue & 1 ), "Step 3: CommInitial flag (Bit No. 0) is not set on CommHealth variable of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "'" ) ) TC_Variables.Result = false;
                        if( HasConnectionEndpoint_targets.length == 1 ) {
                            addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' has only one (created temporary) ConnectionEndpoint => Checking if CommPreOperational and CommError bits are not set in CommHealth variable" );
                            if( !Assert.Equal( 0, ( commHealthValue & 2 ), "Step 3: CommPreOperational flag (Bit No. 1) is set on CommHealth variable of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "'" ) ) TC_Variables.Result = false;
                            if( !Assert.Equal( 0, ( commHealthValue & 4 ), "Step 3: CommError flag (Bit No. 2) is not set on CommHealth variable of FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "'" ) ) TC_Variables.Result = false;
                        }
                    }
                    
                    // Close created temporary endpoint
                    if( !callCloseConnectionsMethod( {
                        AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                        ConnectionEndpoints: connectionEndpointId
                    } ).success ) TC_Variables.Result = false;
                    
                }   
            }
            else TC_Variables.Result = false;
            
            addLog( "=== End of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
        
        }
        if( TC_Variables.nothingTested ) addSkipped( "No FunctionalEntity found in AddressSpace that exposes the ConnectionEndpoints folder with CommHealth variable. Skipping test." );
        
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );