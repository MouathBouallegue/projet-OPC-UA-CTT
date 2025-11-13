print( "\n\n\n***** CONFORMANCE UNIT 'A and C Branch' TEST SCRIPTS COMPLETE ******\n" );

if ( CUVariables.Branch.AlarmThreadStarted ){
    if ( isDefined( CUVariables.Branch.AlarmThread ) ){
        CUVariables.Branch.AlarmThread.End();
    }
}

Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'A and C Branch' TESTING COMPLETE ******\n" );