/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Check that the MaxInactiveLocktime property of the ControlItemFolderType
                  overwrites the MaxInactiveLocktime property in the ServerCapabilities
                  Object.
    Requirements: - The MaxInactiveLocktime Properties are supported.
                  - The CleanupTimeout of the ConnectionEndpoint is longer than
                    MaxInactiveLockTime values or the connection is persistent.
          Step 1: Read the MaxInactiveLockTime Property of any ListToBlock. 
          Step 2: Read the MaxInactiveLockTime Property of the ServerCapabilities Object.
          Step 3: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 4: Wait for the duration read in step 1 and add a reasonable tolerance.
          Step 5: Write to any variable in the ListToBlock.
*/

function Test_017() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // get variables of ListToBlock folder (excluding MaxInactiveLockTime) of the ControlGroup for next steps
            var ListToBlock_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToBlock );
            var ListToBlock_Variables = [];
            for( var f=0; f<ListToBlock_Children.length; f++ ) {
                if( ListToBlock_Children[f].NodeClass == NodeClass.Variable &&
                    ListToBlock_Children[f].BrowseName.Name != "MaxInactiveLockTime" ) ListToBlock_Variables.push( ListToBlock_Children[f] );
            }
            if( ListToBlock_Variables.length == 0 ) {
                addLog( "No Variables available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping node." );
                break;
            }
        
            // Step 1: Read the MaxInactiveLockTime Property of any ListToBlock.
            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime ) ) {
                TC_Variables.nothingTested = false;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime } ) ) {
                    var maxInactiveLockTime = CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime.Value.Value.toDouble();
                    if( maxInactiveLockTime <= 120000 ) {
                        // Step 2: Read the MaxInactiveLockTime Property of the ServerCapabilities Object.
                        if( isDefined( CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime ) ) {
                            if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime } ) ) {
                                var maxInactiveLockTime_serverCapabilities = CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime.Value.Value.toDouble();
                                if( maxInactiveLockTime_serverCapabilities != maxInactiveLockTime ) {
                                    // Step 3: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                                    if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                                        // get ApplicationUri
                                        if( isDefined( Test.Session.Request.ClientDescription ) && isDefined( Test.Session.Request.ClientDescription.ApplicationUri ) ) var applicationUri = Test.Session.Request.ClientDescription.ApplicationUri;
                                        // if no applicationUri is defined, try calling the method using a null string
                                        if( !isDefined( applicationUri ) ) var applicationUri = null;
                                        var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], applicationUri );
                                        if( callResult.success ) {
                                            // LockStatus shall be 0(OK)
                                            if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                                            // IsControlled flag shall be TRUE
                                            if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                                                if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                                            }
                                            // Step 4: Wait for the duration read in step 1 and add a reasonable tolerance
                                            UaDateTime.CountDown( { Msecs: maxInactiveLockTime * 1.10 } );
                                            // Step 5: Write to any variable in the ListToBlock
                                            var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                                            if( ReadHelper.Execute( { NodesToRead: ListToBlock_Variables[0] } ) ) {
                                                ListToBlock_Variables[0].OriginalValue = ListToBlock_Variables[0].Value.clone();
                                                UaVariant.Increment( { Value: ListToBlock_Variables[0].Value } );
                                                if( WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0], OperationResults: expectedResults } ) ) {
                                                    // revert the value
                                                    ListToBlock_Variables[0].Value = ListToBlock_Variables[0].OriginalValue.clone();
                                                    if( !WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0] } ) ) TC_Variables.Result = false;
                                                }
                                                else TC_Variables.Result = false;
                                            }
                                        }
                                        else {
                                            addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                            TC_Variables.Result = false;
                                            break;
                                        }
                                    }
                                    else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no EstablishControl method. Skipping node." );
                                }
                                else {
                                    addSkipped( "Values of MaxInactiveLockTime of ListToBlock of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' and the MaxInactiveLockTime of the ServerCapabilities object are equal. Skipping test." );
                                    TC_Variables.Result = false;
                                    break;
                                }
                            }
                        }
                        else {
                            addError( "ServerCapabilities does not expose MaxInactiveLockTime. Aborting test." );
                            TC_Variables.Result = false;
                            break;
                        }
                    }
                    else {
                        addSkipped( "MaxInactiveLockTime of ListToBlock of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' is > 120000. Skipping test." );
                        TC_Variables.Result = false;
                        break;
                    }
                }
            }
            else {
                addLog( "ListToBlock of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no MaxInactiveLockTime property. Skipping node." );
                continue;
            }
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No ListToBlock folder with at least one variable and the MaxInactiveLockTime property found in AddressSpace. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_017 } );