/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call ReleaseControl when no Lock is active.
*/

function Test_Err_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {            
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // Call ReleaseControl when no Lock is active.
            if( isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                TC_Variables.nothingTested = false;
                var callResult = callReleaseControlMethod( CU_Variables.ControlGroupType_Instances[i] );
            }
            else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no ReleaseControl method. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No ControlGroup exposing ReleaseControl method found. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_003 } );