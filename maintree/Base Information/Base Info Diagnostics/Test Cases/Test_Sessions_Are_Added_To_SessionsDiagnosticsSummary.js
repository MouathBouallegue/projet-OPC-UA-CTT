/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Sessions are added to SessionsDiagnosticsSummary. */

Test.Execute( { Procedure: function test() { 
    // get a baseline of the number of sessions currently in the diagnostics
    _sessionsSummaryNode.BrowseDirection = BrowseDirection.Forward;
    _sessionsSummaryNode.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } ) ) {
        var initialSessionCount = BrowseHelper.Response.Results[0].References.length;


        // create another session and read the number of session in the diagnostics
        var session2 = SessionCreator.Connect( { InstanciateHelpers: false } );
        if( session2.result ) {

            // count the sessions in diags now (should be +1)
            BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
            Assert.Equal( 1 + initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to increment by one" );

            // close the new session and read again
            SessionCreator.Disconnect( session2 );
            BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
            Assert.Equal( initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to decrement by one" );

            // in a loop of max 5, create sessions and check the diagnostics
            var sessions = [];
            var sessionCount = Settings.ServerTest.Capabilities.MaxSupportedSessions - 1 < 5 ? Settings.ServerTest.Capabilities.MaxSupportedSessions - 1 : 5;
            for( var t=0; t<sessionCount; t++ ) {
                sessions[t] = SessionCreator.Connect( { InstanciateHelpers: false } );
                if( sessions[t].result ) {
                    // count the sessions in diags now (should be +1)
                    BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
                    Assert.Equal( ( 1 + t ) + initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to increment with each new session added", "# of sessions in diagnostics grew to: " + BrowseHelper.Response.Results[0].References.length );
                }
                else break;
            }//for t...
            for( var s = 0; s < sessions.length; s++ ) SessionCreator.Disconnect( sessions[s] );
        }
    }
    return( true );
} } );