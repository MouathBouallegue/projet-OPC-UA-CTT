/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call EstablishControl for an instance of ControlGroupType that is already
                 locked.
*/

function Test_Err_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {            
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // Call EstablishControl method with LockContext set to a valid ApplicationUri.
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
                    // Call EstablishControl method again to get LockStatus E_AlreadyBlocked
                    var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], applicationUri );
                    if( callResult.success ) {
                        // LockStatus shall be -1(E_AlreadyLocked)
                        if( !Assert.Equal( -1, callResult.LockStatus, "Received unexpected result for LockStatus after calling EstablishControl a second time" ) ) TC_Variables.Result = false;
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
            addSkipped( "No ControlGroup exposing EstablishControl method found. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_001 } );