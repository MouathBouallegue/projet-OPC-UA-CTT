/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the ReassignControl Methods are not applied to any nested ControlGroups.
         Step 1: Browse any ControlGroup Object that contain an additional nested ControlGroup.
         Step 2: Call EstablishControl method referenced by the nested ControlGroup object
                 with LockContext set to a valid ApplicationUri.
         Step 3: Call ReassignControl method referenced by the parent ControlGroup object
                 with LockContext set to a valid ApplicationUri.
         Step 4: Issue a Write Request to a Variable referenced by ListToBlock of the nested
                 ControlGroup.
         Step 5: Call ReleaseControl to cleanup the lock.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied ) ];
    
    // Step 1: Browse any ControlGroup Object that contain an additional nested ControlGroup.
    if( CU_Variables.ControlGroupsWithNestedControlGroups.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupsWithNestedControlGroups.length; i++ ) {
            
            var NestedControlGroup = CU_Variables.ControlGroupsWithNestedControlGroups[i].NestedControlGroups[0].clone();
            // get variables of ListToBlock folder of nested ControlGroup for next steps
            SetAllChildren_recursive( NestedControlGroup );
            var ListToBlockNested_Variables = GetChildNodes( NestedControlGroup.ListToBlock );
            for( var f=0; f<ListToBlockNested_Variables.length; f++ ) if( ListToBlockNested_Variables[f].NodeClass != NodeClass.Variable ) { ListToBlockNested_Variables.splice( f, 1 ); f--; }
        
            // Step 2: Call EstablishControl method referenced by the nested ControlGroup object
            //         with LockContext set to a valid ApplicationUri.
            if( isDefined( NestedControlGroup.EstablishControl ) ) {
                TC_Variables.nothingTested = false;
                // get ApplicationUri
                if( isDefined( gServerCapabilities.ConnectedEndpoint ) && isDefined( gServerCapabilities.ConnectedEndpoint.Server ) ) var applicationUri = gServerCapabilities.ConnectedEndpoint.Server.ApplicationUri;
                // if no applicationUri is defined, try calling the method using a null string
                if( !isDefined( applicationUri ) ) var applicationUri = null;
                var callResult = callEstablishControlMethod( NestedControlGroup, applicationUri );
                if( callResult.success ) {
                    // LockStatus shall be 0(OK)
                    if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                    // IsControlled flag shall be TRUE
                    if( ReadHelper.Execute( { NodesToRead: NestedControlGroup.IsControlled } ) ) {
                        if( !Assert.Equal( true, NestedControlGroup.IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                    }
                    // Step 3: Call ReassignControl method referenced by the parent ControlGroup object
                    //         with LockContext set to a valid ApplicationUri.
                    if( isDefined( CU_Variables.ControlGroupsWithNestedControlGroups[i].ReassignControl ) ) {
                        if( callEstablishControlMethod( CU_Variables.ControlGroupsWithNestedControlGroups[i], applicationUri, undefined, undefined, true ) ) {
                            if( ListToBlockNested_Variables.length > 0 ) {
                                // Step 4: Issue a Write Request to a Variable referenced by ListToBlock of the nested ControlGroup.
                                if( ReadHelper.Execute( { NodesToRead: ListToBlockNested_Variables[0] } ) ) {
                                    if( !WriteHelper.Execute( { NodesToWrite: ListToBlockNested_Variables[0], OperationResults: TC_Variables.ExpectedResults } ) ) TC_Variables.Result = false;
                                }
                                else TC_Variables.Result = false;
                            }
                            else {
                                addSkipped( "No Variables available in ListToBlock of the nested ControlGroup '" + NestedControlGroup.NodeId + "'. Skipping Step 4." );
                                TC_Variables.Result = false;
                            }
                        }
                        else {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + CU_Variables.ControlGroupsWithNestedControlGroups[i].NodeId + "' was not successful. Aborting test." );
                            TC_Variables.Result = false;
                        }
                    }
                    // Step 5: Call ReleaseControl to cleanup the lock.
                    if( isDefined( NestedControlGroup.ReleaseControl ) ) {
                        if( !callReleaseControlMethod( NestedControlGroup ) ) {
                            addError( "Calling ReleaseControl method on ControlGroupType instance '" + NestedControlGroup.NodeId + "' was not successful." );
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
            else addLog( "ControlGroupType instance '" + NestedControlGroup.NodeId + "' has no EstablishControl method. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No nested ControlGroupType instance found that exposes the EstablishControl method. Skipping test." );
        }
    }
    else {
        addSkipped( "No ControlGroupType instance with a nested ControlGroup found in AddressSpace. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );