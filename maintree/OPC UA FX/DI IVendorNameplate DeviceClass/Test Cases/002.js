/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property DeviceClass exposes and uses correct data type.
    Step 1: Read the Attribute Value of the Property DeviceClass and verify the data type
    Step 2: Read the DataType Attribute and verify the DataType
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedResults = [];
    TC_Variables.ExpectedResults[0] = BuiltInType.String;
    TC_Variables.ExpectedResults[1] = new UaVariant();
    TC_Variables.ExpectedResults[1].setNodeId( new UaNodeId( Identifier.String ) );
    
    // Verify the Property DeviceClass exposes and uses correct data type.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( isDefined( CU_Variables.AllTopLevelAssets[i].DeviceClass ) ) {
            
            TC_Variables.nothingTested = false;
            
            // Step 1: Read the Attribute Value of the Property DeviceClass and verify the data type
            CU_Variables.AllTopLevelAssets[i].DeviceClass.AttributeId = Attribute.Value;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].DeviceClass } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.AllTopLevelAssets[i].DeviceClass.Value.Value.DataType, "Step 1: DataType of the value of the property 'DeviceClass' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not String." ) ) TC_Variables.Result = false;
            }
            
            // Step 2: Read the DataType Attribute and verify the DataType
            CU_Variables.AllTopLevelAssets[i].DeviceClass.AttributeId = Attribute.DataType;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].DeviceClass } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[1], CU_Variables.AllTopLevelAssets[i].DeviceClass.Value.Value, "Step 2: DataType of the property 'DeviceClass' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not String." ) ) TC_Variables.Result = false;
            }
            
        } 
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the property DeviceClass. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );