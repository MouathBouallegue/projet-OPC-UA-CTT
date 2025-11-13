/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de

    Description:
        Set endpointUrl = null.

    Expected results:
        Service result is Good and contains a valid default endpointUrl.
        Note: The default endpointUrl must be valid. 0.0.0.0, 255.255.255.255: and emtpy hostnames are not valid endpointUrls.
*/

function getEndpointsErr001() {
    if( GetEndpointsHelper.Execute2( { EndpointUrl: "null" ,ExpectedResults: new ExpectedAndAcceptedResults( StatusCode.Good ) } ) ) {
        if( GetEndpointsHelper.Response.Endpoints.length != 0 ) {
            
            for( var i = 0; i < GetEndpointsHelper.Response.Endpoints.length; i++ ) {
                var urlString = GetEndpointsHelper.Response.Endpoints[i].EndpointUrl.replace(/\s+/g, '');   // cache the URL and remove all whitespaces
                
                if( urlString.indexOf("opc.tcp://:") >= 0 ) { // if Hostname is empty
                    addError("The EndpointURL [" + i + "] contains no Hostname. URL: " + urlString );
                }
                else if( urlString.indexOf("opc.tcp://0.0.0.0:") >= 0 || urlString.indexOf("opc.tcp://255.255.255.255:") >= 0 ) { // if Hostname is invalid IP
                    addError("The EndpointURL [" + i + "] contains an invalid IP as it's Hostname. URL: " + urlString );
                }
                else if( urlString.indexOf("opc.tcp://localhost:") >= 0 || urlString.indexOf("opc.tcp://127.0.0.1:") >= 0 ) { // if Hostname is localhost or 127.0.0.1, issue a warning
                    addWarning("EndpointURL [" + i + "] Returning localhost or 127.0.0.1 in the EndpointUrls can lead to applications not being able to connect to the server. It is recommended to return a usable default hostname/IP Address. URL: " + urlString );
                }
            }// for i
        }
        else{
            addError("GetEndpoint response returned no Endpoints!");
            return( false );
        }
    }
    return( true );
}

Test.Execute( { Procedure: getEndpointsErr001 } );