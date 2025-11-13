/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Check that EstablishConnections implementation updates the IsPersistent
                  variable of a preconfigured ConnectionEndpoint. 
    Requirements: - SupportsPersistence of ComponentCapabilities is set TRUE 
                    (AC supports persistent ConnectionEndpoints)
                  - Preconfigured ConnectionEndpoints are supported
                  - If CommandBundledRequired is set this becomes a manual test
                    (requires more parameters to establish connections)
          Step 1: Use the Connection information related to a preconfigured ConnectionEndpoint
                  to construct the ConnectionEndpointConfigurations argument. Set IsPersistent
                  TRUE and CleanupTimeout to a negative value.
          Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
                  Omit other commands.
          Step 3: Read Attribute Value of variables IsPersisent and CleanupTimeout of the
                  created ConnectionEndpoint.
          Step 4: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Get a preconfigured ConnectionEndpoint
    if( CU_Variables.ConnectionEndpointType_Instances.length > 0 ) {
        
        for( var ce=0; ce<CU_Variables.ConnectionEndpointType_Instances.length; ce++ ) {
            
            // Step 1: Use the Connection information related to a preconfigured ConnectionEndpoint
            //         to construct the ConnectionEndpointConfigurations argument. Set IsPersistent
            //         TRUE and CleanupTimeout to a negative value.
            var preconfiguredCE = CU_Variables.ConnectionEndpointType_Instances[ce];
            var preconfiguredCEInfo = ReadConnectionEndpointData( preconfiguredCE );
            preconfiguredCEInfo.IsPersistent   = true;
            preconfiguredCEInfo.CleanupTimeout = -1;
            
            // Check if AC supports persistence
            if( !isSupportsPersistenceSet( preconfiguredCEInfo.ParentAutomationComponent ) ) {
                addLog( "AutomationComponent '" + preconfiguredCEInfo.ParentAutomationComponent.NodeId + "' does not support persistence. Skipping ConnectionEndpoint '" + CU_Variables.ConnectionEndpointType_Instances[ce].NodeId + "'." );
                continue;
            }
            
            if( isCommandBundleRequiredSet( preconfiguredCEInfo.ParentAutomationComponent ) ) {
                addLog( "Optional CommandBundleRequired is TRUE on AutomationComponent '" + preconfiguredCEInfo.ParentAutomationComponent.NodeId + "'. Skipping ConnectionEndpoint '" + CU_Variables.ConnectionEndpointType_Instances[ce].NodeId + "'." );
                continue;
            }
            
            TC_Variables.nothingTested = false;
            
            // Step 2: Call EstablishConnections Method with CreateConnectionEndpointCmd set.
            //         Omit other commands.
            var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                AutomationComponent: preconfiguredCEInfo.ParentAutomationComponent,
                FunctionalEntityNodeId: preconfiguredCEInfo.ParentFunctionalEntity.NodeId,
                Name: preconfiguredCEInfo.Name,
                InputVariableIds: preconfiguredCEInfo.InputVariables,
                OutputVariableIds: preconfiguredCEInfo.OutputVariables,
                IsPersistent: preconfiguredCEInfo.IsPersistent,
                CleanupTimeout: preconfiguredCEInfo.CleanupTimeout,
                RelatedEndpointData: preconfiguredCEInfo.RelatedEndpoint,
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ]
            } );
            
            var connectionEndpointId = ( isDefined( callResult.ConnectionEndpointConfigurationResults ) ) ? callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId : null;
            
            if( callResult !== false && callResult.success ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                if( TC_Variables.Result ) {
                    
                    // Step 3: Read Attribute Value of variables IsPersisent and CleanupTimeout of the
                    //         created ConnectionEndpoint.
                    refreshBaseVariablesModelMapByNodeId( preconfiguredCEInfo.ParentAutomationComponent.NodeId, CU_Variables.SessionThread );
                    
                    var TestFE = new MonitoredItem( preconfiguredCEInfo.ParentFunctionalEntity.NodeId );
                    SetAllChildren_recursive( TestFE );
                    
                    if( isDefined( TestFE.ConnectionEndpoints ) && isDefined( TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name] ) ) {
                        // Check IsPersistent
                        if( isDefined( TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].IsPersistent ) ) {
                            TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].IsPersistent.AttributeId = Attribute.Value;
                            if( ReadHelper.Execute( { NodesToRead: TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].IsPersistent } ) ) {
                                if( !Assert.Equal( true, TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].IsPersistent.Value.Value.toBoolean(), "Step 3: Received unexpected value for 'IsPersistent'" ) ) TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Step 3: 'IsPersistent' variable is not present in created ConnectionEndpoint '" + TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].NodeId + "'" );
                            TC_Variables.Result = false;
                        }
                        // Check CleanupTimeout
                        if( isDefined( TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].CleanupTimeout ) ) {
                            TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].CleanupTimeout.AttributeId = Attribute.Value;
                            if( ReadHelper.Execute( { NodesToRead: TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].CleanupTimeout } ) ) {
                                if( !Assert.LessThan( 0, TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].CleanupTimeout.Value.Value.toDouble(), "Step 3: Received unexpected value for 'CleanupTimeout'" ) ) TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Step 3: 'CleanupTimeout' variable is not present in created ConnectionEndpoint '" + TestFE.ConnectionEndpoints[preconfiguredCEInfo.Name].NodeId + "'" );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Step 3: The created ConnectionEndpoint is not present in FunctionalEntity '" + TestFE.NodeId + "'." );
                        TC_Variables.Result = false;
                    }
                    
                }   
            }
            else TC_Variables.Result = false;
            
            // Step 4: Call CloseConnections Method to remove all created ConnectionEndpoints.
            if( !callCloseConnectionsMethod( {
                AutomationComponent: preconfiguredCEInfo.ParentAutomationComponent,
                ConnectionEndpoints: connectionEndpointId,
                AllowEmptyConnectionEndpoint: true,
                ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                SkipResultValidation: true
            } ).success ) TC_Variables.Result = false;
            
        }
        
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the AutomationComponents/ConnectionEndpoints in the AddressSpace fit the requirements of this test. Skipping test." );
            TC_Variables.Result = false;
        }
                
    }
    else {
        addSkipped( "No preconfigured ConnectionEndpoints found in AddressSpace. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );