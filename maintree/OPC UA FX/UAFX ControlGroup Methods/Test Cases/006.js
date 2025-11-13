/* SCRIPT NOT TESTED YET */
/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the EstablishControl Method for ListToBlock when the Lock is assigned
                  to a client session.
    Requirements: Variables and/or Methods are exposed in the ListToBlock folder.
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 2: Issue a Read request to any variable in the ListToBlock.
          Step 3: Issue a Write Request to the same Variable read in Step 2.
          Step 4: Verify by Reading the Variable from Step 3 that the value is unchanged.
          Step 5: Issue a Method Call to any Method in the ListToBlock.
          Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_006() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
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
                    if( ListToBlock_Variables.length > 0 ) {
                        // Step 2: Issue a Read request to any variable in the ListToBlock.
                        if( ReadHelper.Execute( { NodesToRead: ListToBlock_Variables[0] } ) ) {
                            // Step 3: Issue a Write Request to the same Variable read in Step 2.
                            var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];
                            ListToBlock_Variables[0].OriginalValue = ListToBlock_Variables[0].Value.clone();
                            UaVariant.Increment( { Value: ListToBlock_Variables[0].Value } );
                            if( WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0], OperationResults: expectedResults } ) ) {
                                // Step 4: Verify by Reading the Variable from Step 3 that the value is unchanged.
                                if( ReadHelper.Execute( { NodesToRead: ListToBlock_Variables[0] } ) ) {
                                    if( !Assert.Equal( ListToBlock_Variables[0].Value.Value, ListToBlock_Variables[0].OriginalValue.Value, "Value of variable '" + ListToBlock_Variables[0].NodeId + "' unexpectedly changed after Write." ) ) {
                                        // revert the value if it changed
                                        ListToBlock_Variables[0].Value = ListToBlock_Variables[0].OriginalValue.clone();
                                        if( !WriteHelper.Execute( { NodesToWrite: ListToBlock_Variables[0] } ) ) TC_Variables.Result = false;
                                        TC_Variables.Result = false;
                                    }
                                }
                                else TC_Variables.Result = false;
                            }
                            else TC_Variables.Result = false;
                        }
                        else TC_Variables.Result = false;
                    }
                    else {
                        addSkipped( "No Variables available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Steps 2-4." );
                        TC_Variables.Result = false;
                    }
                    // Step 5: Issue a Method Call to any Method in the ListToBlock of the ControlGroup Object.
                    if( ListToBlock_Methods.length > 0 ) {
                        var operationResults = [ new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied ) ];
                        for( var m=0; m<ListToBlock_Methods.length; m++ ) if( !callGenericMethod( ListToBlock_Methods[m], operationResults ) ) TC_Variables.Result = false;
                    }
                    else {
                        addSkipped( "No methods available in ListToBlock of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 5." );
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
            addSkipped( "No Variables/Methods available in ListToBlock of any found ControlGroup. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );