print( "\n\n\n***** CONFORMANCE UNIT 'A and C Suppression' TEST SCRIPTS COMPLETE ******\n" );


if ( isDefined( CUVariables.Suppress.TrueEventMonitor ) ){
    CUVariables.Suppress.ShutdownEventMonitor( CUVariables.Suppress.TrueEventMonitor );
}

if ( isDefined( CUVariables.Suppress.FalseEventMonitor ) ){
    CUVariables.Suppress.ShutdownEventMonitor( CUVariables.Suppress.FalseEventMonitor );
}

Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'A and C Suppression' TESTING COMPLETE ******\n" );