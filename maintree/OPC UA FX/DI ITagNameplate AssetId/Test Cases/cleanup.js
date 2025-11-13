print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TEST SCRIPTS COMPLETE ******\n" );

CU_Variables.SessionThread.End();
Test.PostTestFunctions = [];
Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING COMPLETE ******\n" );

delete CU_Variables;