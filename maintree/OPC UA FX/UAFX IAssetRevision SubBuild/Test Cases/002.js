/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property SubBuildAssetNumber exposes and uses correct data type.
    Step 1: Read the Attribute Value of the Property SubBuildAssetNumber and verify the data type
    Step 2: Read the DataType Attribute and verify the DataType
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedResults = [];
    TC_Variables.ExpectedResults[0] = BuiltInType.UInt16;
    TC_Variables.ExpectedResults[1] = new UaVariant();
    TC_Variables.ExpectedResults[1].setNodeId( new UaNodeId( Identifier.UInt16 ) );
    
    // Verify the Property SubBuildAssetNumber exposes and uses correct data type.
    // iterate through assets
    for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
        if( isDefined( CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber ) ) {
            
            TC_Variables.nothingTested = false;
            
            // Step 1: Read the Attribute Value of the Property SubBuildAssetNumber and verify the data type
            CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber.AttributeId = Attribute.Value;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber.Value.Value.DataType, "Step 1: DataType of the value of the property 'SubBuildAssetNumber' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not UInt16." ) ) TC_Variables.Result = false;
            }
            
            // Step 2: Read the DataType Attribute and verify the DataType
            CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber.AttributeId = Attribute.DataType;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[1], CU_Variables.AllTopLevelAssets[i].SubBuildAssetNumber.Value.Value, "Step 2: DataType of the property 'SubBuildAssetNumber' of the Asset '" + CU_Variables.AllTopLevelAssets[i].NodeId + "' is not UInt16." ) ) TC_Variables.Result = false;
            }
            
        } 
    }
    
    if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the property SubBuildAssetNumber. Skipping test." ); TC_Variables.result = false; }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );