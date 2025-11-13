/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that EstablishConnections implementation creates a ConnectionEndpoint.
                  
    Requirements: - Dynamically created ConnectionEndpoints are supported
                  - Connection information is available
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Use any FunctionalEntity defined in the CTT configuration settings to create
                  the ConnectionEndpointConfigurations argument.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 3: Browse the related FunctionalEntity.
          Step 4: Call CloseConnections Method to remove the created ConnectionEndpoint.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Use any FunctionalEntity defined in the CTT configuration settings to create
    //         the ConnectionEndpointConfigurations argument.
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
    
    // Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
    //         All other command bits are not set.
    
    var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
        AutomationComponent: dynEP_PubSub1.AutomationComponent,
        FunctionalEntityNodeId: dynEP_PubSub1.NodeId,
        Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_001",
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
            
            // Step 3: Browse the related FunctionalEntity.
            var createdConnectionEndpoint = CheckHasReferenceToNodeId( { 
                SourceNode: connectionEndpointId,
                TargetNode: dynEP_PubSub1.ConnectionEndpoints.NodeId,
                ReferenceTypeId: CU_Variables.Test.HasComponent.HasConnectionEndpoint.NodeId,
                IsForward: false
            } );
            if( createdConnectionEndpoint ) {
                
                var assertConnectionEndpointValuesArgs = {
                    ConnectionEndpoint: connectionEndpointId,
                    InputVariableIds: dynEP_PubSub1.InputVariableIds,
                    OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
                    IsPersistent: dynEP_PubSub1.IsPersistent,
                    CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
                    RelatedEndpoint: dynEP_PubSub1.RelatedEndpoint
                }
                if( !AssertConnectionEndpointValues( assertConnectionEndpointValuesArgs ) ) TC_Variables.Result = false;
                
            }
            else {
                addError( "Step 3: The created ConnectionEndpoint is not present in FunctionalEntity '" + dynEP_PubSub1.NodeId + "'." );
                TC_Variables.Result = false;
            }
            
        }   
    }
    else TC_Variables.Result = false;
    
    // Step 4: Call CloseConnections Method to remove the created ConnectionEndpoint.
    if( !callCloseConnectionsMethod( {
        AutomationComponent: dynEP_PubSub1.AutomationComponent,
        ConnectionEndpoints: connectionEndpointId,
        AllowEmptyConnectionEndpoint: true,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
        SkipResultValidation: true
    } ).success ) TC_Variables.Result = false;
            
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );