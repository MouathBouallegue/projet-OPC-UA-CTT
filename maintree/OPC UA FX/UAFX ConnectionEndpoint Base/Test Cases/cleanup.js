print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TEST SCRIPTS COMPLETE ******\n" );

// Close temporary ConnectionEndpoints if created
for( var fe=0; fe<CU_Variables.AllFunctionalEntities.length; fe++ ) {
    if( isDefined( CU_Variables.AllFunctionalEntities[fe].TemporaryEndpointId ) ) {
        if( !callCloseConnectionsMethod( {
            AutomationComponent: CU_Variables.AllFunctionalEntities[fe].ParentAutomationComponent,
            ConnectionEndpoints: CU_Variables.AllFunctionalEntities[fe].TemporaryEndpointId
        } ).success ) addError( "Attempt to close temporary created ConnectionEndpoint '" + CU_Variables.AllFunctionalEntities[fe].TemporaryEndpointId + "' failed." );
        refreshBaseVariablesModelMap( CU_Variables.SessionThread );
    }
}

CU_Variables.SessionThread.End();
Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING COMPLETE ******\n" );

delete CU_Variables;