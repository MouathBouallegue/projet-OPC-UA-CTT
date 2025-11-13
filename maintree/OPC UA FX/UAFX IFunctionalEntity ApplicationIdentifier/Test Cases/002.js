/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the Property ApplicationIdentifier exposes and uses correct
                 DataType.
         Step 1: Read the Attribute Value of the Property ApplicationIdentifier and verify
                 the structure.
         Step 2: Read the DataType Attribute and verify the DataType.
         Step 3: Read the value of Attribute ValueRank.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // check if needed types are available in the server
    if( isDefined( CU_Variables.Test.Structure.ApplicationIdentifierDataType ) ) {
        // iterate through every top level FunctionalEntity
        if( CU_Variables.AllFunctionalEntities.length > 0 ) {
            for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
                if( isDefined( CU_Variables.AllFunctionalEntities[i].ApplicationIdentifier ) ) {
                    TC_Variables.nothingTested = false;
                    var ApplicationIdentifier_Value = CU_Variables.AllFunctionalEntities[i].ApplicationIdentifier.clone();
                    ApplicationIdentifier_Value.AttributeId = Attribute.Value;
                    var ApplicationIdentifier_DataType = CU_Variables.AllFunctionalEntities[i].ApplicationIdentifier.clone();
                    ApplicationIdentifier_DataType.AttributeId = Attribute.DataType;
                    var ApplicationIdentifier_ValueRank = CU_Variables.AllFunctionalEntities[i].ApplicationIdentifier.clone();
                    ApplicationIdentifier_ValueRank.AttributeId = Attribute.ValueRank;
                    if( ReadHelper.Execute( { NodesToRead: [ ApplicationIdentifier_Value, ApplicationIdentifier_DataType, ApplicationIdentifier_ValueRank ] } ) )  {
                        // Step 1: Read the Attribute Value of the Property ApplicationIdentifier and verify the data type.
                        notImplemented( "Step 1 not possible, as the FxVersion StructureDefinition decides the DataType of the interpreted Fields of the Extension object. It cannot mismatch." );
                        // Step 2: Read the DataType Attribute and verify the DataType.
                        if( !Assert.Equal( CU_Variables.Test.Structure.ApplicationIdentifierDataType.NodeId, ApplicationIdentifier_DataType.Value.Value.toNodeId(), "Received unexpected DataType attribute of ApplicationIdentifier" ) ) TC_Variables.Result = false;
                        // Step 3: Read the value of Attribute ValueRank.
                        if( !Assert.Equal( 1, ApplicationIdentifier_ValueRank.Value.Value.toInt32(), "Received unexpected ValueRank attribute for 'ApplicationIdentifier'" ) ) TC_Variables.Result = false;
                    }
                    else TC_Variables.Result = false;
                }
                else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'ApplicationIdentifier' property. Skipping node." );
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "No FunctionalEntity in the AddressSpace supports the 'ApplicationIdentifier' property. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No FunctionalEntities found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Type 'ApplicationIdentifierDataType' not found in server" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );