/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property AuthorAssignedIdentifier exposes and uses correct data
                 type.
         Step 1: Read the Attribute Value of the Property AuthorAssignedIdentifier and verify
                 the data type.
         Step 2: Read the DataType Attribute and verify the DataType.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].AuthorAssignedIdentifier ) ) {
                TC_Variables.nothingTested = false;
                var AuthorAssignedIdentifier_Value = CU_Variables.AllFunctionalEntities[i].AuthorAssignedIdentifier.clone();
                AuthorAssignedIdentifier_Value.AttributeId = Attribute.Value;
                var AuthorAssignedIdentifier_DataType = CU_Variables.AllFunctionalEntities[i].AuthorAssignedIdentifier.clone();
                AuthorAssignedIdentifier_DataType.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: [ AuthorAssignedIdentifier_Value, AuthorAssignedIdentifier_DataType ] } ) )  {
                    // Step 1: Read the Attribute Value of the Property AuthorAssignedIdentifier and verify the data type.
                    if( !Assert.Equal( Identifier.String, AuthorAssignedIdentifier_Value.Value.Value.DataType, "Received unexpected DataType for Value attribute of AuthorAssignedIdentifier" ) ) TC_Variables.Result = false;
                    // Step 2: Read the DataType Attribute and verify the DataType.
                    if( !Assert.Equal( new UaNodeId( Identifier.String ), AuthorAssignedIdentifier_DataType.Value.Value.toNodeId(), "Received unexpected DataType attribute of AuthorAssignedIdentifier" ) ) TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'AuthorAssignedIdentifier' property. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in the AddressSpace supports the 'AuthorAssignedIdentifier' property. Skipping test." );
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