/* "H" related class objects and helpers, including:
        - function HostnameFromUrl( str ) 
        - function getHostnameFromUrn( str )
        - Hostnames object, including:
            - QueryHostnames = function( host )
            - QueryHostnames( hostname )
            - Contains = function( hostname )*/


var HOSTNAMES;
if( HOSTNAMES == null ) HOSTNAMES = new Hostnames();

/* Purpose: To simplify the querying of, and use of hostnames for testing against UA Server 
            Certificates, particularly in FindServers and/or GetEndpoints. */
function Hostnames( hostname ) {
    this.Host;            // the computer that was last queried
    this.Hostnames = [];  // the hostnames (string array)
    this.hostInf;         // holder for the HostInfo helper class
    this.osChecked = false;   // flag to indicate that a search was done, but failed, and not to repeat.

    // constructor defined at the bottom of the class

    // queries the hostnames on a given computer (name or IP address)
    this.QueryHostnames = function( host ) {
        if( host === undefined || host === null || host === "" || host === "undefined" ) host = "localhost";
        if( this.osChecked ) return;
        if( this.hostInf == null ) this.hostInf = new HostInfo();
        var result;
        result = this.hostInf.lookupHost( host );
        this.osChecked = true;
        if( result.isGood() ) {
            this.Host = host;
            var names = this.hostInf.hostName();
            var ips = this.hostInf.addresses();
            this.Hostnames = [].concat( names );
            for( var a=0; a<ips.length; a++ ) this.Hostnames.push( ips[a] );
        }
        else addError( "Error retrieving host info: " + this.hostInf.errorString() );
    }

    // queries the current cache to see if a specified name exists. Returns True/False.
    this.Contains = function( hostname ) {
        if( hostname === undefined || hostname === null ) return( false );
        if( this.Hostnames === null || this.Hostnames.length === 0 ) return( false );
        for( var i=0; i<this.Hostnames.length; i++ ) {
            if( this.Hostnames[i] == hostname ) return( true );
        }//for i...
        return( false );
    }
    this.QueryHostnames( hostname );
}// Hostnames class



/*  Retrieves the HOSTNAME from a URL
    Parameters:
        str = the URL to parse.
    Example URLs:
        opc.tcp://localhost:51210
        http://localhost:51211
        opc.tcp://localhost:51210/UA/SampleServer */
function HostnameFromUrl( str ) {
    if( str == undefined || str == null || str == "" ) return( "" );
    var re = new RegExp( '^(?:opc.tcp|http)(?:s)?\://([^/]+):', 'im' );
    var matches = str.match( re );
    if( matches !== null && matches.length !== undefined && matches.length > 0 ) return matches[1];
    else return( "" );
}



/*  Retrieves the HOSTNAME from a URN
    Parameters:
        str = the URL to parse.
    Example URNs:
        urn:localhost:OPCFoundation:SampleServer */
function getHostnameFromUrn( str ) {
    if( str == undefined || str == null || str == "" ) return( "" );
    var indexOfColon = str.indexOf( ":" );
    if( indexOfColon > 0 ) {
        var urnSplit = str.split( ":" );
        if( urnSplit !== null && urnSplit.length >= 3 ) {
            // we'll assume that the 2nd value in the Urn is the hostname because the first is the "urn:" prefix.
            return( urnSplit[1] );
        }
    }
    return( "" );
}