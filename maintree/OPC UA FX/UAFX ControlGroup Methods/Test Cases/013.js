/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the ReleaseControl Method for ListToBlock when the Lock is assigned
                  to a PubSubConnectionEndpoint.
    Requirements: Variables and/or Methods are exposed in the ListToBlock folder.
          Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                  PubSubConnectionEndpointType.
          Step 2: Call ReleaseControl method.
          Step 3: Issue a Read Request to any variable in the ListToBlock.
          Step 4: Issue a Write Request to the same Variable read in Step 3 to change the
                  value.
          Step 5: Verify by reading the Variable from Step 4 that the value changed.
          Step 6: Issue a Method Call to any Method in the ListToBlock.
*/

function Test_013() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // get the NodeId (as string) of a PubSubConnectionEndpointType instance first
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        TC_Variables.LockContext = CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString();
        if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
            for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
                // get variables and methods of ListToBlock folder of the ControlGroup for next steps
                var ListToBlock_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToBlock );
                var ListToBlock_Variables = [];
                var ListToBlock_Methods = [];
                for( var f=0; f<ListToBlock_Children.length; f++ ) {
                    if( ListToBlock_Children[f].NodeClass == NodeClass.Variable ) ListToBlock_Variables.push( ListToBlock_Children[f] );
                    if( ListToBlock_Children[f].NodeClass == NodeClass.Method ) ListToBlock_Methods.push( ListToBlock_Children[f] );
                }
                if( ListToBlock_Variables.length == 0 && ListToBlock_Methods.length == 0 ) {
                    addLog( "No Variables/Methods available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping node." );
                    break;
                }
                TC_Variables.nothingTested = false;
            
                // Step 1: Call EstablishControl method and provide the NodeId of any instance of a PubSubConnectionEndpointType.
                if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                    var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], TC_Variables.LockContext );
                    if( callResult.success ) {
                        // LockStatus shall be 0(OK)
                        if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                        // IsControlled flag shall be TRUE
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                            if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                        }
                        // Controls Reference is pointing from the PubSubConnectionEndpointType instance to the locked ControlGroupType instance
                        var controlsReferenceExists = CheckHasReferenceToNodeId( { 
                            SourceNode: CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId,
                            TargetNode: CU_Variables.ControlGroupType_Instances[i].NodeId,
                            ReferenceTypeId: CU_Variables.Test.HierarchicalReferences.Controls.NodeId,
                        } );
                        if( !controlsReferenceExists ) {
                            addError( "Missing Controls reference pointing from the PubSubConnectionEndpointType instance '" + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId + "' to the locked ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' after calling EstablishControl." );
                            TC_Variables.Result = false;
                        }
                        // Step 2: Call ReleaseControl method.
                        if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                            if( callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                // IsControlled flag shall be FALSE
                                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                                    if( !Assert.Equal( false, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                                }
                                // Controls Reference was removed
                                var controlsReferenceExists = CheckHasReferenceToNodeId( { 
                                    SourceNode: CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId,
                                    TargetNode: CU_Variables.ControlGroupType_Instances[i].NodeId,
                                    ReferenceTypeId: CU_Variables.Test.HierarchicalReferences.Controls.NodeId,
                                } );
                                if( controlsReferenceExists ) {
                                    addError( "Controls reference pointing from the PubSubConnectionEndpointType instance '" + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId + "' to the ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not removed after calling ReleaseControl." );
                                    TC_Variables.Result = false;
                                }
                            }
                            else {
                                addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                TC_Variables.Result = false;
                            }
                            if( ListToBlock_Variables.length > 0 ) {
                                // Step 3: Issue a Read Request to any variable in the ListToBlock.
                                if( ReadHelper.Execute( { NodesToRead: ListToBlock_Variables[0] } ) ) {
                                    // Step 4: Issue a Write Request to the same Variable read in step 3 to change the value.
                                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                                    ListToBlock_Variables[0].OriginalValue = ListToBlock_Variables[0].Value.clone();
                                    UaVariant.Increment( { Value: ListToBlock_Variables[0].Value } );
                                    ListToBlock_Variables[0].NewValue = ListToBlock_Variables[0].Value.clone();
                                    if( WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0], OperationResults: expectedResults } ) ) {
                                        // Step 5: Verify by reading the Variable from Step 4 that the value changed.
                                        if( ReadHelper.Execute( { NodesToRead: ListToBlock_Variables[0] } ) ) {
                                            if( !Assert.Equal( ListToBlock_Variables[0].Value.Value, ListToBlock_Variables[0].NewValue.Value, "Received unexpected value for variable '" + ListToBlock_Variables[0].NodeId + "'." ) ) TC_Variables.Result = false;
                                        }
                                        else TC_Variables.Result = false;
                                        // revert the value
                                        ListToBlock_Variables[0].Value = ListToBlock_Variables[0].OriginalValue.clone();
                                        if( !WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0] } ) ) TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No Variables available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Steps 3-5." );
                                TC_Variables.Result = false;
                            }
                            // Step 6: Issue a Method Call to any Method in the ListToBlock.
                            if( ListToBlock_Methods.length > 0 ) {
                                if( !callGenericMethod( ListToBlock_Methods[0] ) ) TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No methods available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 6." );
                                TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "ReleaseControl method not found in ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Aborting test." );
                            TC_Variables.Result = false;
                            break;
                        }
                    }
                    else {
                        addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                        TC_Variables.Result = false;
                        break;
                    }
                }
                else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no EstablishControl method. Skipping node." );
                if( !TC_Variables.Result ) break;
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "No Variables/Methods available in ListToBlock of any found ControlGroup. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No PubSubConnectionEndpoint found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_013 } );