print( "\n\n\n***** CONFORMANCE UNIT 'Data Access Analog' TEST SCRIPTS COMPLETE ******\n" );

// revert all writable values back to their initial state
if( WritableAnalogItems !== null && WritableAnalogItems.length > 0 && WritableAnalogItems[0].InitialValue !== undefined ) {
    for( var i=0; i<WritableAnalogItems.length; i++ ) WritableAnalogItems[i].Value.Value = WritableAnalogItems[i].InitialValue.clone();
    WriteHelper.Execute( { NodesToWrite: WritableAnalogItems, ReadVerification: false } );
}

Test.Disconnect();
Test.PostTestFunctions = [];

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access Analog' TESTING COMPLETE ******\n" );