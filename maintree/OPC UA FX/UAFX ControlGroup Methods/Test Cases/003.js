/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify for every instance of the ControlGroupType that ReleaseControl Method
                  is supported.
    Requirements: An instance of the ControlGroupType is present and ReleaseControl is supported.
          Step 1: Browse the ReleaseControl node of any FunctionalEntity in the FunctionalEntityFolder.
          Step 2: Repeat previous steps for all instances of the ControlGroupsType.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Step 2: Repeat previous steps for all instances of the ControlGroupsType.
        for( var i=0; i < CU_Variables.ControlGroupType_Instances.length; i++ ) {
            
            // Step 1: Browse the ReleaseControl node of any FunctionalEntity in the FunctionalEntityFolder.
            if( !isDefined( CU_Variables.ControlGroupType_Instances[i].ReleaseControl ) ) {
                addError( "ReleaseControl method not found in ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'." );
            }
        }
    }
    else {
        addSkipped( "No ControlGroupType instances found in the address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_003 } );