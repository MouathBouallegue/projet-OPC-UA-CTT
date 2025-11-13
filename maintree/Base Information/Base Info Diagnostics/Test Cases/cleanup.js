print( CU_NAME + " COMPLETE ******\n" );

// unset the diagnostics so we do not burden the server with unnecessary overhead
if( _enabledDiagnosticsSet ) {
    print( "Disabling Diagnostics in the Server." );
    _enabledFlagNode.Value.Value.setBoolean( false );
    WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNotWritable ] ) } );
}

Test.Disconnect();

Test.PostTestFunctions = [];

print( CU_NAME + " COMPLETE ******\n" );