/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Write the Attribute Value of the Property ComponentName for any Asset and use as many as possible special characters. 
    Step 1: Write the Attribute Value of the Property ComponentName for any Asset and use as many as possible special characters
*/

function newLT( locale, value ) {
    var lt = new UaLocalizedText();
    lt.Locale = locale;
    lt.Text = value;
    return( lt );
}

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    TC_Variables.allSpecialCharactersArray_String = [];
    
    // create array of Strings containig all UTF-16 non-alphanumeric characters
    for( var i=0; i < 65536; i++ ) {
        if( i%2048 == 0 ) TC_Variables.allSpecialCharactersArray_String[Math.floor( i/2048 )] = "";
        // exclude 0-9, A-Z and a-z
        if( !( ( i >= 48 && i <= 57 ) || ( i >= 65 && i <= 90 ) || ( i >= 97 && i <= 122 ) ) ) {
            TC_Variables.allSpecialCharactersArray_String[Math.floor( i/2048 )] += String.fromCharCode( i );
        }
    }
    
    // convert String array to UaLocalizedText array
    TC_Variables.allSpecialCharactersArray_LocalizedText = []
    for( var i=0; i<TC_Variables.allSpecialCharactersArray_String.length; i++ ) TC_Variables.allSpecialCharactersArray_LocalizedText[i] = newLT( "", TC_Variables.allSpecialCharactersArray_String[i] );
 
    if( CU_Variables.AllTopLevelAssets_Write.length > 0 ) {
        for( var a=0; a<CU_Variables.AllTopLevelAssets_Write.length; a++ ) {
            addLog( "=== Start of test for Asset '" + CU_Variables.AllTopLevelAssets_Write[a].NodeId + "' ===" );
            
            if( isDefined( CU_Variables.AllTopLevelAssets_Write[a].ComponentName ) ) {
            
                // Step 1: Write the Attribute Value of the Property ComponentName for any Asset and use as many as possible special characters
                for( var i=0; i < TC_Variables.allSpecialCharactersArray_LocalizedText.length; i++ ) {
                    CU_Variables.AllTopLevelAssets_Write[a].ComponentName.Value.Value.setLocalizedText( TC_Variables.allSpecialCharactersArray_LocalizedText[i] ); 
                    if( !WriteHelper.Execute( { NodesToWrite: CU_Variables.AllTopLevelAssets_Write[a].ComponentName, ReadVerification: false } ) ) { TC_Variables.result = false; break; }
                }
                
            }
            else {
                addSkipped( "Asset '" + CU_Variables.AllTopLevelAssets_Write[a].NodeId + "' (used by this test) does not support the property ComponentName. Skipping test." );
                TC_Variables.result = false;
            }
            
            addLog( "=== End of test for Asset '" + CU_Variables.AllTopLevelAssets[a].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No Asset was found that supports the property ComponentName. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );