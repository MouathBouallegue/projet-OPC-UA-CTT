/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Browse forward and verify that the Subtype ClampBlockType of the AssetConnectorType is available
    Step 2: Verfiy that the Property Name is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        
        // Step 1: Browse forward and verify that the Subtype ClampBlockType of the AssetConnectorType is available
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType ) ) {
            
            // Step 2: Verfiy that the Property Name is available
            if( !isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType.Name ) ) { addError( "Step 2: Property 'Name' of the ClampBlockType is not available." ); TC_Variables.result = false; }
            
        }
        else {
            addError( "Step 1: Subtype 'ClampBlockType' of the AssetConnectorType is not available." );
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