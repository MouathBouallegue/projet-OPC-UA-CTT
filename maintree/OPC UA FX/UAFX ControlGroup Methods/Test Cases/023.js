/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that elements in ListOfRelated are not blocked or restricted after
                  EstablishControl was called.
    Requirements: Elements are avialable in the ListOfRelated
          Step 1: Call EstablishControl method with LockContext set to a valid ApplicationUri.
          Step 2: Write to any variable in the ListOfRelated.
          Step 3: Call any Method in the ListOfRelated.
          Step 4: Call ReleaseControl to cleanup the lock.
*/

function Test_023() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // get variables and methods of ListOfRelated folder of the ControlGroup for next steps
            var ListOfRelated_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListOfRelated );
            var ListOfRelated_Variables = [];
            var ListOfRelated_Methods = [];
            for( var f=0; f<ListOfRelated_Children.length; f++ ) {
                if( ListOfRelated_Children[f].NodeClass == NodeClass.Variable ) ListOfRelated_Variables.push( ListOfRelated_Children[f] );
                if( ListOfRelated_Children[f].NodeClass == NodeClass.Method ) ListOfRelated_Methods.push( ListOfRelated_Children[f] );
            }
            if( ListOfRelated_Variables.length == 0 && ListOfRelated_Methods.length == 0 ) {
                addLog( "No Variables/Methods available in ListOfRelated of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping node." );
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
                    // Step 2: Write to any variable in the ListOfRelated
                    var expectedResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
                    if( ReadHelper.Execute( { NodesToRead: ListOfRelated_Variables[0] } ) ) {
                        ListOfRelated_Variables[0].OriginalValue = ListOfRelated_Variables[0].Value.clone();
                        UaVariant.Increment( { Value: ListOfRelated_Variables[0].Value } );
                        if( WriteHelper.Execute( { NodesToWrite: ListOfRelated_Variables[0], OperationResults: expectedResults } ) ) {
                            // revert the value
                            ListOfRelated_Variables[0].Value = ListOfRelated_Variables[0].OriginalValue.clone();
                            if( !WriteHelper.Execute( { NodesToWrite: ListOfRelated_Variables[0] } ) ) TC_Variables.Result = false;
                        }
                        else TC_Variables.Result = false;
                    }
                    // Step 3: Call any Method in the ListOfRelated.
                    if( ListOfRelated_Methods.length > 0 ) {
                        if( !callGenericMethod( ListOfRelated_Methods[0] ) ) TC_Variables.Result = false;
                    }
                    else {
                        addSkipped( "No methods available in ListOfRelated of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping Step 3." );
                        TC_Variables.Result = false;
                    }
                    // Step 4: Call ReleaseControl to cleanup the lock.
                    if( !callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] ) ) {
                        addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                        TC_Variables.Result = false;
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
            addSkipped( "No ControlGroupType instance with EstablishControl method having elements in the ListOfRelated folder found. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_023 } );