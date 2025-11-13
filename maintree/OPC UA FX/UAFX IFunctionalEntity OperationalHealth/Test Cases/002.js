/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the Property OperationalHealth exposes and uses the correct
                 data type.
         Step 1: Read the Attribute Value of the Property OpertionalHealth and verify the
                 data type.
         Step 2: Read the DataType Attribute and verify the DataType.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.UriString = new UaNodeId( 23751 );
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].OperationalHealth ) ) {
                TC_Variables.nothingTested = false;
                var OperationalHealth_Value = CU_Variables.AllFunctionalEntities[i].OperationalHealth.clone();
                OperationalHealth_Value.AttributeId = Attribute.Value;
                var OperationalHealth_DataType = CU_Variables.AllFunctionalEntities[i].OperationalHealth.clone();
                OperationalHealth_DataType.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: [ OperationalHealth_Value, OperationalHealth_DataType ] } ) )  {
                    // Step 1: Read the Attribute Value of the Property OperationalHealth and verify the data type.
                    if( !Assert.Equal( Identifier.UInt32, OperationalHealth_Value.Value.Value.DataType, "Received unexpected DataType for Value attribute of OperationalHealth" ) ) TC_Variables.Result = false;
                    // Step 2: Read the DataType Attribute and verify the DataType.
                    if( !Assert.Equal( CU_Variables.Test.UInt32.OperationalHealthOptionSet.NodeId, OperationalHealth_DataType.Value.Value.toNodeId(), "Received unexpected DataType attribute of OperationalHealth" ) ) TC_Variables.Result = false;
                }
                else TC_Variables.Result = false;
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'OperationalHealth' property. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in the AddressSpace supports the 'OperationalHealth' property. Skipping test." );
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