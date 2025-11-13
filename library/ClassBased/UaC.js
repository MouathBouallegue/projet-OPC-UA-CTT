/* Helpers include: 
    - UaContentFilter.New = function( args )
    - UaContentFilterElement.New = function( args ) */

UaContentFilter.New = function( args ) {
    var ucf = new UaContentFilter();
    if( args != undefined && args != null ) {
        if( args.Elements != undefined && args.Elements != null && args.Elements.length != undefined && args.Elements.length > 0 ) {
            for( var e=0; e<args.Elements.length; e++ ) { // iterate thru each element
                ucf.Elements[e] = args.Elements[e];
            }//for e...
        }
    }
    return( ucf );
}

UaContentFilterElement.New = function( args ) {
    var uac = new UaContentFilterElement();
    if( args != undefined && args != null ) {
        // set the FilterOperator?
        if( args.FilterOperator != undefined && args.FilterOperator != null ) uac.FilterOperator = args.FilterOperator;
        // set the FilterOperands?
        if( args.FilterOperands != undefined && args.FilterOperands != null && args.FilterOperands.length != undefined && args.FilterOperands.length > 0 ) {
            for( var f=0; f<args.FilterOperands.length; f++ ) uac.FilterOperands[f] = args.FilterOperands[f];
        }
    }
    uac.ToExtensionObject = function() {
        var xo = new UaExtensionObject();
        xo.setEventFilter( this );
        return( xo );
    }
    return( uac );
}
