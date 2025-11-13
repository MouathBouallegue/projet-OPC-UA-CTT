/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Testing ReassignControl Method for ListToRestrict when Lock is reassigned
                 to a PubSubConnectionEndpoint.
         Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
         Step 2: Call ReassignControl and provide the NodeId of any instance of PubSubConnectionEndpointType.
         Step 3: Use the initial CTT session to issue a Read Request to any variable in the
                 ListToRestrict.
         Step 4: Use the initial CTT session to issue a Write Request to the same Variable
                 read in Step 3.
         Step 5: Use the initial CTT session to call a Method in the ListToRestrict.
         Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_015() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // get the NodeId (as string) of a PubSubConnectionEndpointType instance first
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        TC_Variables.LockContext = CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString();
        if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
            for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
                // get variables and methods of ListToRestrict folder of the ControlGroup for next steps
                var ListToRestrict_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToRestrict );
                var ListToRestrict_Variables = [];
                var ListToRestrict_Methods = [];
                for( var f=0; f<ListToRestrict_Children.length; f++ ) {
                    if( ListToRestrict_Children[f].NodeClass == NodeClass.Variable ) ListToRestrict_Variables.push( ListToRestrict_Children[f] );
                    if( ListToRestrict_Children[f].NodeClass == NodeClass.Method ) ListToRestrict_Methods.push( ListToRestrict_Children[f] );
                }
                if( ListToRestrict_Variables.length == 0 && ListToRestrict_Methods.length == 0 ) {
                    addLog( "No Variables/Methods available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping node." );
                    break;
                }
                TC_Variables.nothingTested = false;
            
                // Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
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
                        // Step 2: Call ReassignControl and provide the NodeId of any instance of PubSubConnectionEndpointType.
                        if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl ) ) {
                            callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], TC_Variables.LockContext, undefined, undefined, true );
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
                                    addError( "Missing Controls reference pointing from the PubSubConnectionEndpointType instance '" + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId + "' to the locked ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' after calling ReassignControl." );
                                    TC_Variables.Result = false;
                                }
                            }
                            else {
                                addError( "Calling ReassignControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                TC_Variables.Result = false;
                            }
                            if( ListToRestrict_Variables.length > 0 ) {
                                // Step 3: Use the initial CTT session to issue a
                                //         Read Request to any variable in the ListToRestrict.
                                if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                                    // Step 4: Use the initial CTT session to issue a
                                    //         Write Request to the same Variable read in Step 3.
                                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
                                    UaVariant.Increment( { Value: ListToRestrict_Variables[0].Value } );
                                    if( !WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0], OperationResults: expectedResults } ) ) TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No Variables available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Steps 3+4." );
                                TC_Variables.Result = false;
                            }
                            // Step 5: Use the initial CTT session to call a Method in the ListToRestrict.
                            if( ListToRestrict_Methods.length > 0 ) {
                                var operationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied ) ];
                                if( !callGenericMethod( ListToRestrict_Methods[0], operationResults ) ) TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No methods available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 5." );
                                TC_Variables.Result = false;
                            }
                            // Step 6: Call ReleaseControl to cleanup the lock.
                            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                                if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                    addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                    TC_Variables.Result = false;
                                }
                            }
                        }
                        else {
                            addError( "ReassignControl method not found in ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Aborting test." );
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
                addSkipped( "No Variables/Methods available in ListToRestrict of any found ControlGroup. Skipping test." );
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

Test.Execute( { Procedure: Test_015 } );