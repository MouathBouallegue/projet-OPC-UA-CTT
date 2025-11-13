/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that a ControlGroup can only be controlled by one owner at the same
                  time. The initial Lock and delayed Lock are assigned to separate
                  PubSubConnectionEndpoints.
    Requirements: At least two instances of PubSubConnectionEndpointType exist.
          Step 1: Call EstablishControl method and provide the NodeId of an instance of the
                  ConnectionEndpointType as LockContext.
          Step 2: Call EstablishControl method and provide the NodeId of a second instance
                  of the ConnectionEndpointType as LockContext.
          Step 3: Call ReleaseControl to cleanup the lock(s).
*/

function Test_Err_010() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    TC_Variables.ExpectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];  
    
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 1 ) {
        if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
            // Step 1: Call EstablishControl method and provide the NodeId of an instance of the
            //         ConnectionEndpointType as LockContext.
            if( isDefined( CU_Variables.ControlGroupType_Instances[0].EstablishControl ) ) {
                addLog( "LockContext used for Step 1: " + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString() );
                var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[0], CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString() );
                if( callResult.success ) {
                    // LockStatus shall be 0(OK)
                    if( !Assert.Equal( 0, callResult.LockStatus, "Step 1: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                    // IsControlled flag shall be TRUE
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[0].IsControlled } ) ) {
                        if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[0].IsControlled.Value.Value.toBoolean(), "Step 1: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                    }
                    // Controls Reference is pointing from the Object associated with the Client connection to the locked ControlGroupType instance.
                    var controlsReferenceExists = CheckHasReferenceToNodeId( { 
                        SourceNode: CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId,
                        TargetNode: CU_Variables.ControlGroupType_Instances[0].NodeId,
                        ReferenceTypeId: CU_Variables.Test.HierarchicalReferences.Controls.NodeId,
                    } );
                    if( !controlsReferenceExists ) {
                        addError( "Missing Controls reference pointing from the PubSubConnectionEndpointType instance '" + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId + "' to the locked ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[0].NodeId + "' after calling EstablishControl." );
                        TC_Variables.Result = false;
                    }
                    // Step 2: Call EstablishControl method and provide the NodeId of a second instance
                    //         of the ConnectionEndpointType as LockContext.
                    addLog( "LockContext used for Step 2: " + CU_Variables.PubSubConnectionEndpointType_Instances[1].NodeId.toString() );
                    var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[0], CU_Variables.PubSubConnectionEndpointType_Instances[1].NodeId.toString(), undefined, TC_Variables.ExpectedResults );
                    if( callResult.success ) {
                        // LockStatus shall be -1(E_AlreadyLocked)
                        if( !Assert.Equal( -1, callResult.LockStatus, "Step 2: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                        // IsControlled flag shall be FALSE
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[0].IsControlled } ) ) {
                            if( !Assert.Equal( false, CU_Variables.ControlGroupType_Instances[0].IsControlled.Value.Value.toBoolean(), "Step 2: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[0].NodeId + "' was not successful." );
                        TC_Variables.Result = false;
                    }
                }
                else {
                    addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[0].NodeId + "' was not successful." );
                    TC_Variables.Result = false;
                }
                // Step 3: Call ReleaseControl to cleanup the lock(s).
                if( isDefined( CU_Variables.ControlGroupType_Instances[0].ReleaseControl ) ) {
                    if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[0] ) ) {
                        addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[0].NodeId + "' was not successful." );
                        TC_Variables.Result = false;
                    }
                }
            }
            else {
                addError( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[0].NodeId + "' has no EstablishControl method. Aborting test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No instances of type 'PubSubConnectionEndpointType' found in address space. At least 2 needed. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_010 } );