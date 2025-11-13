/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing ReassignControl Method for ListToRestrict when lock gets assigned
                  to a client session.
    Requirements: Variables, Methods or Objects are exposed in the ListToRestrict folder.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 2: Call ReassignControl and provide the ApplicationUri of a second Client connection.
          Step 3: Use the initial CTT session to issue a Read Request to any variable in the
                  ListToRestrict.
          Step 4: Use the initial CTT session to issue a Write Request to the same Variable
                  read in Step 3.
          Step 5: Use the initial CTT session to call a Method in the ListToBlock.
          Step 6: Use the second CTT session, which is now owning the control, to issue a
                  Read Request to any variable in the ListToRestrict.
          Step 7: Use the second CTT session, which is now owning the control, to issue a
                  Write Request to the same Variable read in Step 6.
          Step 8: Use the second CTT session, which is now owning the control, to call a Method
                  in the ListToBlock.
          Step 9: Call ReleaseControl to cleanup the lock.
*/

function Test_012() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Create a second session for this test
        var secondSession = new CreateSessionService( { Channel: Test.Channel } );
        if( secondSession.Execute( { ClientDescription: ClientDescriptionWithSecondApplicationUri } ) ) {
            ActivateSessionHelper.Execute( { Session: secondSession } );
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
                    continue;
                }
                TC_Variables.nothingTested = false;
            
                // Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                    addLog( "ApplicationUri used for Step 1: " + Test.Session.Request.ClientDescription.ApplicationUri );
                    var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], Test.Session.Request.ClientDescription.ApplicationUri );
                    if( callResult.success ) {
                        // LockStatus shall be 0(OK)
                        if( !Assert.Equal( 0, callResult.LockStatus, "Step 1: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                        // IsControlled flag shall be TRUE
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                            if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Step 1: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                        }
                        // Step 2: Call ReassignControl and provide the ApplicationUri of a second Client connection.
                        if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl ) ) {
                            addLog( "ApplicationUri used for Step 2: " + secondSession.Request.ClientDescription.ApplicationUri );
                            InstanciateHelpers( { Session: secondSession } );
                            var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], secondSession.Request.ClientDescription.ApplicationUri, undefined, undefined, true );
                            if( callResult.success ) {
                                // LockStatus shall be 0(OK)
                                if( !Assert.Equal( 0, callResult.LockStatus, "Step 2: Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                                // IsControlled flag shall be TRUE
                                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                                    if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Step 2: Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                                }
                                var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
                                if( ListToRestrict_Variables.length > 0 ) {
                                    // Step 3: Use the initial CTT session to issue a Read Request
                                    //         to any variable in the ListToRestrict.
                                    InstanciateHelpers( { Session: Test.Session } );
                                    if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                                        // Step 4: Use the initial CTT session to issue a Write Request
                                        //         to the same Variable read in Step 3.
                                        if( !WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0], OperationResults: expectedResults } ) ) TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                }
                                else {
                                    addSkipped( "No Variables available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Steps 3 + 4 + 6 + 7." );
                                    TC_Variables.Result = false;
                                }
                                // Step 5: Use the initial CTT session to call a Method in the ListToRestrict.
                                if( ListToRestrict_Methods.length > 0 ) {
                                    if( !callGenericMethod( ListToRestrict_Methods[0], undefined, expectedResults ) ) TC_Variables.Result = false;
                                }
                                else {
                                    addSkipped( "No methods available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 5." );
                                    TC_Variables.Result = false;
                                }
                                expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                                if( ListToRestrict_Variables.length > 0 ) {
                                    // Step 6: Use the second CTT session, which is now owning the control,
                                    //         to issue a Read Request to any variable in the ListToRestrict.
                                    InstanciateHelpers( { Session: secondSession } );
                                    if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                                        // Step 7: Use the second CTT session, which is now owning the control,
                                        //         to issue a Write Request to the same Variable read in Step 6.
                                        if( !WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0], OperationResults: expectedResults } ) ) TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                }
                                // Step 8: Use the second CTT session to call a Method in the ListToRestrict.
                                if( ListToRestrict_Methods.length > 0 ) {
                                    if( !callGenericMethod( ListToRestrict_Methods[0], undefined, expectedResults ) ) TC_Variables.Result = false;
                                }
                                else {
                                    addSkipped( "No methods available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 8." );
                                    TC_Variables.Result = false;
                                }
                                // Step 9: Call ReleaseControl to cleanup the lock.
                                if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                                    InstanciateHelpers( { Session: Test.Session } );
                                    if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                        addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                        TC_Variables.Result = false;
                                    }
                                }
                            }
                            else {
                                addError( "Calling ReassginControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                TC_Variables.Result = false;
                                break;
                            }
                        }
                        else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no ReassignControl method. Skipping node." );
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
            CloseSessionHelper.Execute( { Session: secondSession } );
        }
        else {
            addError( "Could not create a second session. Aborting test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_012 } );