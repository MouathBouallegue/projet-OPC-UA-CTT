/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the OperationalHealthAlarms folder and verify that it contains only
                 instances of AlarmConditionType or its subtypes.
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
            if( isDefined( CU_Variables.AllFunctionalEntities[i].OperationalHealthAlarms ) ) {
                var OperationalHealthAlarms_Items = GetChildNodes( CU_Variables.AllFunctionalEntities[i].OperationalHealthAlarms );
                if( OperationalHealthAlarms_Items.length > 0 ) {
                    TC_Variables.nothingTested = false;
                    for( var t=0; t<OperationalHealthAlarms_Items.length; t++ ) {
                        var typeDefinition = GetTypeDefinitionOfNode( OperationalHealthAlarms_Items[t] );
                        if( !typeDefinition.equals( new UaNodeId( Identifier.AlarmConditionType ) ) ) {
                            // if typedefinition is not AlarmConditionType, check if it is a subtype of it
                            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: typeDefinition, TypeNodeId: new UaNodeId( Identifier.AlarmConditionType ) } );
                            if( !IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                                addError( "Node '" + OperationalHealthAlarms_Items[t].NodeId + "' is neither of AlarmConditionType nor a subtype of it." );
                                TC_Variables.Result = false;
                            }
                            else addLog( "Node '" + OperationalHealthAlarms_Items[t].NodeId + "' is of subtype of AlarmConditionType" );
                        }
                        else addLog( "Node '" + OperationalHealthAlarms_Items[t].NodeId + "' is of type AlarmConditionType" );
                    }
                }
                else addLog( "Folder '" + CU_Variables.AllFunctionalEntities[i].OperationalHealthAlarms.NodeId + "' is empty. Skipping node." );
            }
            else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' is missing 'OperationalHealthAlarms' folder. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No FunctionalEntity in the AddressSpace has an 'OperationalHealthAlarms' folder containing at least one node to test. Skipping test." );
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