/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections behavior when a persistent ConnectionEndpoint
                  is requested to be created for an AutomationComponent not supporting
                  persistence.
    Requirements: - SupportsPersistence is set FALSE
                    (AC does NOT support persistent ConnectionEndpoints)
                  - dynamically created ConnectionEndpoints are supported
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Use the Connection information related to any dynamically created ConnectionEndpoint
                  to construct the ConnectionEndpointConfigurations argument. Set parameter
                  IsPersistent TRUE.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 3: Call CloseConnections Method.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Use the Connection information related to any dynamically created ConnectionEndpoint
    //         to construct the ConnectionEndpointConfigurations argument. Set parameter
    //         IsPersistent TRUE.
    var dynEP_PubSub1 = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: CU_Variables.AllFunctionalEntities, SupportsPersistence: false } );
    
    if( dynEP_PubSub1.length > 0 ) {
        dynEP_PubSub1 = dynEP_PubSub1[0];
    }
    else {
        addSkipped( "Could not find a FunctionalEntity with InputData/OutputData variables of an AC with SupportsPersistence set to FALSE or not exposed. Skipping test." );
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
        Name: "AutomationComponent_ConnectionEstablishment_CreateConnectionEndpoint_Err-001",
        InputVariableIds: dynEP_PubSub1.InputVariableIds,
        OutputVariableIds: dynEP_PubSub1.OutputVariableIds,
        IsPersistent: true,
        CleanupTimeout: dynEP_PubSub1.CleanupTimeout,
        RelatedEndpointData: dynEP_PubSub1.RelatedEndpoint,
        UseAbstractConnectionEndpointTypeId: true,
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ]
    } );
    
    // Get the ConnectionEndpointId
    var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
    
    if( callResult !== false && callResult.success ) {
        
        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadNotSupported ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
 
    }
    else TC_Variables.Result = false;
    
    // Step 3: Call CloseConnections Method.
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

Test.Execute( { Procedure: Test_Err_001 } );