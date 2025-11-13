/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the FxRoot folder is exposed in the Servers AddressSpace 
         Step 1: Recursively Browse the Objects object and search for the FxRoot object
         Step 2: Read the NodeId of the FxRoot Object
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    TC_Variables.ExpectedFxRoot_WellKnown_NodeId = new UaNodeId.fromString( "ns=" + UAFXBaseVariables.FXDataNamespaceIndex + ";i=71" );
    
    // Step 1: Recursively Browse the Objects object and search for the FxRoot object
    var objectChildren = GetChildNodes( new MonitoredItem( new UaNodeId( Identifier.ObjectsFolder ) ) );
    if( objectChildren.length > 0 ) {
        for( var i=0; i<objectChildren.length; i++ ) {
            if( objectChildren[i].BrowseName.Name == "FxRoot" ) {
                // Check TypeDefinition
                if( !Assert.Equal( new UaNodeId( Identifier.FolderType ), GetTypeDefinitionOfNode( objectChildren[i] ), "Step 1: Received unexpected TypeDefinition for FxRoot folder" ) ) TC_Variables.Result = false;
                // Step 2: Read the NodeId of the FxRoot Object
                if( UAFXBaseVariables.FXDataNamespaceIndex != -1 ) {
                    if( !Assert.Equal( TC_Variables.ExpectedFxRoot_WellKnown_NodeId, objectChildren[i].NodeId, "Step 2: Received unexpected NodeId for FxRoot folder" ) ) TC_Variables.Result = false;
                }
                else {
                    addError( "Step 2: The NodeId of the FxRoot folder cannot be determined as the Namespace 'http://opcfoundation.org/UA/FX/Data/' was not found in the server. Skipping Step 2." );
                    TC_Variables.Result = false;
                }
                break;
            }
            if( i == objectChildren.length - 1 ) {
                addError( "Step 1: Could not find Node with BrowseName 'FxRoot' in the objects folder of the server." );
                TC_Variables.Result = false;
            }
        }
    }
    else {
        addError( "Step 1: No nodes found in Objects folder." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );