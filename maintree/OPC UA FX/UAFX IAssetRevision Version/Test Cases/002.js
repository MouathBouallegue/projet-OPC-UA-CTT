/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the Property MajorAssetVersion exposes and uses correct data type.
    Step 1: Read the Attribute Value of the Property MajorAssetVersion and verify the data type
    Step 2: Read the DataType Attribute and verify the DataType
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Run test for all AutomationComponents found in AddressSpace
    if( CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                
                TC_Variables.nothingTested = true;
                
                TC_Variables.ExpectedResults = [];
                TC_Variables.ExpectedResults[0] = BuiltInType.UInt16;
                TC_Variables.ExpectedResults[1] = new UaVariant();
                TC_Variables.ExpectedResults[1].setNodeId( new UaNodeId( Identifier.UInt16 ) );
                
                // Verify the Property MajorAssetVersion exposes and uses correct data type.
                // iterate through assets
                for( var i=0; i < CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length; i++ ) {
                    if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion ) ) {
                        
                        TC_Variables.nothingTested = false;
                        
                        // Step 1: Read the Attribute Value of the Property MajorAssetVersion and verify the data type
                        CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion.AttributeId = Attribute.Value;
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion } ) ) {
                            if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion.Value.Value.DataType, "Step 1: DataType of the value of the property 'MajorAssetVersion' of the Asset '" + CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].NodeId + "' is not UInt16." ) ) TC_Variables.Result = false;
                        }
                        
                        // Step 2: Read the DataType Attribute and verify the DataType
                        CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion.AttributeId = Attribute.DataType;
                        if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion } ) ) {
                            if( !Assert.Equal( TC_Variables.ExpectedResults[1], CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].MajorAssetVersion.Value.Value, "Step 2: DataType of the property 'MajorAssetVersion' of the Asset '" + CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].NodeId + "' is not UInt16." ) ) TC_Variables.Result = false;
                        }
                        
                    } 
                }
                
                if( TC_Variables.nothingTested ) { addSkipped( "No Asset found that supports the property MajorAssetVersion. Skipping test." ); TC_Variables.result = false; }
            
            }
            else _error.store( "AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'Assets' folder" );
            
            addLog( "=== End of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No AutomationComponent found in AddressSpace. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );