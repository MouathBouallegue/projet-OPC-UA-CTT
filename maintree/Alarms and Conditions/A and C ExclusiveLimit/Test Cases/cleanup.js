print( "\n\n\n***** CONFORMANCE UNIT 'A and C ExclusiveLimit' TEST SCRIPTS COMPLETE ******\n" );

if ( isDefined( CUVariables.LimitHelper ) ) {
    CUVariables.LimitHelper.Shutdown();
}

Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'A and C ExclusiveLimit' TESTING COMPLETE ******\n" );