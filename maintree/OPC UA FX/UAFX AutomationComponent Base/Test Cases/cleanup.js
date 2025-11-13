print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TEST SCRIPTS COMPLETE ******\n" );

refreshBaseVariablesModelMap( CU_Variables.SessionThread );

// Cleanup PubSubConfig
UaOpcServer.SetCurrentPubSubConfig( new UaPubSubConfiguration2DataType() );

CU_Variables.SessionThread.End();
Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING COMPLETE ******\n" );

delete CU_Variables;