/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Walk through the AddressSpace and verify that nested ControlGroups exist.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.ControlGroupsWithNestedControlGroups.length == 0 ) {
        addError( "No ControlGroupType instance with a nested ControlGroup found in AddressSpace" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );