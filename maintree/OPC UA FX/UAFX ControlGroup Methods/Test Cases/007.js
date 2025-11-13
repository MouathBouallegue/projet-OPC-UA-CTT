/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the EstablishControl Method for ListToBlock when Lock is assigned
                  to a PubSubConnectionEndpoint.
    Requirements: - An instance of PubSubConnectionEndpointType is available.
                  - PubSubConnectionEndpoint supports mode PublisherSubscriber or Subscriber.
                  - InputVariables are exposed in the ListToRestrict folder.
          Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                  PubSubConnectionEndpointType.
          Step 2: Ensure that the InputVariables cannot be modified by the connected FunctionalEntity
                  anymore.
          Step 3: Issue a Read Request to any variable in the ListToBlock.
          Step 4: Issue a Write Request to the same Variable read in Step 3.
          Step 5: Issue a Read Request to the variable from previous steps.
          Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {            
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            
            // Get InputVariables of the FunctionalEntity containing this ControlGroup
            var containingFE = GetContainingEntity( {
                ItemId: CU_Variables.ControlGroupType_Instances[i].NodeId,
                TypeNodeId: CU_Variables.Test.BaseObjectType.FunctionalEntityType.NodeId
            } );
            if( isDefined( containingFE ) ) {
                var inputVariables = [];
                SetAllChildren_recursive( containingFE );
                containingFE.ParentAutomationComponent = GetParentAutomationComponent( containingFE );
                SetAllChildren_recursive( containingFE.ParentAutomationComponent );
                
                if( isDefined( containingFE.InputData ) ) { 
                    inputVariables = GetInputDataVariables( { InputDataFolder: containingFE.InputData } );
                    if( inputVariables.length > 0 ) {
                        // check for InputData in the ListToBlock folder
                        var ListToBlock_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToBlock );
                        for( var j=0; j<inputVariables.length; j++ ) {
                            var containsVariable = false;
                            for( var k=0; k<ListToBlock_Children.length; k++ ) {
                                if( inputVariables[j].NodeId.equals( ListToBlock_Children[k].NodeId ) ) {
                                    containsVariable = true;
                                    break;
                                }
                            }
                            if( !containsVariable ) { inputVariables.splice( j, 1 ); j--; }
                        }
                        if( inputVariables.length == 0 ) {
                            addLog( "ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' contains none of the InputData variables of the containing FunctionalEntity. Skipping node." );
                            continue;
                        }
                    }
                    else {
                        addLog( "No InputData variables exposed in the FunctionalEntity containing ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping ControlGroup." );
                        continue;
                    }
                }
            }
            else {
                addLog( "Could not find the containing FunctionalEntity for ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping ControlGroup." );
                continue;
            }
            
            // Check if EstablishControl/ReleaseControl exist
            if( !isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ||
                !isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl )
            ) {
                addLog( "ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' does not expose EstablishControl/ReleaseControl methods. Skipping ControlGroup." );
                continue;
            }
            
            addLog( "Found ControlGroup with InputData variables in ListToBlock exposing EstablishControl/ReleaseControl. Using FunctionalEntity '" + containingFE.NodeId + "' and ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' for this test." );
            UaOpcServer.restartServer( { SkipTestReconnect: true } );
    
            // Establish a connection to the FunctionalEntity to get a PubSubConnectionEndpoint
            // and connect to embedded server to provoke data changes to modify the InputData (Read/Write needed)
            var doDisconnect = false;
            if( !isDefined( UaOpcServer.Session ) ) {
                UaOpcServer.Connect();
                doDisconnect = true;
            }
            var tempReadHelper = new ReadService( { Session: UaOpcServer.Session } );
            var tempWriteHelper = new WriteService( { Session: UaOpcServer.Session } );
            
            addLog( "EstablishingConnection between CTT and FunctionalEntity '" + containingFE.NodeId + "'..." );
            var callResult = EstablishConnectionsToCTT( {
                Settings: [ {
                    FunctionalEntity: containingFE,
                    Mode: PubSubConnectionEndpointModeEnum.Subscriber
                } ]
            } );
            
            if( callResult !== false && callResult.success ) {
                if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    var publishingInterval = callResult.PubSubConfig_CTT.Connections[0].WriterGroups[0].PublishingInterval;
                    TC_Variables.nothingTested = false;
                    
                    // Check if InputData is changing
                    if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                        var valueBefore = UaVariantToSimpleType( inputVariables[0].Value.Value );
                        
                        // Change values in the OutputData folder in the CTT Server
                        for( var l=0; l<inputVariables.length; l++ ) {
                            var tempOutputVariable_CTT_Server_mI = new MonitoredItem( inputVariables[l].NodeId.clone() );
                            tempOutputVariable_CTT_Server_mI.NodeId.NamespaceIndex = CTT_NamespaceIndex;
                            tempReadHelper.Execute( { NodesToRead: tempOutputVariable_CTT_Server_mI } );
                            UaVariant.Increment( { Value: tempOutputVariable_CTT_Server_mI.Value.Value } );
                            tempWriteHelper.Execute( { NodesToWrite: tempOutputVariable_CTT_Server_mI } );
                        }
                        
                        // Wait for the duration of one PublishingInterval for the InputData to update
                        UaDateTime.CountDown( { Msecs: publishingInterval } );
                        
                        if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                            var valueAfter = UaVariantToSimpleType( inputVariables[0].Value.Value );
                            if( Assert.NotEqual( valueBefore, valueAfter, "Step 1: InputData variable '" + inputVariables[0].NodeId + "' of FunctionalEntity '" + containingFE.NodeId + "' did not change after one PublishingInterval." ) ) {
                                
                                // Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                                //         PubSubConnectionEndpointType
                                var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], connectionEndpointId );
                                if( callResult.success ) {
                                    // LockStatus shall be 0(OK)
                                    if( !Assert.Equal( 0, callResult.LockStatus, "Step 1: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                                    // IsControlled flag shall be TRUE
                                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                                        if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Step 1: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                                    }
                                    // Step 2: Ensure that the InputVariables cannot be modified by the connected FunctionalEntity
                                    //         anymore
                                    if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                                        var valueBefore = UaVariantToSimpleType( inputVariables[0].Value.Value );
                                        
                                        // Change values in the OutputData folder in the CTT Server
                                        for( var l=0; l<inputVariables.length; l++ ) {
                                            var tempOutputVariable_CTT_Server_mI = new MonitoredItem( inputVariables[l].NodeId.clone() );
                                            tempOutputVariable_CTT_Server_mI.NodeId.NamespaceIndex = CTT_NamespaceIndex;
                                            tempReadHelper.Execute( { NodesToRead: tempOutputVariable_CTT_Server_mI } );
                                            UaVariant.Increment( { Value: tempOutputVariable_CTT_Server_mI.Value.Value } );
                                            tempWriteHelper.Execute( { NodesToWrite: tempOutputVariable_CTT_Server_mI } );
                                        }
                                        
                                        // Wait for the duration of one PublishingInterval for the InputData to update
                                        UaDateTime.CountDown( { Msecs: publishingInterval } );
                                        
                                        if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                                            var valueAfter = UaVariantToSimpleType( inputVariables[0].Value.Value );
                                            if( !Assert.Equal( valueBefore, valueAfter, "Step 2: InputData variable '" + inputVariables[0].NodeId + "' of FunctionalEntity '" + containingFE.NodeId + "' unexpectedly changed after one PublishingInterval, after calling EstablishControl." ) ) TC_Variables.Result = false;
                                            // Step 3: Issue a Read Request to any variable in the ListToBlock.
                                            if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                                                // Step 4: Issue a Write Request to the same Variable read in Step 3.
                                                var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
                                                inputVariables[0].OriginalValue = inputVariables[0].Value.clone();
                                                UaVariant.Increment( { Value: inputVariables[0].Value } );
                                                if( WriteHelper.Execute( { NodesToWrite: inputVariables[0], OperationResults: expectedResults } ) ) {
                                                    // Step 5: Issue a Read Request to the variable from previous steps.
                                                    if( ReadHelper.Execute( { NodesToRead: inputVariables[0] } ) ) {
                                                        if( !Assert.Equal( inputVariables[0].Value.Value, inputVariables[0].OriginalValue.Value, "Step 5: Value of variable '" + inputVariables[0].NodeId + "' unexpectedly changed after Write." ) ) {
                                                            // revert the value if it changed
                                                            inputVariables[0].Value = inputVariables[0].OriginalValue.clone();
                                                            if( !WriteHelper.Execute( { NodesToWrite: inputVariables[0] } ) ) TC_Variables.Result = false;
                                                            TC_Variables.Result = false;
                                                        }
                                                    }
                                                    else TC_Variables.Result = false;
                                                }
                                                else TC_Variables.Result = false;
                                            }
                                            else TC_Variables.Result = false;
                                            
                                            // Step 6: Call ReleaseControl to cleanup the lock.
                                            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                                                if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                                    addError( "Step 6: Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                                    TC_Variables.Result = false;
                                                }
                                            }
                                            
                                        }
                                        else TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                }
                                else {
                                    addError( "Step 1: Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                    TC_Variables.Result = false;
                                }
                            }
                            else TC_Variables.Result = false;
                        }
                        else TC_Variables.Result = false;
                    }
                    else TC_Variables.Result = false;
                }
                else {
                    addError( "Call to EstablishConnections for FunctionalEntity '" + containingFE.NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Cleanup created connection endpoint and PubSubConfig
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: containingFE.ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    AllowEmptyConnectionEndpoint: true,
                    ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                    OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                    SkipResultValidation: true
                } ).success ) TC_Variables.Result = false;
                UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
            }
            else {
                addError( "Failed to establish a connection between the CTT and the FunctionalEntity '" + containingFE.NodeId + "'. Aborting test." );
                TC_Variables.Result = false;
            }
            
            delete tempReadHelper;
            delete tempWriteHelper;
            if( doDisconnect ) UaOpcServer.Disconnect();
            
            if( !TC_Variables.Result || !TC_Variables.nothingTested ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "Could not find a ControlGroup in the AddressSpace exposing EstablishControl/ReleaseControl and/or InputData variables of its containing FunctionalEntity. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );