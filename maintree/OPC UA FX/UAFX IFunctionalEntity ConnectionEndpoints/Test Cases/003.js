/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ConnectionsEndpoints folder and verify that all mandatory nodes
                 exist.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType ) ) {
        if( CU_Variables.AllFunctionalEntities.length > 0 ) {
            for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
                if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                    TC_Variables.nothingTested = false;
                    var children = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints );
                    var commHealthCount = 0;
                    for( var c=0; c<children.length; c++ ) {
                        switch( children[c].NodeClass ) {
                            case NodeClass.Variable:
                                if( children[c].BrowseName.Name == "CommHealth" ) {
                                    commHealthCount++;
                                    if( commHealthCount > 1 ) {
                                        addError( "ConnectionEndpoints folder '" + CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints.NodeId + "' contains more than one 'CommHealth' variables." );
                                        TC_Variables.Result = false;
                                    }
                                }
                                else {
                                    addError( "ConnectionEndpoints folder '" + CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints.NodeId + "' contains a Variable other than 'CommHealth'." );
                                    TC_Variables.Result = false;
                                }
                            break;
                            case NodeClass.Object:
                                if( !isNodeOfTypeOrSubType( children[c], CU_Variables.Test.BaseObjectType.ConnectionEndpointType ) ) {
                                    addError( "ConnectionEndpoints folder '" + CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints.NodeId + "' contains Objects that are not of type ConnectionEndpointType or subtype." );
                                    TC_Variables.Result = false;
                                }
                            break;
                            default:
                                addError( "ConnectionEndpoints folder '" + CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints.NodeId + "' contains nodes other than Objects and Variables." );
                                TC_Variables.Result = false;
                        }
                        if( !TC_Variables.Result ) break;
                    }
                }
                else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder. Skipping node." );
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "None of the found FunctionalEntities expose a ConnectionEndpoints folder. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No FunctionalEntities found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "ConnectionEndpointType not found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );