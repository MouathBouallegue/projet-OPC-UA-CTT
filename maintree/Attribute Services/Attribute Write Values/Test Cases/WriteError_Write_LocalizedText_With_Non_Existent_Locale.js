/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a LocalizedText with a valid value, but specify a localeId that is known to not be supported, e g. aardvark. */

function clearAllTexts( item ) {
    var lt = new UaLocalizedText();
    lt.Locale = "";
    lt.Text = "";
    var itemClone = MonitoredItem.Clone( item );
    itemClone.Value.Value.setLocalizedText( lt );
    WriteHelper.Execute( { NodesToWrite: itemClone, ReadVerification: false } ); // verify that all texts have been cleared
}

Test.Execute( { Procedure: function test() {
    const SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/LocalizedText";
    var item = MonitoredItem.fromSettingsExt( { Settings: [ SETTING ], AttributeId: Attribute.Value, Writable: true, SkipCreateSession: true } )[0];
    if( !isDefined( item ) ) { 
        addSkipped( "LocalizedText not configured or not writable. Please check setting: " + SETTING + "." );
        return( false ); 
    };

    // capture the original value so that we can revert to it after the test
    ReadHelper.Execute( { NodesToRead: item } );
    item.OriginalValue = item.Value.Value.clone();

    clearAllTexts( item );

    // construct a value to write
    var invalidLT = new UaLocalizedText();
    invalidLT.Text = "Hello World!";
    invalidLT.Locale = "??";
    item.Value.Value.setLocalizedText( invalidLT );

    // define the expected results
    var expectedResults = [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadInvalidArgument, StatusCode.BadWriteNotSupported, StatusCode.BadSyntaxError ] ) ];
    WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectedResults, CheckNotSupported: true, ReadVerification: false } );

    clearAllTexts( item );

    // now revert the values
    item.Value.Value = item.OriginalValue;
    return( WriteHelper.Execute( { NodesToWrite: item, ReadVerification: false } ) );
} } );