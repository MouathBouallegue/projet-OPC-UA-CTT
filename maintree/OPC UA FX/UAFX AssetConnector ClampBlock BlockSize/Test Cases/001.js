/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available
    Step 2: Browse forward and verify that the Subtype ClampBlockType of the AssetConnectorType is available
    Step 3: Verify that the Property BlockSize of the ClampBlockType is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedResults = new UaVariants( 1 );
    TC_Variables.ExpectedResults[0].setNodeId( new UaNodeId( Identifier.UInt16 ) );
    
    // Step 1: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        
        // Step 2: Browse forward and verify that the Subtype ClampBlockType of the AssetConnectorType is available
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType ) ) {
            
            // Step 3: Verify that the Property BlockSize of the ClampBlockType is available
            if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize ) ) {
                // Verify that it has the DataType UInt16
                CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize } ) ) {
                    if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize.Value.Value, "Step 3: DataType of property 'BlockSize' of the ClampBlockType is not UInt16." ) ) TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 3: Property 'BlockSize' of the ClampBlockType is not available." );
                TC_Variables.result = false;
            }
            
        }
        else {
            addError( "Step 2: Subtype 'ClampBlockType' of the AssetConnectorType is not available." );
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