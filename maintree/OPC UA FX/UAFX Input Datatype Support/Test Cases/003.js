/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Establish a connection utilizing variables of datatypes: Boolean, Sbyte,
                 Int16, UInt16, Int32, UInt32 and Float as input data
         Step 1: Establish one ore more connections to the product
         Step 2: Review the received values
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.AlreadyCheckedFEs = [];
    
    if( typeof( Test_002 ) !== 'undefined' ) {
        // Print missing DataTypes
        for( var n=0; n<CU_Variables.InputNodeOfTypeExists.length; n++ ) {
            if( !CU_Variables.InputNodeOfTypeExists[n] ) {
                addWarning( "Skipping DataType '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' as no InputData variable of this type was found in TC 002 before" );
                continue;
            }
            
            if( ArrayContains( TC_Variables.AlreadyCheckedFEs, CU_Variables.InputNodeOfType_FE[n].NodeId.toString() ) ) continue;
            
            // Step 1: Establish one or more connections to the product
            UaOpcServer.restartServer( { SkipTestReconnect: true } );
            
            // Connect to embedded server (Read/Write needed)
            var doDisconnect = false;
            if( !isDefined( UaOpcServer.Session ) ) {
                UaOpcServer.Connect();
                doDisconnect = true;
            }
            var tempReadHelper = new ReadService( { Session: UaOpcServer.Session } );
            var tempWriteHelper = new WriteService( { Session: UaOpcServer.Session } );
            
            // Establish Connection
            addLog( "EstablishingConnection between CTT and FunctionalEntity '" + CU_Variables.InputNodeOfType_FE[n].NodeId + "'..." );
            TC_Variables.AlreadyCheckedFEs.push( CU_Variables.InputNodeOfType_FE[n].NodeId.toString() );
            
            var callResult = EstablishConnectionsToCTT( {
                Settings: [ {
                    FunctionalEntity: CU_Variables.InputNodeOfType_FE[n],
                    Mode: PubSubConnectionEndpointModeEnum.Subscriber
                } ]
            } );
            
            if( callResult !== false && callResult.success ) {
                if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && isDefined( callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId ) ) {
                    var connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                    
                    var publishingInterval = callResult.PubSubConfig_CTT.Connections[0].WriterGroups[0].PublishingInterval;
                                        
                    // Check if InputData is changing for every InputData variable found by TC 002
                    var inputDataVariables = GetInputDataVariables( { InputDataFolder: CU_Variables.InputNodeOfType_FE[n].InputData } );
                    
                    for( var iDV=0; iDV<inputDataVariables.length; iDV++ ) {
                        if( ArrayContains( CU_Variables.InputNodeOfTypeFoundNode, inputDataVariables[iDV].NodeId ) ) {
                            if( ReadHelper.Execute( { NodesToRead: inputDataVariables[iDV] } ) ) {
                                var valueBefore = UaVariantToSimpleType( inputDataVariables[iDV].Value.Value );
                                
                                // Change value in the OutputData folder in the CTT Server
                                var tempOutputVariable_CTT_Server_mI = new MonitoredItem( inputDataVariables[iDV].NodeId.clone() );
                                tempOutputVariable_CTT_Server_mI.NodeId.NamespaceIndex = CTT_NamespaceIndex;
                                tempReadHelper.Execute( { NodesToRead: tempOutputVariable_CTT_Server_mI } );
                                UaVariant.Increment( { Value: tempOutputVariable_CTT_Server_mI.Value.Value } );
                                tempWriteHelper.Execute( { NodesToWrite: tempOutputVariable_CTT_Server_mI } );
                                
                                // Wait for the duration of two PublishingIntervals for the InputData to update
                                UaDateTime.CountDown( { Msecs: publishingInterval * 2 } );
                                
                                // Step 2: Review the received values
                                if( ReadHelper.Execute( { NodesToRead: inputDataVariables[iDV] } ) ) {
                                    var valueAfter = UaVariantToSimpleType( inputDataVariables[iDV].Value.Value );
                                    if( !Assert.NotEqual( valueBefore, valueAfter, "Step 2: InputData variable '" + inputDataVariables[iDV].NodeId + "' (Type: " + Identifier.toString( new UaNodeId( inputDataVariables[iDV].Value.Value.DataType ) ) + ") of FunctionalEntity '" + CU_Variables.InputNodeOfType_FE[n].NodeId + "' did not change after waiting for two PublishingIntervals." ) ) TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                            }
                            else TC_Variables.Result = false;
                        }
                    }
                    
                }
                else {
                    addError( "Step 1: Call to EstablishConnections for FunctionalEntity '" + CU_Variables.InputNodeOfType_FE[n].NodeId + "' did not return a ConnectionEndpointId in the ConnectionEndpointConfigurationResults[0] output argument. Aborting test." );
                    TC_Variables.Result = false;
                }
                
                // Cleanup created connection endpoint and PubSubConfig
                if( !callCloseConnectionsMethod( {
                    AutomationComponent: CU_Variables.InputNodeOfType_FE[n].ParentAutomationComponent,
                    ConnectionEndpoints: connectionEndpointId,
                    AllowEmptyConnectionEndpoint: true,
                    ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
                    OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
                    SkipResultValidation: true
                } ).success ) TC_Variables.Result = false;
                UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );
            }
            else {
                addError( "Step 1: Failed to establish the connection between the CTT and the FunctionalEntity '" + CU_Variables.InputNodeOfType_FE[n].NodeId + "'. Aborting test." );
                TC_Variables.Result = false;
            }
            
            delete tempWriteHelper;
            delete tempReadHelper;
            if( doDisconnect ) UaOpcServer.Disconnect();
            
            if( !TC_Variables.Result ) break;
            
        }
    }
    else {
        addSkipped( "UAFX Input Datatype Support TC 002 must be selected for this test to run. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );