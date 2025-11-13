/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that only strings containing alphanumeric characters can be written to the Property AssetId.
    Step 1: Write the Attribute Value of the Property AssetId for any Asset and use a special character
    Step 2: Repeat Step 1 for as many special characters as possible
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.specialCharacterString = "!§$%&/()=?*+<+#";
    TC_Variables.allSpecialCharactersArray = [];
    
    // create array of Strings containig all UTF-16 non-alphanumeric characters
    for( var i=0; i < 65536; i++ ) {
        if( i%2048 == 0 ) TC_Variables.allSpecialCharactersArray[Math.floor( i/2048 )] = "";
        // exclude 0-9, A-Z and a-z
        if( !( ( i >= 48 && i <= 57 ) || ( i >= 65 && i <= 90 ) || ( i >= 97 && i <= 122 ) ) ) {
            TC_Variables.allSpecialCharactersArray[Math.floor( i/2048 )] += String.fromCharCode( i );
        }
    }
 
    if( CU_Variables.AllTopLevelAssets_Write.length > 0 ) {
        for( var a=0; a<CU_Variables.AllTopLevelAssets_Write.length; a++ ) {
            addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets_Write[a].NodeId + "' ===" );
            
            // Step 1: Write the Attribute Value of the Property AssetId for any Asset and use a special character
            
            CU_Variables.AllTopLevelAssets_Write[a].AssetId.AttributeId = Attribute.Value;
            CU_Variables.AllTopLevelAssets_Write[a].AssetId.Value.Value.setString( TC_Variables.specialCharacterString ); 
            if( !WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[a].AssetId, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ) ], ReadVerification: false } ) ) TC_Variables.result = false;
            
            // Step 2: Repeat Step 1 for as many special characters as possible
            if( TC_Variables.result ) {
                for( var i=0; i < TC_Variables.allSpecialCharactersArray.length; i++ ) {
                    CU_Variables.AllTopLevelAssets_Write[a].AssetId.Value.Value.setString( TC_Variables.allSpecialCharactersArray[i] ); 
                    if( !WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[a].AssetId, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ) ], ReadVerification: false } ) ) { TC_Variables.result = false; break; }
                }
            }
            
            addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No Asset was found that supports the property AssetId. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );