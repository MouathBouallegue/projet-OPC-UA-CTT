/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections behavior when a preconfigured ConnectionEndpoint
                  was not found.
    Requirements: - Preconfigured and dynamically created ConnectionEndpoints are supported
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Call EstablishConnections method to create a dynamically created ConnectionEndpoint.
          Step 2: Use the Connection information of any preconfigured ConnectionEndpoint to
                  construct the ConnectionEndpointConfigurations argument. Provide the
                  BrowseName of the ConnectionEndpoint created in the previous step as
                  ConnectionEndpoint. 
          Step 3: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 4: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_Err_011() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Get a preconfigured ConnectionEndpoint
    if( CU_Variables.ConnectionEndpointType_Instances.length > 0 ) {
        
        var preconfiguredCE = CU_Variables.ConnectionEndpointType_Instances[0];
        var preconfiguredCEInfo = ReadConnectionEndpointData( preconfiguredCE );
        
        if( isCommandBundleRequiredSet( preconfiguredCEInfo.ParentAutomationComponent ) ) {
            notImplemented( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + preconfiguredCEInfo.ParentAutomationComponent.NodeId + "'. Please execute this test manually." );
            return( false );
        }
        
        // Step 1: Call EstablishConnections method to create a dynamically created ConnectionEndpoint.
        var dynEP_PubSub1 = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: CU_Variables.AllFunctionalEntities } );
    
        if( dynEP_PubSub1.length > 0 ) {
            dynEP_PubSub1 = dynEP_PubSub1[0];
        }
        else {
            addSkipped( "Could not find a FunctionalEntity with InputData/OutputData variables. Skipping test." );
            return( false );
        }
        
        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
            AutomationComponent: dynEP_PubSub1.AutomationComponent,
            FunctionalEntityNodeId: dynEP_PubSub1.NodeId,
            Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-011",
            InputVariableIds: dynEP_PubSub1.InputVariableIds,
            OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
            IsPersistent: dynEP_PubSub1.IsPersistent,
            CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
            RelatedEndpointData: dynEP_PubSub1.RelatedEndpoint,
            OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
        } );
        
        // Get the ConnectionEndpointId
        var connectionEndpointId_dynamicEndpoint = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
        
        if( callResult !== false && callResult.success ) {
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
            if( TC_Variables.Result ) {
                
                refreshBaseVariablesModelMapByNodeId( dynEP_PubSub1.AutomationComponent.NodeId, CU_Variables.SessionThread );
                
            }   
        }
        else TC_Variables.Result = false;
        
        if( !isDefined( connectionEndpointId_dynamicEndpoint ) ) {
            addError( "Step 1: Failed to create a dynamic ConnectionEndpoint. Aborting test." );
            return( false );
        }
        
        
        // Step 2: Use the Connection information of any preconfigured ConnectionEndpoint to
        //         construct the ConnectionEndpointConfigurations argument. Provide the
        //         BrowseName of the ConnectionEndpoint created in the previous step as
        //         ConnectionEndpoint.
        // Step 3: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
            AutomationComponent: preconfiguredCEInfo.ParentAutomationComponent,
            FunctionalEntityNodeId: preconfiguredCEInfo.ParentFunctionalEntity.NodeId,
            Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-011",
            InputVariableIds: preconfiguredCEInfo.InputVariables,
            OutputVariableIds: preconfiguredCEInfo.OutputVariables,
            IsPersistent: preconfiguredCEInfo.IsPersistent,
            CleanupTimeout: preconfiguredCEInfo.CleanupTimeout,
            RelatedEndpointData: preconfiguredCEInfo.RelatedEndpoint,
            OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
        } );
        
        // Get the ConnectionEndpointId
        var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
        
        if( callResult !== false && callResult.success ) {
            
            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
            
        }
        else TC_Variables.Result = false;
        
        // Step 4: Call CloseConnections Method to remove all created ConnectionEndpoints.
        if( !callCloseConnectionsMethod( {
            AutomationComponent: dynEP_PubSub1.AutomationComponent,
            ConnectionEndpoints: connectionEndpointId_dynamicEndpoint,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
                
    }
    else {
        addSkipped( "No preconfigured ConnectionEndpoints found in AddressSpace. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_011 } );