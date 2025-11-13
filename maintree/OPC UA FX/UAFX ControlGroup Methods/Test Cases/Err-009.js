/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that a variable can only be controlled by one owner at the same time.
                  The initial Lock is assigned to a Client Session and the delayed Lock
                  is assigned to a PubSubConnectionEndpoint.    
    Requirements: - At least two instances of the ControlGroupType are exposed in the ControlGroups
                    folder.
                  - At least one Variable is referenced from more than one ControlGroup.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                  The ControlGroup shall share at least one variable with a second implemented
                  ControlGroup.
          Step 2: Call EstablishControl method and provide the NodeId of an instance of the
                  PubSubConnectionEndpointType as LockContext. The ControlGroup shall share
                  at least one variable with the ControlGroup from step 1.
          Step 3: Call ReleaseControl to cleanup the lock(s).
*/

function Test_Err_009() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        if( CU_Variables.ControlGroupType_Instances.length > 1 ) {
            // Find 2 ControlGroups with shared variables
            var result = FindTwoControlGroupsWithSharedVariables();
            if( result !== false ) {
                // Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                if( isDefined( result.ControlGroupA.EstablishControl ) ) {
                    addLog( "LockContext used for Step 1: " + Test.Session.Request.ClientDescription.ApplicationUri );
                    var callResult = callEstablishControlMethod( result.ControlGroupA, Test.Session.Request.ClientDescription.ApplicationUri );
                    if( callResult.success ) {
                        // LockStatus shall be 0(OK)
                        if( !Assert.Equal( 0, callResult.LockStatus, "Step 1: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                        // IsControlled flag shall be TRUE
                        if( ReadHelper.Execute( { NodesToRead: result.ControlGroupA.IsControlled } ) ) {
                            if( !Assert.Equal( true, result.ControlGroupA.IsControlled.Value.Value.toBoolean(), "Step 1: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                        }
                        // Step 2: Call EstablishControl method and provide the NodeId of an instance
                        //         of the PubSubConnectionEndpointType as LockContext.
                        if( isDefined( result.ControlGroupB.EstablishControl ) ) {
                            addLog( "LockContext used for Step 2: " + CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString() );
                            var callResult = callEstablishControlMethod( result.ControlGroupB, CU_Variables.PubSubConnectionEndpointType_Instances[0].NodeId.toString() );
                            if( callResult.success ) {
                                // LockStatus shall be -1(E_AlreadyLocked)
                                if( !Assert.Equal( -1, callResult.LockStatus, "Step 2: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                                // IsControlled flag shall be FALSE
                                if( ReadHelper.Execute( { NodesToRead: result.ControlGroupB.IsControlled } ) ) {
                                    if( !Assert.Equal( false, result.ControlGroupB.IsControlled.Value.Value.toBoolean(), "Step 2: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                                }
                            }
                            else {
                                addError( "Calling EstablishControl method on ControlGroupType instance '" + result.ControlGroupB.NodeId + "' was not successful." );
                                TC_Variables.Result = false;
                                break;
                            }
                        }
                        else {
                            addError( "ControlGroupType instance '" + result.ControlGroupB.NodeId + "' has no EstablishControl method. Aborting test." );
                            TC_Variables.Result = false;
                        }
                    }
                    else {
                        addError( "Calling EstablishControl method on ControlGroupType instance '" + result.ControlGroupA.NodeId + "' was not successful." );
                        TC_Variables.Result = false;
                        break;
                    }
                    // Step 3: Call ReleaseControl to cleanup the lock(s).
                    if( isDefined( result.ControlGroupA.ReleaseControl ) ) {
                        if( !callReleaseControlMethod( result.ControlGroupA ) ) {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + result.ControlGroupA.NodeId + "' was not successful." );
                            TC_Variables.Result = false;
                        }
                    }
                    if( isDefined( result.ControlGroupB.ReleaseControl ) ) {
                        if( !callReleaseControlMethod( result.ControlGroupB ) ) {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + result.ControlGroupB.NodeId + "' was not successful." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "ControlGroupType instance '" + result.ControlGroupA.NodeId + "' has no EstablishControl method. Aborting test." );
                    TC_Variables.Result = false;
                }
            }
            else {
                addSkipped( "No ControlGroups found that share any variable in ListToBlock or ListToRestrict. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "Not enough instances of type 'ControlGroupType' found in address space. At least 2 needed. Skipping test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No instances of type 'PubSubConnectionEndpointType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_009 } );