/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ConfigurationDataFolder of any instance of the FunctionalEntity
                 Type and verify that sub-Folders exist.
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    if( CU_Variables.AllConfigurationDataFoldersWithSubFolders.length == 0 ) {
        addError( "No ConfigurationData folder exposing a sub-folder found in AddressSpace." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );