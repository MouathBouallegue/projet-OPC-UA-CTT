/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ControlGroups folder and verify the  instances that are exposed.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;

    if( isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType ) ) {
        if( CU_Variables.AllFunctionalEntities.length > 0 ) {
            for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
                if( isDefined( CU_Variables.AllFunctionalEntities[i].ControlGroups ) ) {
                    TC_Variables.nothingTested = false;
                    var children = GetChildNodes( CU_Variables.AllFunctionalEntities[i].ControlGroups );
                    for( var c=0; c<children.length; c++ ) {
                        if( !isNodeOfTypeOrSubType( children[c], CU_Variables.Test.BaseObjectType.ControlGroupType ) ) {
                            addError( "ControlGroups folder '" + CU_Variables.AllFunctionalEntities[i].ControlGroups.NodeId + "' contains one or more nodes that a not an Object of type ControlGroupType." );
                            TC_Variables.Result = false;
                        }
                        if( !TC_Variables.Result ) break;
                    }
                }
                else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ControlGroups folder. Skipping node." );
            }
            if( TC_Variables.nothingTested ) {
                addSkipped( "None of the found FunctionalEntities expose a ControlGroups folder. Skipping test." );
                TC_Variables.Result = false;
            }
        }
        else {
            addSkipped( "No FunctionalEntities found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "ControlGroupType not found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );