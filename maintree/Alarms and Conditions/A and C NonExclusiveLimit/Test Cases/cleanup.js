print( "\n\n\n***** CONFORMANCE UNIT 'A and C NonExclusiveLimit' TEST SCRIPTS COMPLETE ******\n" );

if ( isDefined( CUVariables.LimitHelper ) ) {
    CUVariables.LimitHelper.Shutdown();
}

Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'A and C NonExclusiveLimit' TESTING COMPLETE ******\n" );