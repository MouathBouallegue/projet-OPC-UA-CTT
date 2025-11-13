include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AutomationComponent ConnectionEstablishment VerifyAsset";

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
            var allTopLevelAssetsOfAC = CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets;
            for( var fe=0; fe<allTopLevelAssetsOfAC.length; fe++ ) {
                allTopLevelAssetsOfAC[fe].ParentAutomationComponent = CU_Variables.Test.AutomationComponents[ac];
            }
            CU_Variables.AllTopLevelAssets = CU_Variables.AllTopLevelAssets.concat( allTopLevelAssetsOfAC );
        }
        if( CU_Variables.AllTopLevelAssets.length == 0 ) {
            addSkipped( "No Assets found in the Assets folders of the AutomationComponents in the AddressSpace. Skipping CU." );
            stopCurrentUnit();
        }
        else CU_Variables.TestAsset = CU_Variables.AllTopLevelAssets[0];
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );