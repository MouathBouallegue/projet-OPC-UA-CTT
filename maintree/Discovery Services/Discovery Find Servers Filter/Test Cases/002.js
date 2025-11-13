/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Use several serverUris to restrict the list of servers (obtain list with no filter 
    then use the necessary number of servers as the filter). This test is only possible on a discovery server.
    Expected results: Service result = “Good”. Only appropriate servers are returned. */

function findServers551003() {
    var epFilter = readSetting( "/Server Test/Server URL" ).toString();
    // call findservers to obtain a raw list of endpoints
    if( !FindServersHelper.Execute( { EndpointUrl: epFilter } ) ) return( false );

    var rawEndpoints = FindServersHelper.Response.clone();
    print( "raw endpoints: " + rawEndpoints.toString() );

    // make sure that we have AT LEAST one endpoint returned 
    if( Assert.GreaterThan( 0, FindServersHelper.Response.Servers.length, "Expected FindServers to return at least one server." ) ) {
        // now to build a list of servers to request 
        if( FindServersHelper.Response.Servers.length < 2 ) {
            addSkipped( "Not enough servers to test. We need a minimum of 2, yet there are only " + FindServersHelper.Response.Servers.length + " servers returned by FindServers when requested over endpoint: '" + epFilter + "'. This test is intended to be ran against an actual Discovery Server." );
            return( false );
        }

        // flag to store if the server support redundancy
        var redundancySupported = false;

        // prepare a list of servers to request in a filter
        var serverFilter = [];

        /// use the first two server uris only.
        for( var s=0; s<2; s++ ) {
            // server may return endpoints that exist for redundant servers
            if( epFilter !== FindServersHelper.Response.Servers[s].DiscoveryUrls[0] ) {
                // check the address-space to see if redundancy is supported
                // read the RedundancySupport node's value:
                var nodeRedundancySupport = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerRedundancy_RedundancySupport ) )[0];
                if( Assert.True( ReadHelper.Execute( { NodesToRead: nodeRedundancySupport } ), "Unable to read the RedundancySupport node, which is Mandatory." ) ) {
                    // we have a problem if redundancy is not supported
                    if( Assert.NotEqual( RedundancySupport.None, nodeRedundancySupport.Value.Value.toInt32(), "RedundancySupport is NONE_0. This means the Server does not support Redundancy and is returning '" + FindServersHelper.Response.Servers[s].DiscoveryUrls[0] + "' which does not match the requested URL of '" + epFilter + "'." ) ) {
                        redundancySupported = true;
                    }
                }
            }
            else if( Assert.Equal( epFilter, FindServersHelper.Response.Servers[s].DiscoveryUrls[0], "Expected FindServers to return a DiscoveryUrl that matched the endpoint specified." ) ) {
                serverFilter.push( FindServersHelper.Response.Servers[s].ApplicationUri ); 
            }
        }

        // exit the test if redundancy is supported
        if( redundancySupported ) {
            addSkipped( "Redundancy supported. Skipping test." );
            return( true );
        }
        
        // call FindServers() requesting a subset of the serverUri filters.
        FindServersHelper.Execute( { EndpointUrl: epFilter, ServerUris: serverFilter } );

        // now to check the results match our expectations; we'll assume the order received
        // matches the request...
        Assert.Equal( serverFilter.length, FindServersHelper.Response.Servers.length, "Expected FindServers() to respond with the same number of items as requested." );
        for( var r=0; r<FindServersHelper.Response.Servers.length; r++ ) {
            Assert.Equal( serverFilter[r], FindServersHelper.Response.Servers[r].ApplicationUri, "FindServers().Response.Servers[" + r + "].ApplicationUri does not match the requested ServerUri." );
        }
    }
    return( true );
}// function findServers551003()

Test.Execute( { Procedure: findServers551003 } );