function revertToOriginalValues() {
    print("\n\n\n\n~~~ Reverting scalar static nodes back to their original values ~~~\n\n\n");
    for (var i = 0; i < originalScalarValues.length; i++) originalScalarValues[i].Value.Value = originalScalarValues[i].OriginalValue.clone();
    WriteHelper.Execute({ NodesToWrite: originalScalarValues, ReadVerification: false });
}

print("\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TEST SCRIPTS COMPLETE ******\n");

if ( originalScalarValues !== null && originalScalarValues !== undefined && originalScalarValues.length !== 0 ) {
    revertToOriginalValues();
}
Test.Disconnect();

addLog( "VQT Support: " + UaVQTSupport.toString( VQTsupport ) );
print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TESTING COMPLETE ******\n" );