/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections behavior when an element of InputVariableIds
                  or OutputVariableIds was not a Variable.
    Requirements: - Dynamically created ConnectionEndpoints are supported
                  - Skip either step 1 or step 4 in case only mode Publisher or Subscriber
                    is supported, respectivelly
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Use the Connection information of any dynamically created ConnectionEndpoint
                  to construct the ConnectionEndpointConfigurations argument. Provide the
                  NodeId of the AutomationComponent as InputVariableIds.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 3: Call CloseConnections Method to remove all created ConnectionEndpoints.
          Step 4: Repeat previous steps and provide the NodeId of the AutomationComponent
                  as OutputVariablesIds.
*/

function Test_Err_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 4: Repeat previous steps and provide the NodeId of the AutomationComponent
    //         as OutputVariablesIds.
    for( var test=0; test<2; test++ ) {
        
        // Step 1: Use the Connection information of any dynamically created ConnectionEndpoint
        //         to construct the ConnectionEndpointConfigurations argument. Provide the
        //         NodeId of the AutomationComponent as InputVariableIds.
        var dynEP_PubSub1 = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: CU_Variables.AllFunctionalEntities } );
    
        if( dynEP_PubSub1.length > 0 ) {
            dynEP_PubSub1 = dynEP_PubSub1[0];
        }
        else {
            addSkipped( "Could not find a FunctionalEntity with InputData/OutputData variables. Skipping test." );
            return( false );
        }
        
        if( isCommandBundleRequiredSet( dynEP_PubSub1.AutomationComponent ) ) {
            notImplemented( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + dynEP_PubSub1.AutomationComponent.NodeId + "'. Please execute this test manually." );
            return( false );
        }
            
        if( test == 0 ) {
            dynEP_PubSub1.InputVariableIds = new UaNodeIds();
            dynEP_PubSub1.InputVariableIds[0] = dynEP_PubSub1.AutomationComponent.NodeId;
        }
        else {
            dynEP_PubSub1.OutputVariableIds = new UaNodeIds();
            dynEP_PubSub1.OutputVariableIds[0] = dynEP_PubSub1.AutomationComponent.NodeId;
        }
        
        // Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
            AutomationComponent: dynEP_PubSub1.AutomationComponent,
            FunctionalEntityNodeId: dynEP_PubSub1.NodeId,
            Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-004",
            InputVariableIds: dynEP_PubSub1.InputVariableIds,
            OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
            IsPersistent: dynEP_PubSub1.IsPersistent,
            CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
            RelatedEndpointData: dynEP_PubSub1.RelatedEndpoint,
            OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
        } );
        
        // Get the ConnectionEndpointId
        var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
        
        if( callResult !== false && callResult.success ) {
            
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
     
        }
        else TC_Variables.Result = false;
        
        // Step 3: Call CloseConnections Method to remove all created ConnectionEndpoints.
        if( !callCloseConnectionsMethod( {
            AutomationComponent: dynEP_PubSub1.AutomationComponent,
            ConnectionEndpoints: connectionEndpointId,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
    
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_004 } );