/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections behavior when the requested parameters for a
                  subscriber don't match an existing preconfigured ConnectionEndpoint.
    Requirements: - Preconfigured ConnectionEndpoints are supported
                  - Mode Susbcriber or PublisherSubscriber supported
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Use the Connection information of any preconfigured ConnectionEndpoint to
                  construct the ConnectionEndpointConfigurations argument. Replace the
                  NodeIds of InputVariableIds by NodeIds from other variables exposed in
                  the InputData or OutputData folder of the related FunctionalEntity.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  All other command bits are not set.
          Step 3: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_Err_010() {
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
        
        // Step 1: Use the Connection information of any preconfigured ConnectionEndpoint to
        //         construct the ConnectionEndpointConfigurations argument. Replace the
        //         NodeIds of InputVariableIds by NodeIds from other variables exposed in
        //         the InputData or OutputData folder of the related FunctionalEntity
        var otherNodeFound = false;
        if( isDefined( preconfiguredCEInfo.ParentFunctionalEntity.InputData ) ) {
            var inputDataVariables = GetChildNodesByReferenceTypeId( preconfiguredCEInfo.ParentFunctionalEntity.InputData, new UaNodeId( Identifier.Organizes ), true );
            for( var n=0; n<inputDataVariables.length; n++ ) {
                if( !inputDataVariables[n].NodeId.equals( preconfiguredCEInfo.InputVariables[0] ) ) {
                    preconfiguredCEInfo.InputVariables[0] = inputDataVariables[n].NodeId;
                    otherNodeFound = true;
                    break;
                }
            }
        }
        if( !otherNodeFound ) {
            addSkipped( "Could not find any Node in InputData folder of FunctionalEntity '" + preconfiguredCEInfo.ParentFunctionalEntity.NodeId + "' to replace the first entry of InputVariables of ConnectionEndpoint '" + preconfiguredCEInfo.Name + "' with. Skipping test." );
            return( false );
        }
        
        // Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
        //         All other command bits are not set.
        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
            AutomationComponent: preconfiguredCEInfo.ParentAutomationComponent,
            FunctionalEntityNodeId: preconfiguredCEInfo.ParentFunctionalEntity.NodeId,
            Name: preconfiguredCEInfo.Name,
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
        
        // Step 3: Call CloseConnections Method to remove all created ConnectionEndpoints.
        if( !callCloseConnectionsMethod( {
            AutomationComponent: preconfiguredCEInfo.ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointId,
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

Test.Execute( { Procedure: Test_Err_010 } );