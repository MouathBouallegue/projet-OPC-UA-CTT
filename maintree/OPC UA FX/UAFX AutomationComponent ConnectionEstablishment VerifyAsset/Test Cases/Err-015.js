/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify EstablishConnections Method behavior when a BrowseName for an unsupported
                  verification variable of VerificationMode AssetCompatibility is provided.
    Requirements: Not all optional ExpectedVerificationVariables are supported.
          Step 1: Browse any Asset in the Asset folder.
          Step 2: Read all supported ExpectedVerificationVariables for VerificationMode AssetCompatibility.
          Step 3: Select an unsupported ExpectedVerificationVariable and assign a random value.
                  Use the supported verification variables and the unsupported verification
                  variable to construct the AssetVerifications argument. Set VerificationMode
                  to AssetCompatibility.
          Step 4: Call the EstablishConnections method with the CommandMask set to VerifyAssetCmd.
                  All other command bits are not set. 
*/

function Test_Err_015() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    var optionalVerificationVariables = [ "BuildAssetNumber", "SubBuildAssetNumber", "HardwareRevision", "SoftwareRevision" ];
    
    TC_Variables.ExpectedVerificationStatus = new ExpectedAndAcceptedResults( StatusCode.Uncertain );
    TC_Variables.ExpectedVerificationResult = AssetVerificationResult.NotSet;
    TC_Variables.VerificationMode = AssetVerificationMode.AssetCompatibility;
    TC_Variables.ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    TC_Variables.ExpectedOperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Uncertain ) ];
    
    // Step 1: Browse any Asset in the Asset folder.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
        
        // Step 2: Read all supported ExpectedVerificationVariables for VerificationMode AssetCompatibility.
        TC_Variables.ExpectedVerificationVariables = readSupportedExpectedVerificationVariables( { Asset: CU_Variables.AllTopLevelAssets[i], VerificationMode: TC_Variables.VerificationMode } );
        if( TC_Variables.ExpectedVerificationVariables.variablesMissing ) {
            addError( "Could not complete test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "', as one or more mandatory variables are missing for VerificationMode '" + AssetVerificationMode_Names[TC_Variables.VerificationMode] + "'." );
            TC_Variables.result = false;
            continue;
        }
        
        // Step 3: Select an unsupported ExpectedVerificationVariable and assign a random value.
        //         Use the supported verification variables and the unsupported verification
        //         variable to construct the AssetVerifications argument. Set VerificationMode
        //         to AssetCompatibility.
        for( var o=0; o<optionalVerificationVariables.length; o++ ) {
            var variableUnsupported = true;
            for( var p=0; p<TC_Variables.ExpectedVerificationVariables.result.length; p++ ) {
                if( optionalVerificationVariables[o] == TC_Variables.ExpectedVerificationVariables.result[p].Key.Name ) {
                    variableUnsupported = false;
                    break;
                }
            }
            if( variableUnsupported ) {
                var unsupportedVariable = new UaKeyValuePair();
                unsupportedVariable.Key = UaQualifiedName.New( { 
                    NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, 
                    Name: optionalVerificationVariables[o]
                } );
                unsupportedVariable.Value = new UaVariant();
                unsupportedVariable.Value.setInt32( Math.random() * 100 );
                break;
            }
        }
        if( isDefined( unsupportedVariable ) ) {
            TC_Variables.ExpectedVerificationVariables.result[TC_Variables.ExpectedVerificationVariables.result.length] = unsupportedVariable;
        }
        else {
            addSkipped( "Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is supporting all optional ExpectedVerificationVariables of AssetCompatibility. Skipping Asset." );
            TC_Variables.result = false;
            continue;
        }
                
        
        // Step 4: Call the EstablishConnections method with the CommandMask set to VerifyAssetCmd.
        //         All other command bits are not set. 
        var callResult = callEstablishConnectionsMethod_VerifyAssetCmd( { 
            AutomationComponent: CU_Variables.AllTopLevelAssets[i].ParentAutomationComponent,
            AssetNodeId: CU_Variables.AllTopLevelAssets[i].NodeId,
            VerificationMode: TC_Variables.VerificationMode,
            ExpectedVerificationVariables: TC_Variables.ExpectedVerificationVariables.result,
            OperationResults: TC_Variables.ExpectedOperationResults
        } );
        if( callResult !== false && callResult.success ) {
            if( callResult.AssetVerificationResults.length > 0 ) {
                /* check results
                 - The VerificationStatus shall be set to Uncertain.
                 - VerificationResult equals NotSet.
                 - The VerificationVariablesErrors array reports 'Good' or 'Bad_BrowseNameInvalid' for the modified verification variable. 
                 - The length of VerificationVariablesErrors array match the length of ExpectedVerificationVariables.
                 - The VerificationAdditionalVariablesErrors array is not populated.
                 */
                var vStatus                    = callResult.AssetVerificationResults[0].VerificationStatus;
                var vResult                    = callResult.AssetVerificationResults[0].VerificationResult;
                var vVariablesErrors           = callResult.AssetVerificationResults[0].VerificationVariablesErrors;
                var vAdditionalVariablesErrors = callResult.AssetVerificationResults[0].VerificationAdditionalVariablesErrors;
                
                if( !Assert.Equal( TC_Variables.ExpectedVerificationStatus, vStatus, "Received unexpected value for VerificationStatus" ) ) TC_Variables.result = false;
                if( !Assert.Equal( TC_Variables.ExpectedVerificationResult, vResult, "Received unexpected value for VerificationResult" ) ) TC_Variables.result = false;
                
                if( Assert.Equal( TC_Variables.ExpectedVerificationVariables.result.length, vVariablesErrors.length, "Length of VerificationVariablesErrors array does not match the length of the ExpectedVerificationVariables input argument" ) ) {
                    
                    for( var e=0; e<vVariablesErrors.length - 1; e++ ) {
                        // StatusCode for the ExpectedVerificationVariables shall be Good
                        if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), vVariablesErrors[e], "Received unexpected StatusCode for VerificationVariablesErrors[" + e + "] (supported variable)" ) ) TC_Variables.result = false;
                    }
                    
                    // StatusCode for the last ExpectedVerificationVariable shall be Bad_BrowseNameInvalid
                    if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadBrowseNameInvalid ), vVariablesErrors[vVariablesErrors.length-1], "Received unexpected StatusCode for VerificationVariablesErrors[" + (vVariablesErrors.length-1) + "] (unsupported variable)" ) ) TC_Variables.result = false;
                    
                }
                else TC_Variables.result = false;
                
                if( !Assert.Equal( 0, vAdditionalVariablesErrors.length, "Received unexpected length of VerificationAdditionalVariablesErrors array" ) ) TC_Variables.result = false;
                
            }
            else {
                addError( "Returned AssetVerificationResults OutputArgument is empty." );
                TC_Variables.result = false;
            }
        }
        else TC_Variables.result = false;
        
        addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' ===" );
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_Err_015 } );