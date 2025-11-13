/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify the behavior of the EstablishConnections method if a verification
                  variable was provided that is not supported.
    Requirements: Skip if all optional verification variables are supported.
          Step 1: Browse any Asset in Asset folder.
          Step 2: Read all supported verification variables for VerificationMode AssetCompatibility.
          Step 3: Identify any unsupported optional verification variable. Use the variable
                  values to construct the AssetVerifications argument. Set VerificationMode
                  to AssetCompatibility.
          Step 4: Use the connection information of any dynamically created or preconfigured
                  ConnectionEndpoint to construct the ConnectionEndpointConfigurations
                  argument. 
          Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd
                  and CreateConnectionEndpointCmd. Provide at least one not supported (Asset)
                  verification variable. All other command bits are not set. 
          Step 6: Call CloseConnections Method to remove all created ConnectionEndpoints.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    var assetCompatibilityOptionalVariables = [ 
        UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "BuildAssetNumber" } ),
        UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubBuildAssetNumber" } ),
        UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "HardwareRevision" } ),
        UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "SoftwareRevision" } )
    ];
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported verification variables for VerificationMode AssetCompatibility.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Identify any unsupported optional verification variable. Use the variable
        //         values to construct the AssetVerifications argument. Set VerificationMode
        //         to AssetCompatibility.
        var optionalUnsupportedVariableFound = false;
        for( var o=0; o<assetCompatibilityOptionalVariables.length; o++ ) {
            for( var e=0; e<TC_Variables.ExpectedVerificationVariables.result.length; e++ ) {
                if( TC_Variables.ExpectedVerificationVariables.result[e].Key.Name == assetCompatibilityOptionalVariables[o].Name ) break;
                if( e == TC_Variables.ExpectedVerificationVariables.result.length - 1 ) {
                    // Optional unsupported verification variable found
                    unsupportedVerificationVariable = new UaKeyValuePair();
                     unsupportedVerificationVariable.Key = assetCompatibilityOptionalVariables[o];
                     unsupportedVerificationVariable.Value = new UaVariant();
                    TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length] = unsupportedVerificationVariable;
                    optionalUnsupportedVariableFound = true;
                    break;
                }
            }
            if( optionalUnsupportedVariableFound ) break;
        }
        if( !optionalUnsupportedVariableFound ) {
            addSkipped( "Step 3: Could not identify any optional unsupported verification variable in Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "'. Skipping Asset." );
            continue;
        }
        
        // Step 4: Use the connection information of any dynamically created or preconfigured
        //         ConnectionEndpoint to construct the ConnectionEndpointConfigurations
        //         argument. 
        // Step 5: Call EstablishConnections method with the CommandMask set to VerifyAssetCmd
        //         and CreateConnectionEndpointCmd. Provide at least one not supported (Asset)
        //         verification variable. All other command bits are not set. 
        if( CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent.FunctionalEntities.AllTopLevelFunctionalEntities.length == 0 ) {
            addSkipped( "Parent AutomationComponent of tested Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' has no FunctionalEntity to create a ConnectionEndpoint in. Skipping Asset." );
            continue;
        }
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            FunctionalEntityNodeId: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent.FunctionalEntities.AllTopLevelFunctionalEntities[0].NodeId,
            Name: "AutomationComponent_ConnectionEstablishment_VerifyAsset_Err-001",
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            CallCreateConnectionEndpointCmd: true,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        
        // Get the ConnectionEndpointId
        var connectionEndpointId = null;
        if( isDefined( callResult.ConnectionEndpointConfigurationResults ) && callResult.ConnectionEndpointConfigurationResults.length > 0 ){
            connectionEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
        }
    
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus reports Uncertain.
                 - VerificationResult equals NotSet.
                 - The VerificationVariablesErrors array reports 'Good' or 'Bad_BrowseNameInvalid' for the modified verification variable. 
                 - VerificationAdditionalVariablesErrors arrays is not populated.
                 - ConnectionEndpointResults reports Bad_NothingToDo. 
                 */
                var vVariablesErrors = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                 
                if( !Assert.StatusCodeIs( TC_Variables.ExpectedVerificationStatus, callResult.AssetVerificationResults[0].VerificationStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, callResult.AssetVerificationResults[0].VerificationResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    for( var e=0; e<vVariablesErrors.length; e++ ) {
                        
                        if( e < vVariablesErrors.length - 1 ) {
                            // StatusCode for the ExpectedVerificationVariables prior to the unsupported one shall be Good
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (prior to unsupported one)" ) ) TC_Variables.result = false;
                        }
                        else {
                            // StatusCode for the unsupported ExpectedVerificationVariable shall be Bad_BrowseNameInvalid
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Bad_BrowseNameInvalid ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (unsupported one)" ) ) TC_Variables.result = false;
                        }
                    }
                    
                }
                else TC_Variables.result = false;
                
                if( !Assert.Equal( 0, callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
            }
            else {
                addError( "Returned AssetVerificationResults OutputArgument is empty." );
                TC_Variables.result = false;
            }
        }
        else TC_Variables.result = false;
        
        // Step 6: Call CloseConnections Method to remove all created ConnectionEndpoints.
        if( !callCloseConnectionsMethod( {
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            ConnectionEndpoints: connectionEndpointId,
            AllowEmptyConnectionEndpoint: true,
            ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain ] ),
            OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.Uncertain, StatusCode.BadNodeIdInvalid, StatusCode.BadNodeIdUnknown ] ) ],
            SkipResultValidation: true
        } ).success ) TC_Variables.Result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_Err_001 } );