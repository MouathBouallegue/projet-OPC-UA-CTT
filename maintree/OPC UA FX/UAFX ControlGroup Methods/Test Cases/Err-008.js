/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that a variable can only be controlled by one owner at the same time.
                  The initial Lock and delayed Lock are assigned to separate client session.
    Requirements: - At least two instances of the ControlGroupType are exposed in the ControlGroups
                    folder.
                  - At least one Variable is referenced in the lists of different ControlGroups.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                  The ControlGroup shall share at least one variable with a second implemented
                  ControlGroup.
          Step 2: Call EstablishControl method on a second ControlGroup. The ControlGroup
                  shall share at least one variable with the ControlGroup from step 1.
                  Use a different ApplicationUri than in step 1 as LockContext.
          Step 3: Call ReleaseControl to cleanup the lock(s).
*/

function Test_Err_008() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 1 ) {
        // Create a second session for Step 2
        var secondSession = new CreateSessionService( { Channel: Test.Channel } );
        if( secondSession.Execute( { ClientDescription: ClientDescriptionWithSecondApplicationUri } ) ) {
            ActivateSessionHelper.Execute( { Session: secondSession } );
            // Find 2 ControlGroups with shared variables
            var result = FindTwoControlGroupsWithSharedVariables();
            if( result !== false ) {
                // Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                if( isDefined( result.ControlGroupA.EstablishControl ) ) {
                    addLog( "ApplicationUri used for Step 1: " + Test.Session.Request.ClientDescription.ApplicationUri );
                    var callResult = callEstablishControlMethod( result.ControlGroupA, Test.Session.Request.ClientDescription.ApplicationUri );
                    if( callResult.success ) {
                        // LockStatus shall be 0(OK)
                        if( !Assert.Equal( 0, callResult.LockStatus, "Step 1: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                        // IsControlled flag shall be TRUE
                        if( ReadHelper.Execute( { NodesToRead: result.ControlGroupA.IsControlled } ) ) {
                            if( !Assert.Equal( true, result.ControlGroupA.IsControlled.Value.Value.toBoolean(), "Step 1: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                        }
                        // Step 2: Call EstablishControl method on a second ControlGroup. 
                        //         Use a different ApplicationUri than in step 1 as LockContext.
                        InstanciateHelpers( { Session: secondSession } );
                        if( isDefined( result.ControlGroupB.EstablishControl ) ) {
                            addLog( "ApplicationUri used for Step 2: " + secondSession.Request.ClientDescription.ApplicationUri );
                            var callResult = callEstablishControlMethod( result.ControlGroupB, secondSession.Request.ClientDescription.ApplicationUri );
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
                        InstanciateHelpers( { Session: Test.Session } );
                        if( !callReleaseControlMethod( result.ControlGroupA ) ) {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + result.ControlGroupA.NodeId + "' was not successful." );
                            TC_Variables.Result = false;
                        }
                    }
                    if( isDefined( result.ControlGroupB.ReleaseControl ) ) {
                        InstanciateHelpers( { Session: secondSession } );
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
            CloseSessionHelper.Execute( { Session: secondSession } );
            InstanciateHelpers( { Session: Test.Session } );
        }
        else {
            addError( "Could not create a second session for Step 2. Aborting test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "Not enough instances of type 'ControlGroupType' found in address space. At least 2 needed. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_008 } );