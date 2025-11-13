/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ConfigurationData folder in every FunctionalEntity and verify
                 that at least one variable is exposed in any ConfigurationData folder.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].ConfigurationData ) ) {
                TC_Variables.nothingTested = false;
                // get all child nodes and check if at least one of them is of NodeClass Variable
                var children = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ConfigurationData );
                if( children.length > 0 ) {
                    // check if at least one node is of NodeClass Variable
                    for( var c=0; c<children.length; c++ ) {
                        if( children[c].NodeClass == NodeClass.Variable ) break;
                        if( c == children.length - 1 ) {
                            addError( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no variables." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "ConfigurationData folder '" + CU_Variables.AllFunctionalEntities[i].ConfigurationData.NodeId + "' exposes no variables (is empty)." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' does not expose the ConfigurationData folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "None of the FunctionalEntities found in AddressSpace exposes the ConfigurationData folder. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );