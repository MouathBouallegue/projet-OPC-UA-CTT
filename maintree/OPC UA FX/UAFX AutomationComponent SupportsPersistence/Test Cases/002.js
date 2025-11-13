/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check if a persistent ConnectionEndpoint can be created.
         Step 1: Create a persistent ConnectionEndpoint by calling the EstablishConnections
                 method. Set IsPersistent TRUE in the ConnectionEndpointsConfigurations
                 argument
         Step 2: Read the IsPersistent variable of the ConnectionEndpoint created in Step 1
         Step 3: Read the CleanupTimeout variable of the ConnectionEndpoint created in Step 1
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( isDefined( CU_Variables.Test.AutomationComponents ) && CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            // Check if AC supports persistence
            if( isSupportsPersistenceSet( CU_Variables.Test.AutomationComponents[ac] ) ) {
                // Check if AC exposes a FunctionalEntity
                if( isDefined( CU_Variables.Test.AutomationComponents[ac].FunctionalEntities ) &&
                    isDefined( CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities ) &&
                    CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities.length > 0 ) 
                {
                    TC_Variables.nothingTested = false;
                    var TestFE = CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities[0];
                    
                    // Step 1: Create a persistent ConnectionEndpoint by calling the EstablishConnections
                    //         method. Set IsPersistent TRUE in the ConnectionEndpointsConfigurations argument
                    var endpointSettings = GetDynamicConnectionEndpointsSettings( { FunctionalEntities: TestFE } );
                    if( endpointSettings.length > 0 ) {
                        endpointSettings = endpointSettings[0];
                        
                        // Create the ConnectionEndpoint with IsPersistent = TRUE
                        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                            AutomationComponent: endpointSettings.AutomationComponent,
                            FunctionalEntityNodeId: TestFE.NodeId,
                            Name: "AutomationComponent_SupportsPersistence_002",
                            InputVariableIds: endpointSettings.InputVariableIds,
                            OutputVariableIds: endpointSettings.OutputVariableIds,
                            IsPersistent: true
                        } );
                        
                        // Get the ConnectionEndpointId for the cleanup
                        var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
                        
                        if( callResult !== false && callResult.success ) {
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Step 1: Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                            if( TC_Variables.Result ) {
                                
                                refreshBaseVariablesModelMapByNodeId( endpointSettings.AutomationComponent.NodeId, CU_Variables.SessionThread );
                                
                                SetAllChildren_recursive( TestFE );
                                if( isDefined( TestFE.ConnectionEndpoints ) && isDefined( TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002 ) ) {
                                    // Step 2: Read the IsPersistent variable of the ConnectionEndpoint created in Step 1
                                    if( isDefined( TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.IsPersistent ) ) {
                                        TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.IsPersistent.AttributeId = Attribute.Value;
                                        if( ReadHelper.Execute( { NodesToRead: TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.IsPersistent } ) ) {
                                            if( !Assert.Equal( true, TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.IsPersistent.Value.Value.toBoolean(), "Step 2: Received unexpected value for 'IsPersistent'" ) ) TC_Variables.Result = false;
                                        }
                                    }
                                    else {
                                        addError( "Step 2: 'IsPersistent' variable is not present in created ConnectionEndpoint '" + TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.NodeId + "'" );
                                        TC_Variables.Result = false;
                                    }
                                    // Step 3: Read the CleanupTimeout variable of the ConnectionEndpoint created in Step 1
                                    if( isDefined( TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.CleanupTimeout ) ) {
                                        TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.CleanupTimeout.AttributeId = Attribute.Value;
                                        if( ReadHelper.Execute( { NodesToRead: TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.CleanupTimeout } ) ) {
                                            if( !Assert.LessThan( 0, TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.CleanupTimeout.Value.Value.toDouble(), "Step 3: Received unexpected value for 'CleanupTimeout'" ) ) TC_Variables.Result = false;
                                        }
                                    }
                                    else {
                                        addError( "Step 3: 'CleanupTimeout' variable is not present in created ConnectionEndpoint '" + TestFE.ConnectionEndpoints.AutomationComponent_SupportsPersistence_002.NodeId + "'" );
                                        TC_Variables.Result = false;
                                    }
                                }
                                else {
                                    addError( "Step 2: The created ConnectionEndpoint is not present in FunctionalEntity '" + TestFE.NodeId + "'." );
                                    TC_Variables.Result = false;
                                }
                                
                            }   
                        }
                        else {
                            addError( "Step 1: Creating the ConnectionEndpoint was not successful for FunctionalEntity '" + TestFE.NodeId + "'." );
                            TC_Variables.Result = false;
                        }
                        
                        // Call CloseConnections Method to cleanup the created ConnectionEndpoint
                        if( !callCloseConnectionsMethod( {
                            AutomationComponent: endpointSettings.AutomationComponent,
                            ConnectionEndpoints: connectionEndpointId,
                            AllowEmptyConnectionEndpoint: true,
                            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                            SkipResultValidation: true
                        } ).success ) TC_Variables.Result = false;
                    
                    }
                    else {
                        addError( "Failed to create dynamic ConnectionEndpoint settings from the data exposed by FunctionalEntity '" + TestFE.NodeId + "'." );
                        TC_Variables.Result = false;
                    }
                }
                else addLog( "AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' does not expose any FunctionalEntities. Skipping AC." );
            }
            else addLog( "AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' does not support persistence. Skipping AC." );
            
            addLog( "=== End of test for AC '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the AutomationComponents in the AddressSpace support persistence. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'AutomationComponentType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );