/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the TypesFolder and verify that the ApplicationId data type is present.
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( !isDefined( CU_Variables.Test.Structure.Union.ApplicationId ) ) {
        addError( "Type 'ApplicationId' is missing in the TypesFolder." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );