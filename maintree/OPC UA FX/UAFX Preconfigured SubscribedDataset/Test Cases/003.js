/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the behavior of CloseConnections if a connection is removed that
                 utilizes preconfigured SubscribedDataSets
         Step 1: Establish a single connection that utilizes preconfigured SubscribedDataSets
         Step 2: Call CloseConnections. Provide the ConnectionEndpoints created in the previous
                 step in the ConnectionEndpoints argument and set Remove to TRUE
         Step 3: Browse the ConnectionEndpoints Folder
         Step 4: Browse the SubscribedDataSets Folder
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    var TestFE = CU_Variables.FunctionalEntityWithPreconfiguredSDS;
    
    if( !isDefined( TestFE ) ) {
        addSkipped( "Did not find a FunctionalEntity with SubscriberCapabilities defining at least one preconfigured SubscribedDataSet. Skipping test." );
        return false;
    }
    
    // Step 1: Establish a single connection that utilizes preconfigured SubscribedDataSets
    addLog( "EstablishingConnection between CTT and FunctionalEntity '" + TestFE.NodeId + "'..." );
    UaOpcServer.restartServer( { SkipTestReconnect: true } );
    var callResult = EstablishConnectionsToCTT( { Settings: [ { FunctionalEntity: TestFE } ] } );
    
    if( callResult !== false && callResult.success ) {
        if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
            var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
            
            // Check if Data is received
            var receivedMessages = CollectNetworkMessageData( {
                SubscriberConfiguration: callResult.PubSubConfig_CTT,
                Timeout:                 5000,
                MaxNumberOfMessages:     1,
                SuppressMessages:        true
            } );
            
            if( receivedMessages.length > 0 ) {
                addLog( "Received message: " + receivedMessages[0].getRawNetworkMessageData() );
                // Step 2: Call CloseConnections. Provide the ConnectionEndpoints created in the previous
                //         step in the ConnectionEndpoints argument and set Remove to TRUE
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: TestFE.ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    Remove: true
                } ).success ) {
                    addError( "Step 2: Calling CloseConnections was not successful. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Step 3: Browse the ConnectionEndpoints Folder
                refreshBaseVariablesModelMapByNodeId( TestFE.NodeId, CU_Variables.SessionThread );
                
                if( NodeExistsInAddressSpace( connectionEndpointId ) ) {
                    addError( "Step 3: Created ConnectionEndpoint with NodeId '" + connectionEndpointId + "' is still present in the AddressSpace of the server" );
                    TC_Variables.Result = false;
                }
                
                // Step 4: Browse the SubscribedDataSets Folder
                var subscribedDataSetIsPresent = false;
                var subscribedDataSets = GetStandaloneSubscribedDataSetsFromSubscribedDataSetFolder( { SubscribedDataSetFolder: new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_SubscribedDataSets ) ) } );
                if( subscribedDataSets.length > 0 ) {
                    for( var sds=0; sds<subscribedDataSets.length; sds++ ) {
                        subscribedDataSets[sds].AttributeId = Attribute.BrowseName;
                        if( ReadHelper.Execute( { NodesToRead: subscribedDataSets[sds] } ) ) {
                            var subscribedDataSet_Name = subscribedDataSets[sds].Value.Value.toQualifiedName().Name;
                            if( subscribedDataSet_Name == CU_Variables.FunctionalEntityPreconfiguredSDS_Name ) {
                                subscribedDataSetIsPresent = true;
                                break;
                            }
                        }
                        else TC_Variables.Result = false;
                    }
                }
                if( !subscribedDataSetIsPresent ) {
                    addError( "Step 4: Could not find the preconfigured SubscribedDataSet belonging to the FunctionalEntity '" + TestFE.NodeId + "' (Name: '" + CU_Variables.FunctionalEntityPreconfiguredSDS_Name + "') in the PublishSubscribe.SubscribedDataSets folder of the server" );
                    TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 1: Did not receive any NetworkMessages within 5000 ms. Connection is not up and running." );
                TC_Variables.Result = false;
            }
            
        }
        else {
            addError( "Step 1: Call to EstablishConnections for FunctionalEntity '" + TestFE.NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
            TC_Variables.Result = false;
        }
        
        // Cleanup created connection endpoint and PubSubConfig
        if( !callCloseConnectionsMethod( {
            AutomationComponent: TestFE.ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointId,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
        UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
    }
    else {
        addError( "Step 1: Failed to establish the connection between the CTT and the FunctionalEntity '" + TestFE.NodeId + "'. Aborting test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );