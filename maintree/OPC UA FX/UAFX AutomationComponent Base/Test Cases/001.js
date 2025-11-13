/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that at least one AutomationComponent is available.
         Step 1: Browse the FxRoot folder.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Check if FxRoot exists
    var FxRootFolder_NodeId = CheckHasReferenceTo( {
        Node: new MonitoredItem( new UaNodeId( Identifier.ObjectsFolder ) ),
        Name: "FxRoot",
        NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex,
        ReferenceTypeId: new UaNodeId( Identifier.Organizes )
    } );
    
    if( isDefined( FxRootFolder_NodeId ) ) {
        
        // Step 1: Browse the FxRoot folder
        var FxRoot_mI = new MonitoredItem( FxRootFolder_NodeId );
        var FxRootChildren = GetChildNodes( FxRoot_mI );
        
        var AC_found = false;
        
        for( var i=0; i<FxRootChildren.length; i++ ) {
            if( GetTypeDefinitionOfNode( FxRootChildren[i] ).equals( new UaNodeId( CU_Variables.Test.BaseObjectType.AutomationComponentType.NodeId ) ) ) {
                AC_found = true;
                break;
            }
        }
        if( !AC_found ) {
            addError( "Step 1: No instance of AutomationComponentType found in FxRoot" );
            TC_Variables.Result = false;
        }
        
    }
    else {
        addError( "No FxRoot folder found in the Objects folder of the server. Aborting test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );