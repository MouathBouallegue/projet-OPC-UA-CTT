/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Verify that the Property Name of the AssetConnectorType is available.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedResults = new UaVariants( 1 );
    TC_Variables.ExpectedResults[0].setNodeId( new UaNodeId( Identifier.String ) );
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        // Step 1: Verify that the Property Name of the AssetConnectorType is available.
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.Name ) ) {
            // Verify that it has the DataType String
            CU_Variables.Test.BaseObjectType.AssetConnectorType.Name.AttributeId = Attribute.DataType;
            if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.Name } ) ) {
                if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.Name.Value.Value, "Step 1: DataType of property 'Name' is not String." ) ) TC_Variables.Result = false;
            }
        }
        else {
            addError( "Step 1: Property 'Name' of the AssetConnectorType is not available. Aborting test." );
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