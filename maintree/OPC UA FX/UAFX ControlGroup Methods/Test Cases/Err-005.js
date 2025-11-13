/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call ReassignControl when no lock is active.
*/

function Test_Err_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {            
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // Call ReassignControl when no Lock is active.
            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReassignControl ) ) {
                TC_Variables.nothingTested = false;
                var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], null, undefined, undefined, true );
                if( callResult.success ) {
                    // LockStatus shall be -1(E_NotLocked)
                    if( !Assert.Equal( -1, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                }
                else {
                    addError( "Calling ReassignControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                    TC_Variables.Result = false;
                    break;
                }
            }
            else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no ReassignControl method. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No ControlGroup exposing ReassignControl method found. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_005 } );