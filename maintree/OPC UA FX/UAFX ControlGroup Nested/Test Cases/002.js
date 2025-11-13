/* SCRIPT NOT TESTED YET */
/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the EstablishControl Methods are not applied to any nested ControlGroups.
         Step 1: Browse any ControlGroup Object that contain a nested ControlGroup.
         Step 2: Call EstablishControl method referenced by the parent ControlGroup object
                 with LockContext set to a valid ApplicationUri.
         Step 3: Issue a Read request to any variable in the ListToBlock of the nested ControlGroup
                 object.
         Step 4: Issue a Write Request to the same Variable read in Step 3.
         Step 5: Issue a Method Call to any Method in the ListToBlock of the nested ControlGroup
                 Object.
         Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse any ControlGroup Object that contain a nested ControlGroup.
    if( CU_Variables.ControlGroupsWithNestedControlGroups.length > 0 ) {            
        for( var i=0; i<CU_Variables.ControlGroupsWithNestedControlGroups.length; i++ ) {
            
            // get variables and methods of ListToBlock folder of nested ControlGroup for next steps
            SetAllChildren_recursive( CU_Variables.ControlGroupsWithNestedControlGroups[i].NestedControlGroups[0] );
            var ListToBlockNested_Children = GetChildNodes( CU_Variables.ControlGroupsWithNestedControlGroups[i].NestedControlGroups[0].ListToBlock );
            var ListToBlockNested_Variables = [];
            var ListToBlockNested_Methods = [];
            for( var f=0; f<ListToBlockNested_Children.length; f++ ) {
                if( ListToBlockNested_Children[f].NodeClass == NodeClass.Variable ) ListToBlockNested_Variables.push( ListToBlockNested_Children[f] );
                if( ListToBlockNested_Children[f].NodeClass == NodeClass.Method ) ListToBlockNested_Methods.push( ListToBlockNested_Children[f] );
            }
        
            // Step 2: Call EstablishControl method referenced by the parent ControlGroup object
            //         with LockContext set to a valid ApplicationUri.
            if( isDefined( CU_Variables.ControlGroupsWithNestedControlGroups[i].EstablishControl ) ) {
                // get ApplicationUri
                if( isDefined( gServerCapabilities.ConnectedEndpoint ) && isDefined( gServerCapabilities.ConnectedEndpoint.Server ) ) var applicationUri = gServerCapabilities.ConnectedEndpoint.Server.ApplicationUri;
                // if no applicationUri is defined, try calling the method using a null string
                if( !isDefined( applicationUri ) ) var applicationUri = null;
                var callResult = callEstablishControlMethod( CU_Variables.ControlGroupsWithNestedControlGroups[i], applicationUri );
                if( callResult.success ) {
                    // LockStatus shall be 0(OK)
                    if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                    // IsControlled flag shall be TRUE
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupsWithNestedControlGroups[i].IsControlled } ) ) {
                        if( !Assert.Equal( true, CU_Variables.ControlGroupsWithNestedControlGroups[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                    }
                    if( ListToBlockNested_Variables.length > 0 ) {
                        // Step 3: Issue a Read request to any variable in the ListToBlock of the nested ControlGroup object
                        if( ReadHelper.Execute( { NodesToRead: ListToBlockNested_Variables } ) ) {
                            // Step 4: Issue a Write Request to the same Variable read in Step 3.
                            for( var o=0; o<ListToBlockNested_Variables.length; o++ ) {
                                ListToBlockNested_Variables[o].OriginalValue = ListToBlockNested_Variables[o].Value.clone();
                                UaVariant.Increment( { Value: ListToBlockNested_Variables[o].Value } );
                            }
                            if( !WriteHelper.Execute( { NodesToWrite: ListToBlockNested_Variables } ) ) TC_Variables.Result = false;
                            // revert values
                            for( var o=0; o<ListToBlockNested_Variables.length; o++ ) ListToBlockNested_Variables[o].Value = ListToBlockNested_Variables[o].OriginalValue.clone();
                            if( !WriteHelper.Execute( { NodesToWrite: ListToBlockNested_Variables } ) ) TC_Variables.Result = false;
                        }
                        else TC_Variables.Result = false;
                    }
                    else {
                        addSkipped( "No Variables available in ListToBlock of the nested ControlGroup '" + CU_Variables.ControlGroupsWithNestedControlGroups[i].NestedControlGroups[0].NodeId + "'. Skipping Step 3 + 4." );
                        TC_Variables.Result = false;
                    }
                    // Step 5: Issue a Method Call to any Method in the ListToBlock of the nested ControlGroup Object.
                    for( var m=0; m<ListToBlockNested_Methods.length; m++ ) {
                        addNotSupported( "CTT cannot execute generic method calls yet." );
                    }
                    // Step 6: Call ReleaseControl to cleanup the lock.
                    if( isDefined( CU_Variables.ControlGroupsWithNestedControlGroups[i].ReleaseControl ) ) {
                        if( !callReleaseControlMethod( CU_Variables.ControlGroupsWithNestedControlGroups[i] ) ) {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupsWithNestedControlGroups[i].NodeId + "' was not successful." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupsWithNestedControlGroups[i].NodeId + "' was not successful." );
                    TC_Variables.Result = false;
                    break;
                }
            }
            else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupsWithNestedControlGroups[i].NodeId + "' has no EstablishControl method. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
    }
    else {
        addSkipped( "No ControlGroupType instance with a nested ControlGroup found in AddressSpace. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );