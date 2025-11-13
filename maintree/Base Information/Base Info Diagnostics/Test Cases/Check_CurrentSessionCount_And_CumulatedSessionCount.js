/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Create sessions and check they are reported in CurrentSessionCount and CumulatedSessionCount */

Test.Execute( { Procedure: function test() {
    // get a base-line of the current number of sessions
    if( ReadHelper.Execute( { NodesToRead: [ _currSessionCountNode, _cumulSessionCountNode ] } ) ) {
        var initialCount = _currSessionCountNode.Value.Value.toUInt32();
        var initialCumul = _cumulSessionCountNode.Value.Value.toUInt32();

        // Test 1: neither value is zero
        Assert.NotEqual( 0, initialCount, "Initial count of sessions is zero which is impossible because the CTT currently has a session open to conduct this test." );
        Assert.NotEqual( 0, initialCumul, "Initial cumulative count of sessions is zero which is impossible because the CTT currently has a session open to conduct this test." );

        // Test 2: disconnect the session and recreate a new one.
        CloseSessionHelper.Execute( { Session: Test.Session } );
        Test.Session = new CreateSessionService( { Channel: Test.Channel } );
        Test.Session.Execute();
        ActivateSessionHelper.Execute( { Session: Test.Session } );
        InstanciateHelpers( { Session: Test.Session } );

        // Test 3: read the diagnostics again
        //         the # of session might stay the same, or not, it doesn't really matter per se
        //         but the cumulative # of sessions should increase
        if( ReadHelper.Execute( { NodesToRead: [ _currSessionCountNode, _cumulSessionCountNode ] } ) ) {
            Assert.NotEqual( 0, _currSessionCountNode.Value.Value.toUInt32(), "Second count of sessions is zero which is impossible because the CTT currently has a session open to conduct this test." );
            Assert.GreaterThan( initialCumul, _cumulSessionCountNode.Value.Value.toUInt32(), "Cumulative session count did not grow." );
        }

        // Test 4: read the session objects and check the browse names to see if we can find the CTT's current session
        _sessionsSummaryNode.BrowseDirection = BrowseDirection.Forward;
        if( BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } ) ) {
            // iterate through all browse results
            var foundCttSession = false;
            for( var i=0; i<BrowseHelper.Response.Results[0].References.length; i++ ) {
                if( Test.Session.Request.SessionName.toString() == BrowseHelper.Response.Results[0].References[i].BrowseName.Name ) {
                    foundCttSession = true;
                    break;
                }
            }//for i..
            Assert.True( foundCttSession, "CTT Session '" + Test.Session.Request.SessionName + "' not found in diagnostics summary.", "CTT Session '" + Test.Session.Request.SessionName + "' found in Diagnostics." );
        }
    }
    return( true );
} } );