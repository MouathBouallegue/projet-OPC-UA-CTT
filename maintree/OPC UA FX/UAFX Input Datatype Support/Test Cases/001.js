/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the required DataTypes are listed in the types system
         Step 1: Browse the DataTypes folder
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the DataTypes folder
    for( var n=0; n<CU_Variables.RequiredDataTypes.length; n++ ) {
        if( !Assert.True( NodeExistsInAddressSpace( CU_Variables.RequiredDataTypes[n] ), "Step 1: Server is missing DataType '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "'" ) ) TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );