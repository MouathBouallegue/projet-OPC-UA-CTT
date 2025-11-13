/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Browse SlotType in the AssetConnectorType Folder and verify that is available
    Step 2: Verify that the Property LogicalId of the SlotType is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedResults = new UaVariants( 1 );
    TC_Variables.ExpectedResults[0].setNodeId( new UaNodeId( Identifier.UInt16 ) );
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        
        // Step 1: Browse SlotType in the AssetConnectorType Folder and verify that is available
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType ) ) {
            
            // Step 2: Verify that the Property LogicalId of the SlotType is available
            if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType.LogicalId ) ) {
                // Verify that it has the DataType UInt16
                CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType.LogicalId.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType.LogicalId } ) ) {
                    if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType.LogicalId.Value.Value, "Step 2: DataType of property 'LogicalId' of the SlotType is not UInt16." ) ) TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 2: Property 'LogicalId' of the SlotType is not available." );
                TC_Variables.result = false;
            }
            
        }
        else {
            addError( "Step 1: Subtype 'SlotType' of the AssetConnectorType is not available." );
            TC_Variables.result = false;
        }
        
    }
    else {
        addError( "AssetConnectorType is not available in the ObjectTypes folder. Aborting test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );