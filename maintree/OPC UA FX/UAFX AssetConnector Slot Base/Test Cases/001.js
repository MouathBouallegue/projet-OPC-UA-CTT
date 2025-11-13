/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse AssetConnectorType in the ObjectTypes folder and verify that it is available.
    Step 1: Browse forward and verify that the Subtype SlotType of the AssetConnectorType is available
    Step 2: Verfiy that the Property Id is available
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Verify AssetConnectorType in the ObjectTypes folder is available
    if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType ) ) {
        
        // Step 1: Browse forward and verify that the Subtype SlotType of the AssetConnectorType is available
        if( isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType ) ) {
            
            // Step 2: Verfiy that the Property Id is available
            if( !isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.SlotType.Id ) ) { addError( "Step 2: Property 'Id' of the SlotType is not available." ); TC_Variables.result = false; }
            
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