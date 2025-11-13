/* SCRIPT NOT TESTED YET */
/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the EstablishControl Method for ListToRestrict when Lock is assigned
                  to a client session.
    Requirements: Variables and/or Methods are exposed in the ListToRestrict folder.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 2: Issue a Read Request to any variable in the ListToRestrict.
          Step 3: Issue a Write Request to the same Variable read in Step 2.
          Step 4: Verify by Reading the Variable from Step 3 that the value is changed.
          Step 5: Issue a Method Call to any Method in the ListToRestrict.
          Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_008() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
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
                    if( ListToRestrict_Variables.length > 0 ) {
                        // Step 2: Issue a Read request to any variable in the ListToRestrict.
                        if( ReadHelper.Execute( { NodesToRead: ListToRestrict_Variables[0] } ) ) {
                            // Step 3: Issue a Write Request to the same Variable read in Step 2.
                            var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                            ListToRestrict_Variables[0].OriginalValue = ListToRestrict_Variables[0].Value.clone();
                            UaVariant.Increment( { Value: ListToRestrict_Variables[0].Value } );
                            ListToRestrict_Variables[0].NewValue = ListToRestrict_Variables[0].Value.clone();
                            if( WriteHelper.Execute( { NodesToWrite: ListToRestrict_Variables[0], OperationResults: expectedResults } ) ) {
                                // Step 4: Verify by Reading the Variable from Step 3 that the value is changed.
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
                        else TC_Variables.Result = false;
                    }
                    else {
                        addSkipped( "No Variables available in ListToRestrict of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Steps 2-4." );
                        TC_Variables.Result = false;
                    }
                    // Step 5: Issue a Method Call to any Method in the ListToRestrict of the ControlGroup Object.
                    if( ListToRestrict_Methods.length > 0 ) {
                        for( var m=0; m<ListToRestrict_Methods.length; m++ ) if( !callGenericMethod( ListToRestrict_Methods[m] ) ) TC_Variables.Result = false;
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
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_008 } );