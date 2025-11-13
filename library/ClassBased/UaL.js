/* Includes: 
    UaLiteralOperand.New = function( args ) */

UaLiteralOperand.New = function( args ) {
    var l = new UaLiteralOperand();
    if( isDefined( args ) && isDefined( args.Value ) ) {
        l.Value = args.Value;
    };
    l.toExtensionObject = function() {
        var e = new UaExtensionObject();
        e.setLiteralOperand( this );
        return( e );
    };
    return( l );
}

UaLocalizedText.toJson = function( args ) {
    if( args == undefined || args == null ) args = new Object();
    if( args.Locale == undefined || args.Locale == null ) args.Locale = "";
    if( args.Text   == undefined || args.Text   == null ) args.Text   = "";
    var s = "{ Locale: " + args.Locale + ", Text: \"" + args.Text + "\" }";
    return( s );
}

UaLocalizedText.New = function ( args ) {
    var localizedText = new UaLocalizedText;
    if ( isDefined( args ) ) {
        if ( isDefined( args.Text ) ) localizedText.Text = args.Text;
        if ( isDefined( args.Locale ) ) localizedText.Locale = args.Locale;
    }
    return localizedText;
}