/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check the reset of RemainingLockTime after calling RenewLock for ListToBlock.
         Step 1: Read the value of the MaxInactiveLockTime Property of the ListToBlock. If
                 not exposed in the ListToBlock, read the MaxInactiveLockTime of the ServerCapabilities
                 Object.
         Step 2: Call EstablishControl method with LockContext set to a valid ApplicationUri.
         Step 3: Read the value of the RemainingLockTime Property of the Lock Object from
                 the ListToBlock by using a seperate CTT session. 
         Step 4: Call the RenewLock Method of the Lock Object  (Instance of the LockingServiceType)
                 by using the initial CTT session. 
         Step 5: Read the value of the RemainingLockTime Property of the Lock Object from
                 the ListToBlock by using a seperate CTT session. 
         Step 6: Use the initial CTT session to issue a Write Request to any Variable in
                 ListToBlock.
         Step 7: Call ReleaseControl to cleanup the lock(s).
*/

function Test_020() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Create a second session for Step 3 + 5
        var secondSession = new CreateSessionService( { Channel: Test.Channel } );
        if( secondSession.Execute() ) {
            ActivateSessionHelper.Execute( { Session: secondSession } );
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
                    continue;
                }
            
                // Step 1: Read the value of the MaxInactiveLockTime Property of the ListToBlock. If not exposed
                //         in the ListToBlock, read the MaxInactiveLockTime of the ServerCapabilities Object.
                var maxInactiveLockTime = null;
                if( isDefined( CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime ) ) {
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime } ) ) {
                        if( !CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime.Value.Value.isEmpty() ) {
                            maxInactiveLockTime = CU_Variables.ControlGroupType_Instances[i].ListToBlock.MaxInactiveLockTime.Value.Value.toDouble();
                        }
                    }
                }
                if( maxInactiveLockTime == null ) {
                    if( isDefined( CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime ) ) {
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime } ) ) {
                            if( !CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime.Value.Value.isEmpty() ) {
                                maxInactiveLockTime = CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime.Value.Value.toDouble();
                            }
                        }
                    }
                }
                if( maxInactiveLockTime != null ) {
                    // Step 2: Call EstablishControl method with LockContext set to a valid ApplicationUri.
                    if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                        TC_Variables.nothingTested = false;
                        // get ApplicationUri
                        if( isDefined( Test.Session.Request.ClientDescription ) && isDefined( Test.Session.Request.ClientDescription.ApplicationUri ) ) var applicationUri = Test.Session.Request.ClientDescription.ApplicationUri;
                        // if no applicationUri is defined, try calling the method using a null string
                        if( !isDefined( applicationUri ) ) var applicationUri = null;
                        var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], applicationUri );
                        var callEstablishControlTime = new UaDateTime.Now();
                        if( callResult.success ) {
                            // LockStatus shall be 0(OK)
                            if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                            // IsControlled flag shall be TRUE
                            if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                                if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                            }
                            // Step 3: Read the value of the RemainingLockTime Property of the Lock
                            //         Object from the ListToBlock by using a seperate CTT session. 
                            InstanciateHelpers( { Session: secondSession } );
                            var remainingLockTime = null;
                            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime ) ) {
                                // wait 100 ms to have a small gap between the EstablishControl call and the Read of the RemainingLockTime property
                                UaDateTime.CountDown( { Msecs: 100 } );
                                var timeBetweenEstablishControlAndRead = callEstablishControlTime.msecsTo( new UaDateTime.Now() );
                                if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime } ) ) {
                                    if( !CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime.Value.Value.isEmpty() ) {
                                        remainingLockTime = CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime.Value.Value.toDouble();
                                    }
                                }
                            }
                            if( remainingLockTime != null ) {
                                // difference between MaxInactiveLockTime and RemainingLockTime must be greater than
                                // the pause between calling EstablishControl and reading the RemainingLockTime Property
                                var difference = maxInactiveLockTime - remainingLockTime;
                                if( !Assert.GreaterThan( timeBetweenEstablishControlAndRead - 1, difference, "Step 3: The RemainingLockTime was not reduced according to the duration of the pause between calling EstablishControl and reading the RemainingLockTime Property" ) ) TC_Variables.Result = false;
                                // Step 4: Call the RenewLock Method of the Lock Object by using the initial CTT session.
                                InstanciateHelpers( { Session: Test.Session } );
                                if( isDefined( CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RenewLock ) ) {
                                    if( CallHelper.Execute( { 
                                        MethodsToCall: [ { 
                                            MethodId: CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RenewLock.NodeId,
                                            ObjectId: CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.NodeId,
                                        } ]
                                    } ) ) {
                                        // Step 5: Read the value of the RemainingLockTime Property of the Lock Object from
                                        //         the ListToBlock by using a seperate CTT session.
                                        InstanciateHelpers( { Session: secondSession } );
                                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime } ) ) {
                                            remainingLockTime = CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.RemainingLockTime.Value.Value.toDouble();
                                            var differenceAfterReset = maxInactiveLockTime - remainingLockTime;
                                            // Reset is checked by checking if the difference after the reset is less than the difference from Step 3
                                            if( !Assert.LessThan( difference, differenceAfterReset, "Step 5: The RemainingLockTime was not reset." ) ) TC_Variables.Result = false;
                                        }
                                        // Step 6: Use the initial CTT session to issue a Write Request to any Variable in ListToBlock.
                                        InstanciateHelpers( { Session: Test.Session } );
                                        var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
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
                                    else TC_Variables.Result = false;
                                }
                                else {
                                    addError( "Mandatory RenewLock method not found in the mandatory Lock object of ListToBlock folder '" + CU_Variables.ControlGroupType_Instances[i].ListToBlock.NodeId + "'. Aborting test." );
                                    TC_Variables.Result = false;
                                    break;
                                }
                            }
                            else {
                                addError( "Could not get value of mandatory RemainingLockTime property of the mandatory Lock object of ListToBlock folder '" + CU_Variables.ControlGroupType_Instances[i].ListToBlock.NodeId + "'. Aborting test." );
                                TC_Variables.Result = false;
                                break;
                            }
                            // Step 7: Call ReleaseControl to cleanup the lock(s).
                            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                                if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                                    addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                                    TC_Variables.Result = false;
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
                }
                else addLog( "MaxInactiveLockTime is not defined in either ListToBlock '" + CU_Variables.ControlGroupType_Instances[i].ListToBlock.NodeId + "' or the ServerCapabilities object. Skipping node." );
                if( !TC_Variables.Result ) break;
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "No ListToBlock folder defines the MaxInactiveLockTime property as well as the ServerCapabilities object and/or no ListToBlock defines at least one variable. Skipping test." );
                TC_Variables.Result = false;
            }
            CloseSessionHelper.Execute( { Session: secondSession } );
        }
        else {
            addError( "Could not create a second session for Step 3 + 5. Aborting test." );
            TC_Variables.result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_020 } );