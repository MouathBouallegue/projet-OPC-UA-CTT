include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ConfigurationDataFolder Hierarchy";

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
        CU_Variables.AllFunctionalEntities = [];
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            CU_Variables.AllFunctionalEntities = CU_Variables.AllFunctionalEntities.concat( 
                CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities 
            );
        }
        CU_Variables.AllConfigurationDataFoldersWithSubFolders = GetAllConfigurationDataFoldersWithSubFolders();
    }
}
else stopCurrentUnit();

function GetAllConfigurationDataFoldersWithSubFolders() {
    var results = [];
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                // check for sub-folders
                var subFoldersFound = [];
                var children = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                if( children.length > 0 ) {
                    // add to SubFolders if node is of FolderType or a subtype
                    for( var c=0; c<children.length; c++ ) {
                        if( isNodeOfTypeOrSubType( children[c], new UaNodeId( Identifier.FolderType ) ) ) {
                            addLog( "Found ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' with sub-folder '" + children[c].NodeId + "'" );
                            subFoldersFound.push( children[c].clone() );
                        }
                    }
                }
                if( subFoldersFound.length > 0 ) {
                    results.push( CU_Variables.AllFunctionalEntities[i].ConfigurationData.clone() );
                    SetAllChildren_recursive( results[results.length-1] );
                    results[results.length-1].SubFolders = [];
                    for( var s=0; s<subFoldersFound.length; s++ ) results[results.length-1].SubFolders.push( subFoldersFound[s] );
                }
                else addLog( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no sub-folders (is empty). Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
    }
    return results;
}

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );