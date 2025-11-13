/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections behavior when the BrowseName of the ConnectionEndpoint
                  was not unique in the ConnectionEndpoints folder.
    Requirements: - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
                  - dynamically created ConnectionEndpoints supported
          Step 1: Use the Connection information of any dynamically created ConnectionEndpoint
                  to construct the ConnectionEndpointConfigurations argument.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 3: Use the Connection information of a different ConnectionEndpoint as in Step
                  1 to construct the ConnectionEndpointConfigurations. Set the BrowseName
                  from the ConnectionEndpoint from Step 1.
          Step 4: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 5: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_Err_012() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Use the Connection information of any dynamically created ConnectionEndpoint
    //         to construct the ConnectionEndpointConfigurations argument.
    var dynEP_PubSub = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: CU_Variables.AllFunctionalEntities } );
    
    if( dynEP_PubSub.length > 1 ) {
        dynEP_PubSub1 = dynEP_PubSub[0];
        dynEP_PubSub2 = dynEP_PubSub[1];
    }
    else {
        addSkipped( "Could not find at least two FunctionalEntities with InputData/OutputData variables. Skipping test." );
        return( false );
    }
    
    if( isCommandBundleRequiredSet( dynEP_PubSub1.AutomationComponent ) ) {
        notImplemented( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + dynEP_PubSub1.AutomationComponent.NodeId + "'. Please execute this test manually." );
        return( false );
    }
    
    // Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
    //         All other command bits are not set.
    var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
        AutomationComponent: dynEP_PubSub1.AutomationComponent,
        FunctionalEntityNodeId: dynEP_PubSub1.NodeId,
        Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-012",
        InputVariableIds: dynEP_PubSub1.InputVariableIds,
        OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
        IsPersistent: dynEP_PubSub1.IsPersistent,
        CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
        RelatedEndpointData: dynEP_PubSub1.RelatedEndpoint,
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
    } );
    
    // Get the ConnectionEndpointId
    var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
    
    if( callResult !== false && callResult.success ) {
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
        if( TC_Variables.Result ) {
            
            refreshBaseVariablesModelMapByNodeId( dynEP_PubSub1.AutomationComponent.NodeId, CU_Variables.SessionThread );
            
            // Step 3: Use the Connection information of a different ConnectionEndpoint as in Step 1
            //         to construct the ConnectionEndpointConfigurations. Set the BrowseName
            //         from the ConnectionEndpoint from Step 1.
            // Step 4: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
            //         All other command bits are not set.
            var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                AutomationComponent: dynEP_PubSub2.AutomationComponent,
                FunctionalEntityNodeId: dynEP_PubSub2.NodeId,
                Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-012",
                InputVariableIds: dynEP_PubSub2.InputVariableIds,
                OutputVariableIds: dynEP_PubSub2.OutputVariableIds,
                IsPersistent: dynEP_PubSub2.IsPersistent,
                CleanupTimeout: dynEP_PubSub2.CleanupTimeout,
                RelatedEndpointData: dynEP_PubSub2.RelatedEndpoint,
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
            } );
            
            // Get the ConnectionEndpointId for cleanup if the ConnectionEndpoint is created unexpectedly
            var connectionEndpointId2 = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
            
            if( callResult !== false && callResult.success ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBrowseNameDuplicated ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
            }
            else TC_Variables.Result = false;
            
        }   
    }
    else TC_Variables.Result = false;
    
    // Step 5: Call CloseConnections Method to remove all created ConnectionEndpoints.
    if( !callCloseConnectionsMethod( {
        AutomationComponent: dynEP_PubSub1.AutomationComponent,
        ConnectionEndpoints: connectionEndpointId,
        AllowEmptyConnectionEndpoint: true,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
        SkipResultValidation: true
    } ).success ) TC_Variables.Result = false;
    
    if( !callCloseConnectionsMethod( {
        AutomationComponent: dynEP_PubSub2.AutomationComponent,
        ConnectionEndpoints: connectionEndpointId2,
        AllowEmptyConnectionEndpoint: true,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
        SkipResultValidation: true
    } ).success ) TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_012 } );