/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the RelatedEndpoint Structure specifies the path to the related
                 ConnectionEndpoint.
         Step 1: Establish a connection between the product and the CTT. 
         Step 2: Browse the RelatedEndpoint Structure of the ConnectionEndpoint and read
                 the values of the elements.
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
       
       for( var fe=0; fe<CU_Variables.AllFunctionalEntities.length; fe++ ) {
            
            addLog( "=== Start of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
            
            // Step 1: Establish a connection between the product and the CTT. 
            var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                FunctionalEntityNodeId: CU_Variables.AllFunctionalEntities[fe].NodeId,
                Name: "ConnectionEndpoint_Base_TC_007_dynamically_created_endpoint",
                OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.Uncertain ) ]
            } );
            
            if( callResult !== false && callResult.success ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].FunctionalEntityNodeResult, "Received unexpected StatusCode for FunctionalEntityNodeResult" ) ) TC_Variables.Result = false;
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) TC_Variables.Result = false;
                if( TC_Variables.Result ) {
                    
                    refreshBaseVariablesModelMapByNodeId( CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent.NodeId, CU_Variables.SessionThread );
                    
                    // Step 2: Browse the RelatedEndpoint Structure of the ConnectionEndpoint and 
                    //         read the values of the elements.
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    var relatedEndpoint = GetTargetNode( {
                        SourceNode: connectionEndpointId,
                        TargetNodeName: UaQualifiedName.New( {
                            Name: "RelatedEndpoint",
                            NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
                        } ),
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
                    } );
                    
                    if( isDefined( relatedEndpoint ) ) {
                        if( ReadHelper.Execute( { NodesToRead: relatedEndpoint } ) ) {
                            // Decode relatedEnpoint structure
                            var RelatedEndpointDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structure.RelatedEndpointDataType.NodeId );
                            var relatedEndpointValue = new UaGenericStructureValue( relatedEndpoint.Value.Value.toExtensionObject(), RelatedEndpointDataType );
                            if( isDefined( relatedEndpointValue ) ) {
                                // Check values match the value used to create the ConnectionEndpoint
                                if( !Assert.Equal( CTTRelatedEndpointData.Address, relatedEndpointValue.value(0), "Received unexpected value for Field 'Address' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) TC_Variables.Result = false;
                                if( Assert.Equal( CTTRelatedEndpointData.ConnectionEndpointPath.length, relatedEndpointValue.genericStructureArray(1).length(), "Received unexpected length for Field 'ConnectionEndpointPath' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) {
                                    for( var a=0; a<CTTRelatedEndpointData.ConnectionEndpointPath; a++ ) {
                                        if( !Assert.Equal( CTTRelatedEndpointData.ConnectionEndpointPath[a].NamespaceUri, UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(0), "Received unexpected value for Field 'NamespaceUri' of value attribute of node '" + relatedEndpoint.NodeId + "' on index " + a ) ) TC_Variables.Result = false;
                                        if( !Assert.Equal( CTTRelatedEndpointData.ConnectionEndpointPath[a].Name, UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(1), "Received unexpected value for Field 'Name' of value attribute of node '" + relatedEndpoint.NodeId + "' on index " + a ) ) TC_Variables.Result = false;
                                    }
                                } else TC_Variables.Result = false;
                                if( !Assert.Equal( CTTRelatedEndpointData.ConnectionEndpointName, relatedEndpointValue.value(2), "Received unexpected value for Field 'ConnectionEndpointName' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) TC_Variables.Result = false;
                            }
                            else {
                                addError( "Error decoding structure value of RelatedEndpoint '" + relatedEndpoint.NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                        }
                        else TC_Variables.Result = false;
                    }
                    else {
                        addError( "Could not find RelatedEndpoint component on node '" + connectionEndpointId + "'. Aborting test." );
                        TC_Variables.Result = false;
                    }
        
                    // Close created temporary endpoint
                    TC_Variables.Result = callCloseConnectionsMethod( {
                        AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
                        ConnectionEndpoints: connectionEndpointId
                    } ).success;
                    
                }   
            }
            else TC_Variables.Result = false;
            
            addLog( "=== End of test for FunctionalEntity '" + CU_Variables.AllFunctionalEntities[fe].NodeId + "' ===" );
        
       }
        
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );