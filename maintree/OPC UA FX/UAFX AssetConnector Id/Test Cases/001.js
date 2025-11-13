/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Verify that the Property Id of the AssetConnectorType is available.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedResults = new UaVariants( 1 );
    TC_Variables.ExpectedResults[0].setNodeId( new UaNodeId( Identifier.UInt16 ) );
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        // Step 1: Verify that the Property Id of the AssetConnectorType is available.
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.Id ) ) {
            // Verify that it has the DataType UInt16
            CU_Variables.Test.BaseObjectType.AssetConnectorType.Id.AttributeId = Attribute.DataType;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.Id } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.Id.Value.Value, "Step 1: DataType of property 'Id' is not UInt16." ) ) TC_Variables.Result = false;
            }
        }
        else {
            addError( "Step 1: Property 'Id' of the AssetConnectorType is not available. Aborting test." );
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