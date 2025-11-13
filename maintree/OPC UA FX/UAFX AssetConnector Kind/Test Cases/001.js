/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Browse forward to Subtype SocketType of the AssetConnectorType
    Step 2: Verify that the Property Kind of the SocketType is available
    Step 3: Browse forward to Subtype ClampType of the AssetConnectorType
    Step 4: Verify that the Property Kind of the ClampType is available
    Step 5: Browse forward to Subtype ClampBlockType of the AssetConnectorType
    Step 6: Verify that the Property Kind of the ClampBlockType is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.ExpectedResults = new UaVariants( 1 );
    TC_Variables.ExpectedResults[0].setNodeId( new UaNodeId( Identifier.UInt16 ) );
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        
        // Step 1: Browse forward to Subtype SocketType of the AssetConnectorType
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SocketType ) ) {
            
            // Step 2: Verify that the Property Kind of the SocketType is available
            if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SocketType.Kind ) ) {
                // Verify that it has the DataType UInt16
                CU_Variables.Test.BaseObjectType.AssetConnectorType.SocketType.Kind.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.SocketType.Kind } ) ) {
                    if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.SocketType.Kind.Value.Value, "Step 2: DataType of property 'Kind' of the SocketType is not UInt16." ) ) TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 2: Property 'Kind' of the SocketType is not available." );
                TC_Variables.result = false;
            }
            
        }
        else {
            addError( "Step 1: Subtype 'SocketType' of the AssetConnectorType is not available." );
            TC_Variables.result = false;
        }
        
        // Step 3: Browse forward to Subtype ClampType of the AssetConnectorType
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampType ) ) {
            
            // Step 4: Verify that the Property Kind of the ClampType is available
            if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampType.Kind ) ) {
                // Verify that it has the DataType UInt16
                CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampType.Kind.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampType.Kind } ) ) {
                    if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampType.Kind.Value.Value, "Step 4: DataType of property 'Kind' of the ClampType is not UInt16." ) ) TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 4: Property 'Kind' of the ClampType is not available." );
                TC_Variables.result = false;
            }
            
        }
        else {
            addError( "Step 3: Subtype 'ClampType' of the AssetConnectorType is not available." );
            TC_Variables.result = false;
        }
        
        // Step 5: Browse forward to Subtype ClampBlockType of the AssetConnectorType
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType ) ) {
            
            // Step 6: Verify that the Property Kind of the ClampBlockType is available
            if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.Kind ) ) {
                // Verify that it has the DataType UInt16
                CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.Kind.AttributeId = Attribute.DataType;
                if( ReadHelper.Execute( { NodesToRead: CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.Kind } ) ) {
                    if( !Assert.Equal( TC_Variables.ExpectedResults[0], CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.Kind.Value.Value, "Step 6: DataType of property 'Kind' of the ClampBlockType is not UInt16." ) ) TC_Variables.Result = false;
                }
            }
            else {
                addError( "Step 6: Property 'Kind' of the ClampBlockType is not available." );
                TC_Variables.result = false;
            }
            
        }
        else {
            addError( "Step 5: Subtype 'ClampBlockType' of the AssetConnectorType is not available." );
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