/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the Property AuthorUri exposes and uses the correct data type.
         Step 1: Read the Attribute Value of the Property AuthorUri and verify the data type.
         Step 2: Read the DataType Attribute and verify the DataType.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.UriString = new UaNodeId( 23751 );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].AuthorUri ) ) {
                TC_Variables.nothingTested = false;
                var AuthorUri_Value = CU_Variables.AllFunctionalEntities[i].AuthorUri.clone();
                AuthorUri_Value.AttributeId = Attribute.Value;
                var AuthorUri_DataType = CU_Variables.AllFunctionalEntities[i].AuthorUri.clone();
                AuthorUri_DataType.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: [ AuthorUri_Value, AuthorUri_DataType ] } ) )  {
                    // Step 1: Read the Attribute Value of the Property AuthorUri and verify the data type.
                    if( !Assert.Equal( Identifier.String, AuthorUri_Value.Value.Value.DataType, "Received unexpected DataType for Value attribute of AuthorUri" ) ) TC_Variables.Result = false;
                    // Step 2: Read the DataType Attribute and verify the DataType.
                    if( !Assert.Equal( TC_Variables.UriString, AuthorUri_DataType.Value.Value.toNodeId(), "Received unexpected DataType attribute of AuthorUri" ) ) TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'AuthorUri' property. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in the AddressSpace supports the 'AuthorUri' property. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );