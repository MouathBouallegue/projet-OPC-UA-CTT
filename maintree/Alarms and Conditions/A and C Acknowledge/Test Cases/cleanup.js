print( "\n\n\n***** CONFORMANCE UNIT 'A and C Acknowledge' TEST SCRIPTS COMPLETE ******\n" );

if ( isDefined( CUVariables.Err_004_ExtraSession ) ){
    CUVariables.Err_004_ExtraSession.Shutdown( CUVariables.Err_004_ExtraSession );
}

Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'A and C Acknowledge' TESTING COMPLETE ******\n" );