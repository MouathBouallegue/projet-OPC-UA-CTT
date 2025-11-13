include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX IAssetRevision VerifyAsset AssetIdentity";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( Settings.OPC_UA_FX.VerificationMode_Identity_supported ) {
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
            if( CU_Variables.AllTopLevelAssets.length == 0 ) {
                addSkipped( "No Assets found in the Assets folders of the AutomationComponents in the AddressSpace. Skipping CU." );
                stopCurrentUnit();
            }
            else CU_Variables.TestAsset = CU_Variables.AllTopLevelAssets[0];
        }
    }
    else {
        addSkipped( "VerificationMode AssetIdentity is not supported according to the settings. Skipping CU." );
        stopCurrentUnit();
    }
}
else stopCurrentUnit();
    
print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );