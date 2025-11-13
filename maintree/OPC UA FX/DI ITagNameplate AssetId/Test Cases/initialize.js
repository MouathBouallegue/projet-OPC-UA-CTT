include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "DI ITagNameplate AssetId";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        CU_Variables.AllTopLevelAssets = [];
        
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                CU_Variables.AllTopLevelAssets = CU_Variables.AllTopLevelAssets.concat( 
                    CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets 
                );
            }
            else _error.store( "AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' is missing mandatory 'Assets' folder" );
        }
        // find Assets with AssetId property to be used by the tests (for writing)
        CU_Variables.AllTopLevelAssets_Write = [];
        for( var i=0; i < CU_Variables.AllTopLevelAssets.length; i++ ) {
            if( isDefined( CU_Variables.AllTopLevelAssets[i].AssetId ) ) {
                CU_Variables.AllTopLevelAssets_Write.push( CU_Variables.AllTopLevelAssets[i].clone() );
                CU_Variables.AllTopLevelAssets_Write[CU_Variables.AllTopLevelAssets_Write.length-1].AssetId = CU_Variables.AllTopLevelAssets[i].AssetId.clone();
                ReadHelper.Execute( { NodesToRead: CU_Variables.AllTopLevelAssets_Write[CU_Variables.AllTopLevelAssets_Write.length-1].AssetId } );
                CU_Variables.AllTopLevelAssets_Write[CU_Variables.AllTopLevelAssets_Write.length-1].AssetId.OriginalValue = CU_Variables.AllTopLevelAssets_Write[CU_Variables.AllTopLevelAssets_Write.length-1].AssetId.Value.Value.clone();
            } 
        }
        Test.PostTestFunctions.push( revertToOriginalValues );
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );

// revert value of AssetId if usable CU_Variables.TestAsset was found
function revertToOriginalValues() {
    for( var r=0; r<CU_Variables.AllTopLevelAssets_Write.length; r++ ) {
        CU_Variables.AllTopLevelAssets_Write[r].AssetId.AttributeId = Attribute.Value;
        CU_Variables.AllTopLevelAssets_Write[r].AssetId.Value.Value = CU_Variables.AllTopLevelAssets_Write[r].AssetId.OriginalValue.clone();
        WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[r].AssetId, ReadVerification: false } );
    }
}