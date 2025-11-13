/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property AuthorAssignedVersion exposes and uses correct data
                 type.
         Step 1: Read the Attribute Value of the Property AuthorAssignedVersion and verify
                 the data type.
         Step 2: Read the DataType Attribute and verify the DataType.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // check if needed types are available in the server
    if( isDefined( CU_Variables.Test.Structure.FxVersion ) ) {
        // iterate through every top level FunctionalEntity
        if( CU_Variables.AllFunctionalEntities.length > 0 ) {
            for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
                if( isDefined( CU_Variables.AllFunctionalEntities[i].AuthorAssignedVersion ) ) {
                    TC_Variables.nothingTested = false;
                    var AuthorAssignedVersion_Value = CU_Variables.AllFunctionalEntities[i].AuthorAssignedVersion.clone();
                    AuthorAssignedVersion_Value.AttributeId = Attribute.Value;
                    var AuthorAssignedVersion_DataType = CU_Variables.AllFunctionalEntities[i].AuthorAssignedVersion.clone();
                    AuthorAssignedVersion_DataType.AttributeId = Attribute.DataType;
                    if( ReadHelper.Execute( { NodesToRead: [ AuthorAssignedVersion_Value, AuthorAssignedVersion_DataType ] } ) )  {
                        // Step 1: Read the Attribute Value of the Property AuthorAssignedVersion and verify the data type.
                        notImplemented( "Step 1 not possible, as the FxVersion StructureDefinition decides the DataType of the interpreted Fields of the Extension object. It cannot mismatch." );
                        // Step 2: Read the DataType Attribute and verify the DataType.
                        if( !Assert.Equal( CU_Variables.Test.Structure.FxVersion.NodeId, AuthorAssignedVersion_DataType.Value.Value.toNodeId(), "Received unexpected DataType attribute of AuthorAssignedVersion" ) ) TC_Variables.Result = false;
                    }
                    else TC_Variables.Result = false;
                }
                else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'AuthorAssignedVersion' property. Skipping node." );
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "No FunctionalEntity in the AddressSpace supports the 'AuthorAssignedVersion' property. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No FunctionalEntities found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Type 'FxVersion' not found in server" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );