/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that Variables and Methods in ListToRestrict are restricted to the
                 lock owner. 
         Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
         Step 2: Issue a Write Request to any Variable in the ListToRestrict.
         Step 3: Verify by Reading the Variable from Step 2 that the value changed.
         Step 4: Issue a Method Call to any Method in the ListToRestrict.
         Step 5: Repeat Step 2 and Step 4 with a second client connection.
         Step 7: Call ReleaseControl to cleanup the lock.
         Step 8: Repeat Step 5.
*/

function Test_022() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Create a second session for Step 5 + 8
        var secondSession = new CreateSessionService( { Channel: Test.Channel } );
        if( secondSession.Execute() ) {
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
            
                // Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                    TC_Variables.nothingTested = false;
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
                        // Step 5: Repeat Step 2 and Step 4 with a second client connection.
                        // Step 8: Repeat Step 5.
                        for( var repeat=0; repeat<3; repeat++ ) {
                            switch( repeat ) {
                                case 0:
                                    addLog( "Executing Step 2-4" );
                                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                                    break;
                                case 1:
                                    addLog( "Executing Step 5" );
                                    InstanciateHelpers( { Session: secondSession } );
                                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
                                    break;
                                case 2:
                                    addLog( "Executing Step 8" );
                                    InstanciateHelpers( { Session: secondSession } );
                                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                                    break;
                                default:
                            }
                            // Step 2: Issue a Write Request to any Variable in the ListToRestrict.
                            if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                                ListToRestrict_Variables[0].OriginalValue = ListToRestrict_Variables[0].Value.clone();
                                UaVariant.Increment( { Value: ListToRestrict_Variables[0].Value } );
                                ListToRestrict_Variables[0].NewValue = ListToRestrict_Variables[0].Value.clone();
                                if( WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0], OperationResults: expectedResults } ) ) {
                                    // Step 3: Verify by Reading the Variable from Step 2 that the value changed.
                                    if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                                        if( !Assert.Equal( ListToRestrict_Variables[0].Value.Value, ListToRestrict_Variables[0].NewValue.Value, "Received unexpected value for variable '" + ListToRestrict_Variables[0].NodeId + "'." ) ) TC_Variables.Result = false;
                                    }
                                    else TC_Variables.Result = false;
                                    // revert the value
                                    ListToRestrict_Variables[0].Value = ListToRestrict_Variables[0].OriginalValue.clone();
                                    if( !WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0] } ) ) TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                            }
                            // Step 4: Issue a Method Call to any Method in the ListToRestrict
                            if( ListToRestrict_Methods.length > 0 ) {
                                for( var m=0; m<ListToRestrict_Methods.length; m++ ) if( !callGenericMethod( ListToRestrict_Methods[m], undefined, expectedResults ) ) TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No methods available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 4." );
                                TC_Variables.Result = false;
                            }
                            if( repeat == 1 ) {
                                // Step 7: Call ReleaseControl to cleanup the lock.
                                if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                                    if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                        addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                        TC_Variables.Result = false;
                                    }
                                }
                                else {
                                    addSkipped( "No ReleaseControl method available in ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Aborting test." );
                                    TC_Variables.Result = false;
                                    break;
                                }
                            }
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
                addSkipped( "No ControlGroupType instance with EstablishControl method having ListToBlock folder defining at least one variable/method, found. Skipping test." );
                TC_Variables.Result = false;
            }
            CloseSessionHelper.Execute( { Session: secondSession } );
        }
        else {
            addError( "Could not create a second session for Step 5 + 8. Aborting test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_022 } );