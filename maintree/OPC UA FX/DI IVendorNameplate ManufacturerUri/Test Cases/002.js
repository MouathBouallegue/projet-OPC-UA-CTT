/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property ManufacturerUri uses correct data type.
    Step 1: Read the Attribute Value of the Property ManufacturerUri and verify the data type
    Step 2: Read the DataType Attribute and verify the DataType.
    Step 3: Repeat the previous steps for any Asset that exposes ManufacturerUri
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedResults = [];
    TC_Variables.ExpectedResults[0] = BuiltInType.String;
    TC_Variables.ExpectedResults[1] = new UaVariant();
    TC_Variables.ExpectedResults[1].setNodeId( new UaNodeId( Identifier.String ) );
    
    // Verify the Property ManufacturerUri uses correct data type.
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( isDefined( CU_Variables.AllTopLevelAssets[i].ManufacturerUri ) ) {
            
            TC_Variables.nothingTested = false;
            
            // Step 1: Read the Attribute Value of the Property ManufacturerUri and verify the data type
            CU_Variables.AllTopLevelAssets[i].ManufacturerUri.AttributeId = Attribute.Value;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].ManufacturerUri } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.AllTopLevelAssets[i].ManufacturerUri.Value.Value.DataType, "Step 1: DataType of the value of the property 'ManufacturerUri' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not String." ) ) TC_Variables.Result = false;
            }
            
            // Step 2: Read the DataType Attribute and verify the DataType.
            CU_Variables.AllTopLevelAssets[i].ManufacturerUri.AttributeId = Attribute.DataType;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].ManufacturerUri } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[1], CU_Variables.AllTopLevelAssets[i].ManufacturerUri.Value.Value, "Step 2: DataType of the property 'ManufacturerUri' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not String." ) ) TC_Variables.Result = false;
            }
            
        } 
    } // Step 3: Repeat the previous steps for any Asset that exposes ManufacturerUri
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the property ManufacturerUri. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );